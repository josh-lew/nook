import { supabase } from "../supabase";
import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
} from "./types";

type OptionRow = { id: string; is_selected: boolean | null };

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
    .maybeSingle();

  if (projectError) {
    return { data: null, error: projectError.message };
  }

  const status = (project as { status: ProjectStatus } | null)?.status;
  if (!status) {
    return { data: null, error: "Project not found." };
  }

  // Ideas share the projects table but only weigh up options
  if (status === "idea") {
    return { data: null, error: "Only a Project can have a Pattern." };
  }

  const { data: options, error: optionsError } = await client
    .from("pattern_options")
    .select("id, is_selected")
    .eq("project_id", projectId);

  if (optionsError) {
    return { data: null, error: optionsError.message };
  }

  const rows = (options ?? []) as OptionRow[];
  // Check first, so a stale or foreign option can't clear the current Pattern
  if (optionId !== null && !rows.some((row) => row.id === optionId)) {
    return { data: null, error: "That Pattern Option couldn't be chosen." };
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

  const select = (id: string) =>
    client
      .from("pattern_options")
      .update({ is_selected: true })
      .eq("id", id)
      .eq("project_id", projectId);

  const { error: selectError } = await select(optionId);

  if (selectError) {
    // The two updates aren't atomic: put the earlier Pattern back rather than leave none
    const previous = rows.find((row) => row.is_selected);
    if (previous) {
      await select(previous.id);
    }
    return { data: null, error: selectError.message };
  }

  return { data: null, error: null };
}
