import { supabase } from "../supabase";
import type {
  DataResult,
  InsertProjectMaterialInput,
  ProjectsSupabaseClient,
} from "./types";

export async function insertProjectMaterials(
  projectId: string,
  materials: InsertProjectMaterialInput[],
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<{ count: number }>> {
  if (materials.length === 0) {
    return { data: { count: 0 }, error: null };
  }

  const rows = materials.map((material) => ({
    project_id: projectId,
    name: material.name ?? null,
    url: material.url ?? null,
    photo_url: material.photo_url ?? null,
    comment: material.comment ?? null,
    ...(material.is_selected !== undefined
      ? { is_selected: material.is_selected }
      : {}),
  }));

  const { error } = await client.from("project_materials").insert(rows);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: { count: materials.length }, error: null };
}
