import { supabase } from "../supabase";
import { storagePathFromSignedUrl } from "./storage-path";
import type {
  DataResult,
  ProjectsStorageClient,
  ProjectsSupabaseClient,
} from "./types";

const PATTERN_FILES_BUCKET = "pattern-files";

type PatternFilesClient = ProjectsSupabaseClient & ProjectsStorageClient;

/** Removes the Pattern File row, then its file in the bucket. */
export async function deletePatternFile(
  fileId: string,
  client: PatternFilesClient = supabase as unknown as PatternFilesClient,
): Promise<DataResult<null>> {
  const { data, error } = await client
    .from("pattern_files")
    .delete()
    .eq("id", fileId)
    .select("id, file_url");

  if (error) {
    return { data: null, error: error.message };
  }

  // RLS hides rows it blocks, so a refused delete returns no error, just no rows
  const deleted = (data ?? []) as { id: string; file_url: string }[];
  if (deleted.length === 0) {
    return { data: null, error: "The Pattern File couldn't be removed." };
  }

  const path = storagePathFromSignedUrl(
    PATTERN_FILES_BUCKET,
    deleted[0].file_url,
  );
  if (path) {
    // The file is already gone from the Pattern; a leftover object is only clutter
    await client.storage.from(PATTERN_FILES_BUCKET).remove([path]);
  }

  return { data: null, error: null };
}
