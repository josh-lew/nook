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

export type UpdateProjectInput = {
  pattern_file_url?: string | null;
  title?: string;
  hobby_type?: HobbyType;
  status?: ProjectStatus;
};

export type PhotoType = "inspiration" | "material" | "progress" | "finished";

export type InsertProjectPhotoInput = {
  image_url: string;
  stage?: NoteStage;
  photo_type?: PhotoType;
  is_primary?: boolean;
};

/** Singular insert: photo_type is required; no inference in the data layer. */
export type InsertProjectPhotoArgs = {
  image_url: string;
  stage: NoteStage;
  photo_type: "inspiration" | "progress" | "finished";
  is_primary?: boolean;
};

/**
 * Injectable client. The real `supabase` instance is passed through `unknown`
 * at call sites; tests supply a hand-rolled mock with the same call shape.
 */
export type ProjectsUpdateBuilder = {
  eq: (
    column: string,
    value: string | boolean,
  ) => ProjectsUpdateBuilder;
  select: (columns?: string) => {
    single: () => Promise<{
      data: { id: string } | null;
      error: { message: string } | null;
    }>;
  };
} & PromiseLike<{
  data: unknown;
  error: { message: string } | null;
}>;

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
    update: (values: unknown) => ProjectsUpdateBuilder;
    select: (columns?: string) => ProjectsQueryBuilder;
  };
};

export type ProjectsQueryBuilder = {
  eq: (column: string, value: string) => ProjectsQueryBuilder;
  is: (column: string, value: null) => ProjectsQueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => ProjectsQueryBuilder;
} & PromiseLike<{
  data: unknown;
  error: { message: string } | null;
}>;
export type UploadFile = {
  uri: string;
  name: string;
  type: string;
  /** Optional base64 payload from image picker — preferred on Android. */
  base64?: string;
};

/** Injectable client for storage uploads. */
export type UploadsSupabaseClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        body: ArrayBuffer | Blob,
        options?: { contentType?: string; upsert?: boolean },
      ) => Promise<{
        data: { path: string } | null;
        error: { message: string } | null;
      }>;
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{
        data: { signedUrl: string } | null;
        error: { message: string } | null;
      }>;
    };
  };
};
