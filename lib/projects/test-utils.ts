import type { ProjectsSupabaseClient } from "./types";

type InsertResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

export function createInsertBuilder(result: InsertResult) {
  const promise = Promise.resolve({
    data: result.data as unknown,
    error: result.error,
  });

  return Object.assign(promise, {
    select: () => ({
      single: () => Promise.resolve(result),
    }),
  });
}

export function createMockProjectsClient(options: {
  user?: { id: string } | null;
  userError?: { message: string } | null;
  insertResult?: InsertResult;
  onInsert?: (table: string, values: unknown) => void;
}): ProjectsSupabaseClient {
  const insertResult = options.insertResult ?? {
    data: { id: "generated-id" },
    error: null,
  };

  return {
    auth: {
      getUser: async () => ({
        data: {
          user: options.user === undefined ? { id: "user-1" } : options.user,
        },
        error: options.userError ?? null,
      }),
    },
    from: (table: string) => ({
      insert: (values: unknown) => {
        options.onInsert?.(table, values);
        return createInsertBuilder(insertResult);
      },
    }),
  } as ProjectsSupabaseClient;
}
