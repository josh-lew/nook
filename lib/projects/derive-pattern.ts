export type PatternFile = {
  id: string;
  fileUrl: string;
  name: string;
  contentType: string;
};

/** A Project's Pattern: a link and/or Pattern Files. */
export type Pattern = {
  /** The chosen Pattern Option, or null when the Pattern is only files. */
  optionId: string | null;
  url: string | null;
  files: PatternFile[];
};

type PatternOptionRow = {
  id: string;
  url?: string | null;
  is_selected: boolean | null;
};

/** A Project has a Pattern once a Pattern Option is chosen or a Pattern File is added. */
export function hasPattern(
  options: PatternOptionRow[] | null | undefined,
  files: readonly unknown[] | null | undefined,
): boolean {
  return Boolean(options?.some((option) => option.is_selected) || files?.length);
}

/**
 * The Pattern is derived: the chosen Pattern Option's link (if any) plus every
 * Pattern File. With neither a chosen option nor a file, the Project has no Pattern.
 */
export function derivePattern(
  options: PatternOptionRow[] | null | undefined,
  files: PatternFile[],
): Pattern | null {
  if (!hasPattern(options, files)) {
    return null;
  }

  const chosen = options?.find((option) => option.is_selected);

  return {
    optionId: chosen?.id ?? null,
    url: chosen?.url ?? null,
    files,
  };
}
