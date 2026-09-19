export type HobbyType = "crochet" | "knit" | "sewing";

export type ProjectStatus = "planning" | "in_progress" | "completed";

export type NoteStage = "planning" | "in_progress" | "completed";

export type DataResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type InsertProjectInput = {
  title: string;
  hobby_type: HobbyType;
  status?: ProjectStatus;
  pattern_file_url?: string | null;
};

export type InsertProjectMaterialInput = {
  name?: string | null;
  url?: string | null;
  photo_url?: string | null;
  comment?: string | null;
  is_selected?: boolean;
};

/**
 * Injectable client. The real `supabase` instance is passed through `unknown`
 * at call sites; tests supply a hand-rolled mock with the same call shape.
 */
export type ProjectsSupabaseClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
  from: (table: string) => {
    insert: (values: unknown) => {
      select: (columns?: string) => {
        single: () => Promise<{
          data: { id: string } | null;
          error: { message: string } | null;
        }>;
      };
    } & Promise<{
      data: unknown;
      error: { message: string } | null;
    }>;
  };
};
