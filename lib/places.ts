/**
 * Thin wrapper around the Google Maps "Places" library.
 *
 * The library is loaded by the <Script> tag in app/layout.tsx, so only the
 * members we actually call are typed here. Predictions come from the new
 * `AutocompleteSuggestion` API; the legacy `AutocompleteService` is kept as a
 * fallback for older API keys (Google no longer serves it to keys created after
 * March 2025, and it warns in the console when it is used).
 *
 * Nothing here renders UI – the suggestion list is rendered by
 * components/AddressAutocomplete.tsx so that it stays inside our own DOM
 * instead of the <body>-level `pac-container` the old widget appended.
 */

type GooglePlace = {
  fetchFields: (opts: { fields: string[] }) => Promise<{ place?: GooglePlace } | undefined>;
  formattedAddress?: string | null;
  displayName?: string | null;
};

/** `PlacePrediction.text` & friends – a text object with match offsets. */
type FormattableText = { text?: string; toString: () => string } | null;

type PlacePrediction = {
  placeId: string;
  text: FormattableText;
  mainText: FormattableText;
  secondaryText: FormattableText;
  toPlace: () => GooglePlace;
};

type LegacyPrediction = {
  place_id: string;
  description: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
};

type LegacyAutocompleteService = {
  getPlacePredictions: (
    request: {
      input: string;
      componentRestrictions?: { country: string };
      sessionToken?: object;
    },
    callback: (predictions: LegacyPrediction[] | null, status: string) => void,
  ) => void;
};

type LegacyPlacesService = {
  getDetails: (
    request: { placeId: string; fields: string[]; sessionToken?: object },
    callback: (result: { formatted_address?: string; name?: string } | null, status: string) => void,
  ) => void;
};

type PlacesNamespace = {
  AutocompleteSessionToken?: new () => object;
  AutocompleteSuggestion?: {
    fetchAutocompleteSuggestions: (request: {
      input: string;
      includedRegionCodes?: string[];
      language?: string;
      region?: string;
      sessionToken?: object;
    }) => Promise<{ suggestions?: { placePrediction: PlacePrediction | null }[] }>;
  };
  AutocompleteService?: new () => LegacyAutocompleteService;
  PlacesService?: new (attrContainer: HTMLElement) => LegacyPlacesService;
};

declare global {
  interface Window {
    google?: { maps?: { places?: PlacesNamespace } };
  }
}

/** One row in our own suggestion list. */
export type AddressSuggestion = {
  /** React key – the place id when available. */
  id: string;
  /** First line, e.g. "Keskuskatu 5". */
  primary: string;
  /** Second line, e.g. "Riihimäki, Suomi". Empty when Google gives only one line. */
  secondary: string;
  /**
   * The full address to feed to /api/distance. Resolved lazily – we only pay for
   * the place details request when the user actually picks this suggestion.
   */
  resolve: () => Promise<string>;
};

/**
 * Groups the keystrokes of one address lookup with its final details request so
 * Google bills them as a single autocomplete session. Start a new one after
 * every selection.
 */
export type AddressSession = { token?: object };

export const MIN_QUERY_LENGTH = 2;

const REGION_CODE = 'fi';
const LANGUAGE = 'fi';
const POLL_INTERVAL_MS = 150;
const LOAD_TIMEOUT_MS = 15_000;

export function newSession(): AddressSession {
  return {};
}

let placesPromise: Promise<PlacesNamespace> | null = null;

/** Resolves once the <Script>-loaded Places library is available on `window`. */
export function loadPlaces(): Promise<PlacesNamespace> {
  if (placesPromise) return placesPromise;

  placesPromise = new Promise<PlacesNamespace>((resolve, reject) => {
    const ready = window.google?.maps?.places;
    if (ready) {
      resolve(ready);
      return;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const places = window.google?.maps?.places;
      if (places) {
        clearInterval(timer);
        resolve(places);
        return;
      }
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        clearInterval(timer);
        // Allow a later call to retry instead of caching the failure forever.
        placesPromise = null;
        reject(new Error('Google Places library did not load.'));
      }
    }, POLL_INTERVAL_MS);
  });

  return placesPromise;
}

