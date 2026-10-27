import { supabase } from "../supabase";
import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
} from "./types";

/**
 * Makes a Pattern Option the Project's Pattern, switching from any earlier
 * choice. Passing `null` clears the Pattern.
 */
export async function choosePatternOption(
  projectId: string,
  optionId: string | null,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<null>> {
  const { data: project, error: projectError } = await client
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();

  if (projectError) {
    return { data: null, error: projectError.message };
  }

  // Ideas share the projects table but only weigh up options
  const status = (project as { status: ProjectStatus } | null)?.status;
  if (!status || status === "idea") {
    return { data: null, error: "Only a Project can have a Pattern." };
  }

  if (optionId !== null) {
    // Check first, so a stale or foreign option can't clear the current Pattern
    const { data: owned, error: ownedError } = await client
      .from("pattern_options")
      .select("id")
      .eq("id", optionId)
      .eq("project_id", projectId);

    if (ownedError) {
      return { data: null, error: ownedError.message };
    }

    if (!(owned as { id: string }[] | null)?.length) {
      return { data: null, error: "That Pattern Option couldn't be chosen." };
    }
  }

  // At most one option is selected per project, so clear before selecting
  const { error: clearError } = await client
    .from("pattern_options")
    .update({ is_selected: false })
    .eq("project_id", projectId)
    .eq("is_selected", true);

  if (clearError) {
    return { data: null, error: clearError.message };
  }

  if (optionId === null) {
    return { data: null, error: null };
  }

  const { error: selectError } = await client
    .from("pattern_options")
    .update({ is_selected: true })
    .eq("id", optionId)
    .eq("project_id", projectId);

  if (selectError) {
    return { data: null, error: selectError.message };
  }

  return { data: null, error: null };
}
