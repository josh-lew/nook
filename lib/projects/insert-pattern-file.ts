import { supabase } from "../supabase";
import type {
  DataResult,
  InsertPatternFileInput,
  ProjectsSupabaseClient,
} from "./types";

/** Attaches an uploaded file to the Project's Pattern; no Pattern Option is needed. */
export async function insertPatternFile(
  projectId: string,
  file: InsertPatternFileInput,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const { data, error } = await client
    .from("pattern_files")
    .insert({
      project_id: projectId,
      file_url: file.file_url,
      name: file.name,
      content_type: file.content_type,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return {
      data: null,
      error: "Pattern File was created but no id was returned.",
    };
  }

  return { data: { id: data.id }, error: null };
}
