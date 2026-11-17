import { nextRank } from "./next-rank";
import type { DataResult, ProjectsSupabaseClient, Stage } from "./types";

/**
 * The rank that places a Project at the bottom of a Stage's list. In progress
 * has two lists, Active and Paused, ranked separately.
 */
export async function rankAtBottom(
  userId: string,
  stage: Stage,
  paused: boolean,
  client: ProjectsSupabaseClient,
): Promise<DataResult<number>> {
  const query = client
    .from("projects")
    .select("plan_order")
    .eq("user_id", userId)
    .eq("status", stage);

  const { data: rankRows, error } = await (paused
    ? query.not("paused_at", "is", null)
    : query.is("paused_at", null)
  ).is("deleted_at", null);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: nextRank(rankRows), error: null };
}
