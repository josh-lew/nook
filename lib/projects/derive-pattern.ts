/** A Project's Pattern: derived from its chosen Pattern Option. */
export type ProjectPattern = {
  optionId: string;
  url: string | null;
};

type PatternOptionRow = {
  id: string;
  url?: string | null;
  is_selected: boolean | null;
};

/** The chosen Pattern Option's link makes up the Pattern; none chosen means no Pattern. */
export function derivePattern(
  options: PatternOptionRow[] | null | undefined,
): ProjectPattern | null {
  const chosen = options?.find((option) => option.is_selected);
  if (!chosen) {
    return null;
  }

  return { optionId: chosen.id, url: chosen.url ?? null };
}
