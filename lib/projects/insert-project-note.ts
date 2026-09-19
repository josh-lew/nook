import { supabase } from "../supabase";
import type { DataResult, ProjectsSupabaseClient } from "./types";

export type InsertProjectNoteResult =
  | { id: string }
  | { skipped: true };

export async function insertProjectNote(
  projectId: string,
  content: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<InsertProjectNoteResult>> {
  const trimmed = content.trim();

  if (!trimmed) {
    return { data: { skipped: true }, error: null };
  }

  const { data, error } = await client
    .from("project_notes")
    .insert({
      project_id: projectId,
      stage: "planning",
      content: trimmed,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "Note was created but no id was returned." };
  }

  return { data: { id: data.id }, error: null };
}
