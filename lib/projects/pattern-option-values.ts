import type { DataResult, PatternOptionInput } from "./types";

type PatternOptionValues = {
  url: string | null;
  photo_url: string | null;
  comment: string | null;
};

/** Links are often typed or pasted without a scheme, which won't open. */
function normalizeUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Tidies a Pattern Option's fields; it must keep a link or a screenshot. */
export function toPatternOptionValues(
  input: PatternOptionInput,
): DataResult<PatternOptionValues> {
  const values = {
    url: normalizeUrl(input.url),
    photo_url: input.photo_url?.trim() || null,
    comment: input.comment?.trim() || null,
  };

  if (!values.url && !values.photo_url) {
    return {
      data: null,
      error: "A Pattern Option needs a link or a screenshot.",
    };
  }

  return { data: values, error: null };
}
