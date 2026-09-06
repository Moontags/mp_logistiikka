import 'server-only';

/**
 * Viewer token used for draft previews and the Presentation tool.
 * Published content is readable without it, so it stays optional.
 */
export const token = process.env.SANITY_API_READ_TOKEN || undefined;