function tokenFor(places: PlacesNamespace, session?: AddressSession): object | undefined {
  if (!session) return undefined;
  if (!session.token && places.AutocompleteSessionToken) {
    try {
      session.token = new places.AutocompleteSessionToken();
    } catch {
      // Session tokens are a billing optimisation, not a requirement.
    }
  }
  return session.token;
}

function textOf(value: FormattableText): string {
  if (!value) return '';
  return typeof value.text === 'string' ? value.text : String(value);
}

function fromPlacePrediction(prediction: PlacePrediction): AddressSuggestion {
  const full = textOf(prediction.text);
  const primary = textOf(prediction.mainText) || full;
  const secondary = textOf(prediction.secondaryText);

  return {
    id: prediction.placeId || full,
    primary,
    secondary,
    resolve: async () => {
      try {
        const place = prediction.toPlace();
        const result = await place.fetchFields({ fields: ['formattedAddress', 'displayName'] });
        const resolved = result?.place ?? place;
        return resolved.formattedAddress || resolved.displayName || full;
      } catch {
        return full;
      }
    },
  };
}

let legacyPredictionService: LegacyAutocompleteService | null = null;
let legacyDetailsService: LegacyPlacesService | null = null;

function fromLegacyPrediction(
  prediction: LegacyPrediction,
  places: PlacesNamespace,
  token: object | undefined,
): AddressSuggestion {
  const full = prediction.description;

  return {
    id: prediction.place_id || full,
    primary: prediction.structured_formatting?.main_text || full,
    secondary: prediction.structured_formatting?.secondary_text || '',
    resolve: () =>
      new Promise<string>((resolve) => {
        if (!legacyDetailsService && places.PlacesService) {
          // getDetails needs an element to render the mandatory attributions into.
          legacyDetailsService = new places.PlacesService(document.createElement('div'));
        }
        if (!legacyDetailsService) {
          resolve(full);
          return;
        }
        legacyDetailsService.getDetails(
          {
            placeId: prediction.place_id,
            fields: ['formatted_address', 'name'],
            ...(token ? { sessionToken: token } : {}),
          },
          (result) => resolve(result?.formatted_address || result?.name || full),
        );
      }),
  };
}

/**
 * Fetches address predictions for `input`, restricted to Finland.
 *
 * Returns an empty list for queries that are too short, and throws only if the
 * Places library itself is unreachable.
 */
export async function fetchAddressSuggestions(
  input: string,
  session?: AddressSession,
): Promise<AddressSuggestion[]> {
  const query = input.trim();
  if (query.length < MIN_QUERY_LENGTH) return [];

  const places = await loadPlaces();
  const token = tokenFor(places, session);

  if (places.AutocompleteSuggestion) {
    const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: query,
      includedRegionCodes: [REGION_CODE],
      language: LANGUAGE,
      region: REGION_CODE,
      ...(token ? { sessionToken: token } : {}),
    });
    return (suggestions ?? [])
      .map((suggestion) => suggestion.placePrediction)
      .filter((prediction): prediction is PlacePrediction => Boolean(prediction))
      .map(fromPlacePrediction);
  }

  if (places.AutocompleteService) {
    if (!legacyPredictionService) legacyPredictionService = new places.AutocompleteService();
    const service = legacyPredictionService;
    const predictions = await new Promise<LegacyPrediction[]>((resolve) => {
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: REGION_CODE },
          ...(token ? { sessionToken: token } : {}),
        },
        (result) => resolve(result ?? []),
      );
    });
    return predictions.map((prediction) => fromLegacyPrediction(prediction, places, token));
  }

  return [];
}
