export type HobbyType = "crochet" | "knit" | "sewing";

/** Where a Project is in its life. An Idea has no Stage. */
export type Stage = "planning" | "in_progress" | "completed";

/** The stored `projects.status`: a Project's Stage, or `idea` for an Idea. */
export type ProjectStatus = "idea" | Stage;

/** A photo's stage: `idea` marks an Idea's photos, which become the Seed when Promoted. */
export type PhotoStage = "idea" | Stage;

export type DataResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type InsertProjectInput = {
  title: string;
  hobby_type: HobbyType;
  status?: Stage;
  pattern_file_url?: string | null;
};

export type InsertIdeaInput = {
  title: string;
  hobby_type: HobbyType;
  description?: string | null;
};

export type InsertProjectMaterialInput = {
  name?: string | null;
  url?: string | null;
  photo_url?: string | null;
  comment?: string | null;
  is_selected?: boolean;
};

/** A candidate pattern: a link and/or screenshot, with an optional comment. */
export type PatternOptionInput = {
  url?: string | null;
  photo_url?: string | null;
  comment?: string | null;
};

/** Edits to a Material Option; `is_selected` marks it as chosen. */
export type UpdateMaterialOptionInput = {
  url?: string | null;
  photo_url?: string | null;
  comment?: string | null;
  is_selected?: boolean;
};

export type UpdateProjectInput = {
  pattern_file_url?: string | null;
  title?: string;
  hobby_type?: HobbyType;
  status?: Stage;
  description?: string | null;
};

export type InsertPatternFileInput = {
  file_url: string;
  name: string;
  content_type: string;
};

export type PhotoType = "inspiration" | "material" | "progress" | "finished";

export type InsertProjectPhotoInput = {
  image_url: string;
  stage?: PhotoStage;
  photo_type?: PhotoType;
  is_primary?: boolean;
};

/** Singular insert: photo_type is required; no inference in the data layer. */
export type InsertProjectPhotoArgs = {
  image_url: string;
  stage: PhotoStage;
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
  in: (
    column: string,
    values: readonly (string | number)[],
  ) => ProjectsUpdateBuilder;
  select: (columns?: string) => {
    single: () => Promise<{
      data: { id: string } | null;
      error: { message: string } | null;
    }>;
    /** Like `single`, but no matching row is `data: null` rather than an error. */
    maybeSingle: () => Promise<{
      data: { id: string } | null;
      error: { message: string } | null;
    }>;
  };
} & PromiseLike<{
  data: unknown;
  error: { message: string } | null;
}>;

export type ProjectsDeleteBuilder = {
  eq: (column: string, value: string | boolean) => ProjectsDeleteBuilder;
  in: (
    column: string,
    values: readonly (string | number)[],
  ) => ProjectsDeleteBuilder;
  /** Returns the deleted rows, so callers can tell a delete that matched nothing. */
  select: (columns?: string) => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>;
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
    delete: () => ProjectsDeleteBuilder;
    select: (columns?: string) => ProjectsQueryBuilder;
  };
};

/** Storage access for data-layer functions that clean up stored files. */
export type ProjectsStorageClient = {
  storage: {
    from: (bucket: string) => {
      remove: (paths: string[]) => Promise<{
        data: unknown;
        error: { message: string } | null;
      }>;
    };
  };
};

export type ProjectsQueryBuilder = {
  eq: (
    column: string,
    value: string | number | boolean,
  ) => ProjectsQueryBuilder;
  is: (column: string, value: null) => ProjectsQueryBuilder;
  in: (
    column: string,
    values: readonly (string | number)[],
  ) => ProjectsQueryBuilder;
  not: (
    column: string,
    operator: string,
    value: string | number | boolean | null,
  ) => ProjectsQueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => ProjectsQueryBuilder;
  single: () => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
  /** Like `single`, but no matching row is `data: null` rather than an error. */
  maybeSingle: () => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
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
