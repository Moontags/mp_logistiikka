'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  fetchAddressSuggestions,
  loadPlaces,
  newSession,
  MIN_QUERY_LENGTH,
  type AddressSession,
  type AddressSuggestion,
} from '@/lib/places';

const DEBOUNCE_MS = 250;
/** Height of the fixed nav – the list must never slide underneath it. */
const NAV_OFFSET = 72;
/** Vertical gap between the input and the list. Keep in sync with globals.css. */
const GAP = 6;
const MAX_LIST_HEIGHT = 288;
const MIN_LIST_HEIGHT = 108;
/** Below this much room under the input we flip the list above the field. */
const FLIP_THRESHOLD = 168;

type Placement = { side: 'below' | 'above'; maxHeight: number };

/**
 * The slice of the layout viewport the user can actually see.
 *
 * getBoundingClientRect works in layout-viewport coordinates; visualViewport
 * tells us where the visible slice sits inside it, and it is the thing that
 * actually shrinks when the mobile keyboard opens (`innerHeight` often does not).
 */
function visibleBand() {
  const viewport = window.visualViewport;
  return {
    top: Math.max(viewport ? viewport.offsetTop : 0, NAV_OFFSET),
    bottom: viewport ? viewport.offsetTop + viewport.height : window.innerHeight,
  };
}

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Address field with our own suggestion list.
 *
 * The list is rendered inside the field's `position: relative` parent instead of
 * relying on Google's widgets: the legacy `Autocomplete` appends a
 * `pac-container` to <body> and positions it once, which lands in the wrong
 * place on mobile as soon as the keyboard opens and the page scrolls, and
 * `PlaceAutocompleteElement` puts its dropdown in a shadow DOM we cannot
 * reposition. Both made the suggestions render off-screen on phones.
 */
