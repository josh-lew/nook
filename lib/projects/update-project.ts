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
  const values: UpdateProjectInput = { ...input };

  if (input.title !== undefined) {
    values.title = input.title.trim();
    if (!values.title) {
      return { data: null, error: "A title can't be blank." };
    }
  }

  // A hobby can be changed but never cleared
  if ("hobby_type" in input && !input.hobby_type) {
    return { data: null, error: "A hobby can't be cleared." };
  }

  if (input.description !== undefined) {
    values.description = input.description?.trim() || null;
  }

  const { data, error } = await client
    .from("projects")
    .update(values)
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
