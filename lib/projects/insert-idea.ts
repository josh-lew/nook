import { supabase } from "../supabase";
import type {
  DataResult,
  InsertIdeaInput,
  ProjectsSupabaseClient,
} from "./types";

export async function insertIdea(
  input: InsertIdeaInput,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const title = input.title.trim();
  if (!title) {
    return { data: null, error: "An idea needs a title." };
  }

  if (!input.hobby_type) {
    return { data: null, error: "An idea needs a hobby." };
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to save an idea." };
  }

  const { data: rankRows, error: rankError } = await client
    .from("projects")
    .select("plan_order")
    .eq("user_id", user.id)
    .eq("status", "idea")
    .is("deleted_at", null);

  if (rankError) {
    return { data: null, error: rankError.message };
  }

  const ranks = ((rankRows ?? []) as { plan_order: number | null }[])
    .map((row) => row.plan_order)
    .filter((rank): rank is number => rank !== null);
  const nextRank = ranks.length > 0 ? Math.max(...ranks) + 1 : 0;

  const { data, error } = await client
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      description: input.description?.trim() || null,
      hobby_type: input.hobby_type,
      status: "idea",
      plan_order: nextRank,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "Idea was created but no id was returned." };
  }

  return { data: { id: data.id }, error: null };
}