export default function AddressAutocomplete({ label, value, onChange, placeholder }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sessionRef = useRef<AddressSession>(newSession());
  /** Invalidates in-flight prediction requests so late responses are dropped. */
  const requestIdRef = useRef(0);
  /** Invalidates an in-flight place-details request after further typing. */
  const selectionIdRef = useRef(0);

  // `null` = no active lookup (nothing typed yet, or a suggestion was picked).
  const [search, setSearch] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState<Placement>({
    side: 'below',
    maxHeight: MAX_LIST_HEIGHT,
  });

  const fieldId = useId();
  const listId = `${fieldId}-list`;
  const optionId = (index: number) => `${fieldId}-option-${index}`;

  // Warm the library up front so the first keystroke does not wait for it.
  useEffect(() => {
    loadPlaces().catch(() => {
      /* Reported per-query instead. */
    });
  }, []);

  /** Picks the side with room and caps the height to the visible band. */
  const updatePlacement = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const band = visibleBand();

    const spaceBelow = band.bottom - rect.bottom - GAP;
    const spaceAbove = rect.top - band.top - GAP;
    const side = spaceBelow < FLIP_THRESHOLD && spaceAbove > spaceBelow ? 'above' : 'below';
    const available = side === 'below' ? spaceBelow : spaceAbove;
    const maxHeight = Math.round(
      Math.max(MIN_LIST_HEIGHT, Math.min(MAX_LIST_HEIGHT, available)),
    );

    setPlacement((prev) =>
      prev.side === side && prev.maxHeight === maxHeight ? prev : { side, maxHeight },
    );
  }, []);

  /**
   * When the mobile keyboard opens it can leave the field below the fold, and an
   * anchored list follows the field off-screen. Pull the field just under the
   * nav so the whole visible band is left for the suggestions.
   */
  const ensureFieldVisible = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const band = visibleBand();
    if (rect.top >= band.top && rect.bottom <= band.bottom) return;

    // Instant, not smooth: the keyboard is animating at the same time and a
    // smooth scroll would keep the list moving under the user's finger.
    window.scrollBy({ top: rect.top - (band.top + 8), behavior: 'instant' });
  }, []);

  // Re-measure while the list is open: the keyboard opening/closing and any
  // scrolling (window or an inner scroll container) both move the field.
  useEffect(() => {
    if (!open) return;

    const onViewportResize = () => {
      ensureFieldVisible();
      updatePlacement();
    };

    updatePlacement();
    const viewport = window.visualViewport;
    window.addEventListener('resize', onViewportResize);
    window.addEventListener('scroll', updatePlacement, true);
    viewport?.addEventListener('resize', onViewportResize);
    viewport?.addEventListener('scroll', updatePlacement);

    return () => {
      window.removeEventListener('resize', onViewportResize);
      window.removeEventListener('scroll', updatePlacement, true);
      viewport?.removeEventListener('resize', onViewportResize);
      viewport?.removeEventListener('scroll', updatePlacement);
    };
  }, [open, updatePlacement, ensureFieldVisible]);

  // Close when the pointer or focus moves elsewhere – this is also what closes
  // the first field when the user moves on to the second one.
  useEffect(() => {
    if (!open) return;

    const closeIfOutside = (event: Event) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('focusin', closeIfOutside);

    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('focusin', closeIfOutside);
    };
  }, [open]);

  // Debounced prediction lookup. The synchronous open/pending state is set in
  // handleInput instead, so this effect only ever updates state from the
  // resolved request.
  useEffect(() => {
    if (search === null) return;

    const query = search.trim();
    if (query.length < MIN_QUERY_LENGTH) return;

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      fetchAddressSuggestions(query, sessionRef.current)
        .then((next) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(next);
          setActiveIndex(-1);
          setPending(false);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setActiveIndex(-1);
          setPending(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Keep the keyboard-highlighted row visible without scrolling the page.
  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)?.scrollIntoView({
      block: 'nearest',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    // Drop a pending details lookup from an earlier selection.
    selectionIdRef.current++;
    onChange(next);
    setSearch(next);

    if (next.trim().length < MIN_QUERY_LENGTH) {
      requestIdRef.current++;
      setSuggestions([]);
      setActiveIndex(-1);
      setPending(false);
      setOpen(false);
      return;
    }

    // Open right away with a "searching" row: a field that looks dead for a
    // moment is what made customers think the calculator was stuck.
    // Measure before opening so the list never paints on the wrong side once.
    updatePlacement();
    setPending(true);
    setOpen(true);
  }

  async function selectSuggestion(suggestion: AddressSuggestion) {
    // Any queued prediction response is now stale.
    requestIdRef.current++;
    const selectionId = ++selectionIdRef.current;

    setOpen(false);
    setPending(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setSearch(null);

    // Show the prediction text right away, then swap in the full formatted
    // address (with postal code and city) once the details request returns.
    onChange([suggestion.primary, suggestion.secondary].filter(Boolean).join(', '));

    const resolved = await suggestion.resolve();
    sessionRef.current = newSession();
    if (resolved && selectionId === selectionIdRef.current) onChange(resolved);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open || suggestions.length === 0) return;
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + step;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Enter' && open && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]);
    }
  }

  return (
    <div className="form-group">
      <label htmlFor={fieldId}>{label}</label>
      <div className="addr-field" ref={wrapperRef}>
        <input
          id={fieldId}
          ref={inputRef}
          className="addr-input"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (search === null || suggestions.length === 0) return;
            updatePlacement();
            setOpen(true);
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        />

        {open && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            aria-label={`${label} – osoite-ehdotukset`}
            className={`addr-suggestions addr-suggestions--${placement.side}`}
            style={{ maxHeight: placement.maxHeight }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className="addr-option"
                // Keep focus on the input so the mobile keyboard does not close
                // and re-open (which would move the field mid-tap).
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => void selectSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="addr-option-primary">{suggestion.primary}</span>
                {suggestion.secondary && (
                  <span className="addr-option-secondary">{suggestion.secondary}</span>
                )}
              </li>
            ))}

            {suggestions.length === 0 && (
              <li role="presentation" className="addr-status">
                {pending ? 'Haetaan osoitteita…' : 'Ei osoite-ehdotuksia'}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
