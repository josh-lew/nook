import { supabase } from "../supabase";
import { storagePathFromSignedUrl } from "./storage-path-from-signed-url";
import type {
  DataResult,
  ProjectsStorageClient,
  ProjectsSupabaseClient,
} from "./types";

// Screenshots upload alongside the Idea or Project's own photos
const PROJECT_PHOTOS_BUCKET = "project-photos";

type PatternOptionsClient = ProjectsSupabaseClient & ProjectsStorageClient;

/** Removes the Pattern Option, then its screenshot in the bucket if it had one. */
export async function deletePatternOption(
  optionId: string,
  client: PatternOptionsClient = supabase as unknown as PatternOptionsClient,
): Promise<DataResult<null>> {
  const { data, error } = await client
    .from("pattern_options")
    .delete()
    .eq("id", optionId)
    .select("id, photo_url");

  if (error) {
    return { data: null, error: error.message };
  }

  // RLS hides rows it blocks, so a refused delete returns no error, just no rows
  const deleted = (data ?? []) as { id: string; photo_url: string | null }[];
  if (deleted.length === 0) {
    return { data: null, error: "The Pattern Option couldn't be removed." };
  }

  const photoUrl = deleted[0].photo_url;
  const path = photoUrl
    ? storagePathFromSignedUrl(photoUrl, PROJECT_PHOTOS_BUCKET)
    : null;
  if (path) {
    // The option is already gone; a leftover file is only clutter
    await client.storage.from(PROJECT_PHOTOS_BUCKET).remove([path]);
  }

  return { data: null, error: null };
}
