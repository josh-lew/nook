import { supabase } from "../supabase";
import type {
  DataResult,
  InsertProjectInput,
  ProjectsSupabaseClient,
} from "./types";

export async function insertProject(
  input: InsertProjectInput,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to create a project." };
  }

  const { data, error } = await client
    .from("projects")
    .insert({
      user_id: user.id,
      title: input.title,
      hobby_type: input.hobby_type,
      status: input.status ?? "planning",
      pattern_file_url: input.pattern_file_url ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "Project was created but no id was returned." };
  }

  return { data: { id: data.id }, error: null };
}
