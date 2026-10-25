import { supabase } from "../supabase";
import type { DataResult, ProjectsSupabaseClient } from "./types";

export type IdeaListItem = {
  id: string;
  title: string;
  photoUrl: string | null;
  createdAt: string;
};

type NestedPhoto = {
  id: string;
  image_url: string;
  created_at: string;
};

export type IdeaListRow = {
  id: string;
  title: string;
  created_at: string;
  plan_order: number | null;
  project_photos: NestedPhoto[] | null;
};

function pickFirstPhotoUrl(photos: NestedPhoto[] | null): string | null {
  if (!photos?.length) {
    return null;
  }

  const sorted = [...photos].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return sorted[0]?.image_url ?? null;
}

export function mapIdeaListRow(row: IdeaListRow): IdeaListItem {
  return {
    id: row.id,
    title: row.title,
    photoUrl: pickFirstPhotoUrl(row.project_photos),
    createdAt: row.created_at,
  };
}

/** Rank ascending; unranked Ideas sink to the bottom, oldest first. */
function compareRank(a: IdeaListRow, b: IdeaListRow): number {
  if (a.plan_order !== b.plan_order) {
    if (a.plan_order === null) return 1;
    if (b.plan_order === null) return -1;
    return a.plan_order - b.plan_order;
  }
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

export async function getIdeas(
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<IdeaListItem[]>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to view ideas." };
  }

  const { data, error } = await client
    .from("projects")
    .select(
      `
      id,
      title,
      created_at,
      plan_order,
      project_photos ( id, image_url, created_at )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "idea")
    .is("deleted_at", null);

  if (error) {
    return { data: null, error: error.message };
  }

  const rows = [...((data ?? []) as IdeaListRow[])].sort(compareRank);
  return {
    data: rows.map(mapIdeaListRow),
    error: null,
  };
}
