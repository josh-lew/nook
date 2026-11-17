import { supabase } from "../supabase";
import { loadOwnProject } from "./load-own-project";
import { rankAtBottom } from "./rank-at-bottom";
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
  const { data: project, error: projectError } = await loadOwnProject(
    projectId,
    "move",
    client,
  );

  if (!project) {
    return { data: null, error: projectError };
  }

  const from = project.status;

  if (!ALLOWED_MOVES[from].includes(to)) {
    return {
      data: null,
      error: `Can't move a Project from ${STATUS_NAMES[from]} to ${STATUS_NAMES[to]}.`,
    };
  }

  let planOrder: number | null = null;

  // Completed is ordered by completion date, so only the other Stages are ranked
  if (to !== "completed") {
    // Every move lands Active, so it joins the Active ranking
    const { data: rank, error: rankError } = await rankAtBottom(
      project.userId,
      to,
      false,
      client,
    );

    if (rank === null) {
      return { data: null, error: rankError };
    }

    planOrder = rank;
  }

  const { data: moved, error } = await client
    .from("projects")
    .update({
      status: to,
      plan_order: planOrder,
      // Every move lands Active: completing a Paused Project clears Paused
      paused_at: null,
      // completed_at is set and cleared by a trigger (12_completed_at.sql) on the database clock
    })
    .eq("id", projectId)
    .eq("user_id", project.userId)
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
