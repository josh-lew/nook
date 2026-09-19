import { supabase } from "../supabase";
import type {
  DataResult,
  ProjectsSupabaseClient,
  UpdateProjectInput,
} from "./types";

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const { data, error } = await client
    .from("projects")
    .update(input)
    .eq("id", projectId)
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "Project was updated but no id was returned." };
  }

  return { data: { id: data.id }, error: null };
}
