import { supabase } from "../supabase";
import { toPatternOptionValues } from "./pattern-option-values";
import type {
  DataResult,
  PatternOptionInput,
  ProjectsSupabaseClient,
} from "./types";

/** Saves a candidate pattern on an Idea or a Project. */
export async function insertPatternOption(
  projectId: string,
  input: PatternOptionInput,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const values = toPatternOptionValues(input);
  if (values.error) {
    return { data: null, error: values.error };
  }

  const { data, error } = await client
    .from("pattern_options")
    .insert({ project_id: projectId, ...values.data })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return {
      data: null,
      error: "Pattern Option was saved but no id was returned.",
    };
  }

  return { data: { id: data.id }, error: null };
}
