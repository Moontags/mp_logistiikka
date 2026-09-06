function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
}

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
);

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
);

/** Pin the API version. Bump deliberately, never to "today". */
export const apiVersion = '2026-09-06';

/** Where the standalone Studio runs. Used by Visual Editing to build edit links. */
export const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? 'http://localhost:3333';
