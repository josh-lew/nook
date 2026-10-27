import { supabase } from "../supabase";
import { nextRank } from "./next-rank";
import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
  Stage,
} from "./types";

/** Where each status can move to. An Idea only leaves by being Promoted. */
const ALLOWED_MOVES: Record<ProjectStatus, readonly ProjectStatus[]> = {
  idea: [],
  planning: ["in_progress"],
  in_progress: ["completed"],
  completed: ["in_progress"],
};

const STATUS_NAMES: Record<ProjectStatus, string> = {
  idea: "Idea",
  planning: "Planning",
  in_progress: "In progress",
  completed: "Completed",
};

/**
 * Moves a Project to another Stage. Only Planning → In progress,
 * In progress → Completed and Completed → In progress are allowed.
 */
export async function changeStage(
  projectId: string,
  to: Stage,
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
    return { data: null, error: "You must be signed in to move a project." };
  }

  const { data: project, error: projectError } = await client
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (projectError) {
    return { data: null, error: projectError.message };
  }

  const from = (project as { status: ProjectStatus } | null)?.status;

  if (!from) {
    return { data: null, error: "Project not found." };
  }

  if (!ALLOWED_MOVES[from].includes(to)) {
    return {
      data: null,
      error: `Can't move a Project from ${STATUS_NAMES[from]} to ${STATUS_NAMES[to]}.`,
    };
  }

  let planOrder: number | null = null;

  // Completed is ordered by completion date, so only the other Stages are ranked
  if (to !== "completed") {
    const { data: rankRows, error: rankError } = await client
      .from("projects")
      .select("plan_order")
      .eq("user_id", user.id)
      .eq("status", to)
      .is("deleted_at", null);

    if (rankError) {
      return { data: null, error: rankError.message };
    }

    planOrder = nextRank(rankRows);
  }

  const { data: moved, error } = await client
    .from("projects")
    .update({
      status: to,
      plan_order: planOrder,
      // completed_at is set and cleared by a trigger (12_completed_at.sql) on the database clock
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
    // Guards against the Project being moved in between the read and the write
    .eq("status", from)
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!moved) {
    return {
      data: null,
      error: "This Project's Stage changed elsewhere. Reload and try again.",
    };
  }

  return { data: null, error: null };
}
