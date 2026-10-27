import { supabase } from "../supabase";
import { toPatternOptionValues } from "./pattern-option-values";
import type {
  DataResult,
  PatternOptionInput,
  ProjectsSupabaseClient,
} from "./types";

/** Replaces a Pattern Option's link, screenshot and comment. */
export async function updatePatternOption(
  optionId: string,
  input: PatternOptionInput,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ id: string }>> {
  const values = toPatternOptionValues(input);
  if (values.error) {
    return { data: null, error: values.error };
  }

  const { data, error } = await client
    .from("pattern_options")
    .update(values.data)
    .eq("id", optionId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.id) {
    return { data: null, error: "The Pattern Option couldn't be updated." };
  }

  return { data: { id: data.id }, error: null };
}
