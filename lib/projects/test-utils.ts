import type {
  ProjectsQueryBuilder,
  ProjectsSupabaseClient,
  ProjectsUpdateBuilder,
} from "./types";

type InsertResult = {
  data: { id: string } | null;
  error: { message: string } | null;
};

type UpdateResult = {
  data: unknown;
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

function createQueryBuilder(result: {
  data: unknown;
  error: { message: string } | null;
}): ProjectsQueryBuilder {
  const builder: ProjectsQueryBuilder = {
    eq: () => builder,
    is: () => builder,
    order: () => builder,
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

function createUpdateBuilder(
  values: unknown,
  result: UpdateResult,
  insertResult: InsertResult,
  onUpdate?: (
    values: unknown,
    column: string,
    value: string | boolean,
  ) => void,
): ProjectsUpdateBuilder {
  const builder: ProjectsUpdateBuilder = {
    eq: (column: string, value: string | boolean) => {
      onUpdate?.(values, column, value);
      return builder;
    },
    select: () => ({
      single: () =>
        Promise.resolve({
          data: insertResult.data,
          error: result.error ?? insertResult.error,
        }),
    }),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

export function createMockProjectsClient(options: {
  user?: { id: string } | null;
  userError?: { message: string } | null;
  insertResult?: InsertResult;
  updateResult?: UpdateResult;
  /** Return a different result for each successive update call. */
  updateResults?: UpdateResult[];
  queryResult?: {
    data: unknown;
    error: { message: string } | null;
  };
  onInsert?: (table: string, values: unknown) => void;
  onUpdate?: (
    values: unknown,
    column: string,
    value: string | boolean,
  ) => void;
  onSelect?: (table: string, columns?: string) => void;
}): ProjectsSupabaseClient {
  const insertResult = options.insertResult ?? {
    data: { id: "generated-id" },
    error: null,
  };
  const queryResult = options.queryResult ?? { data: [], error: null };
  let updateCallIndex = 0;

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
      update: (values: unknown) => {
        const result =
          options.updateResults?.[updateCallIndex++] ??
          options.updateResult ?? { data: null, error: null };
        return createUpdateBuilder(
          values,
          result,
          insertResult,
          options.onUpdate,
        );
      },
      select: (columns?: string) => {
        options.onSelect?.(table, columns);
        return createQueryBuilder(queryResult);
      },
    }),
  } as ProjectsSupabaseClient;
}
