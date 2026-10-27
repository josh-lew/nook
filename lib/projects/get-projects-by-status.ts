import { supabase } from "../supabase";
import type {
  DataResult,
  HobbyType,
  ProjectsSupabaseClient,
  Stage,
} from "./types";

export type ProjectListItem = {
  id: string;
  title: string;
  hobbyType: HobbyType;
  stage: Stage;
  photoUrl: string | null;
  hasPattern: boolean;
  hasMaterial: boolean;
  materialName: string | null;
  createdAt: string;
};

type NestedPhoto = {
  id: string;
  image_url: string;
  created_at: string;
  is_primary: boolean;
};

type NestedMaterial = {
  id: string;
  name: string | null;
  is_selected: boolean | null;
  created_at: string;
};

type NestedPatternFile = {
  id: string;
};

export type ProjectListRow = {
  id: string;
  title: string;
  hobby_type: HobbyType;
  status: Stage;
  created_at: string;
  plan_order: number | null;
  pattern_files: NestedPatternFile[] | null;
  project_photos: NestedPhoto[] | null;
  project_materials: NestedMaterial[] | null;
};

export function pickLatestPhotoUrl(
  photos: NestedPhoto[] | null | undefined,
): string | null {
  if (!photos?.length) {
    return null;
  }

  const sorted = [...photos].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return sorted[0]?.image_url ?? null;
}

export function pickProjectPhotoUrl(
  photos: NestedPhoto[] | null | undefined,
): string | null {
  if (!photos?.length) {
    return null;
  }

  const primary = photos.find((photo) => photo.is_primary);
  if (primary?.image_url) {
    return primary.image_url;
  }

  return pickLatestPhotoUrl(photos);
}

export function pickMaterialName(
  materials: NestedMaterial[] | null | undefined,
): string | null {
  if (!materials?.length) {
    return null;
  }

  const selected = materials.find(
    (material) => material.is_selected && material.name?.trim(),
  );
  if (selected?.name?.trim()) {
    return selected.name.trim();
  }

  const sorted = [...materials].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const firstNamed = sorted.find((material) => material.name?.trim());
  return firstNamed?.name?.trim() ?? null;
}

export function mapProjectListRow(row: ProjectListRow): ProjectListItem {
  return {
    id: row.id,
    title: row.title,
    hobbyType: row.hobby_type,
    stage: row.status,
    photoUrl: pickProjectPhotoUrl(row.project_photos),
    // A chosen Pattern Option will also count once ticket 05 lands
    hasPattern: Boolean(row.pattern_files?.length),
    hasMaterial: Boolean(row.project_materials?.length),
    materialName: pickMaterialName(row.project_materials),
    createdAt: row.created_at,
  };
}

export async function getProjectsByStatus(
  stage: Stage,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<ProjectListItem[]>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to view projects." };
  }

  const { data, error } = await client
    .from("projects")
    .select(
      `
      id,
      title,
      hobby_type,
      status,
      created_at,
      plan_order,
      project_photos ( id, image_url, created_at, is_primary ),
      project_materials ( id, name, is_selected, created_at ),
      pattern_files ( id )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", stage)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const rows = (data ?? []) as ProjectListRow[];
  return {
    data: rows.map(mapProjectListRow),
    error: null,
  };
}
