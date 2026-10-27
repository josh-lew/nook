import { supabase } from "../supabase";
import { nextRank } from "./next-rank";
import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
} from "./types";

/**
 * Turns an Idea into a Project in Planning. Nothing new is asked for: the
 * hobby stays on the row, and the description is frozen as the Seed's.
 */
export async function promoteIdea(
  ideaId: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to promote an idea." };
  }

  const { data: idea, error: ideaError } = await client
    .from("projects")
    .select("status, description")
    .eq("id", ideaId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (ideaError) {
    return { data: null, error: ideaError.message };
  }

  const row = idea as {
    status: ProjectStatus;
    description: string | null;
  } | null;

  if (!row) {
    return { data: null, error: "Idea not found." };
  }

  if (row.status !== "idea") {
    return { data: null, error: "Only an Idea can be promoted." };
  }

  // A Promoted Idea joins the bottom of the Planning ranking
  const { data: rankRows, error: rankError } = await client
    .from("projects")
    .select("plan_order")
    .eq("user_id", user.id)
    .eq("status", "planning")
    .is("deleted_at", null);

  if (rankError) {
    return { data: null, error: rankError.message };
  }

  const { data: promoted, error } = await client
    .from("projects")
    .update({
      // promoted_at is stamped by a trigger (11_promote_ideas.sql) on the database clock
      status: "planning",
      seed_description: row.description,
      plan_order: nextRank(rankRows),
    })
    .eq("id", ideaId)
    .eq("user_id", user.id)
    // Guards against the row being promoted in between the read and the write
    .eq("status", "idea")
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!promoted) {
    return { data: null, error: "Only an Idea can be promoted." };
  }

  return { data: null, error: null };
}
