export type PatternFile = {
  id: string;
  fileUrl: string;
  name: string;
  contentType: string;
};

/** A Project's Pattern: a link and/or Pattern Files. */
export type Pattern = {
  url: string | null;
  files: PatternFile[];
};

/**
 * The Pattern is derived: the chosen Pattern Option's link (if any) plus every
 * Pattern File. With neither, the Project has no Pattern.
 */
export function derivePattern(
  url: string | null,
  files: PatternFile[],
): Pattern | null {
  if (!url && files.length === 0) {
    return null;
  }

  return { url, files };
}
