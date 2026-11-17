import { supabase } from "../supabase";
import { hasPattern } from "./derive-pattern";
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

/** A Stage's list. Only In progress has Paused Projects; they sit below the active ones. */
export type StageList = {
  active: ProjectListItem[];
  paused: ProjectListItem[];
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

type NestedPatternOption = {
  id: string;
  is_selected: boolean | null;
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
  paused_at: string | null;
  pattern_files: NestedPatternFile[] | null;
  project_photos: NestedPhoto[] | null;
  project_materials: NestedMaterial[] | null;
  pattern_options: NestedPatternOption[] | null;
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
    hasPattern: hasPattern(row.pattern_options, row.pattern_files),
    hasMaterial: Boolean(row.project_materials?.length),
    materialName: pickMaterialName(row.project_materials),
    createdAt: row.created_at,
  };
}

/** Rank ascending; unranked Projects sink to the bottom, keeping the query's newest-first order. */
function compareRank(a: ProjectListRow, b: ProjectListRow): number {
  if (a.plan_order === b.plan_order) return 0;
  if (a.plan_order === null) return 1;
  if (b.plan_order === null) return -1;
  return a.plan_order - b.plan_order;
}

export async function getProjectsByStatus(
  stage: Stage,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<StageList>> {
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
      paused_at,
      project_photos ( id, image_url, created_at, is_primary ),
      project_materials ( id, name, is_selected, created_at ),
      pattern_options ( id, is_selected ),
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
  // Only In progress is ranked here; other Stages keep the query's order
  const ordered = stage === "in_progress" ? [...rows].sort(compareRank) : rows;
  return {
    data: {
      active: ordered
        .filter((row) => row.paused_at === null)
        .map(mapProjectListRow),
      paused: ordered
        .filter((row) => row.paused_at !== null)
        .map(mapProjectListRow),
    },
    error: null,
  };
}
