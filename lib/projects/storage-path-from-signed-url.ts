/** Signed URLs look like `.../object/sign/<bucket>/<path>?token=...`. */
export function storagePathFromSignedUrl(
  url: string,
  bucket: string,
): string | null {
  const marker = `/object/sign/${bucket}/`;
  const start = url.indexOf(marker);
  if (start === -1) {
    return null;
  }

  const encoded = url.slice(start + marker.length).split("?")[0];
  try {
    return decodeURIComponent(encoded) || null;
  } catch {
    return null;
  }
}
