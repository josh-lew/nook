import type {
  ProjectsDeleteBuilder,
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

type QueryResult = {
  data: unknown;
  error: { message: string } | null;
};

export type MockFilter =
  | { method: "eq" | "is"; column: string; value: unknown }
  | { method: "in"; column: string; values: readonly unknown[] }
  | { method: "not"; column: string; operator: string; value: unknown };

/** One call to `client.from(table)`, with the filters chained onto it. */
export type MockCall =
  | { table: string; kind: "insert"; values: unknown }
  | { table: string; kind: "select"; columns?: string; filters: MockFilter[] }
  | { table: string; kind: "update"; values: unknown; filters: MockFilter[] }
  | { table: string; kind: "delete"; filters: MockFilter[] };

type FilteredCall = Exclude<MockCall, { kind: "insert" }>;

type OnUpdate = (values: unknown, column: string, value: unknown) => void;

export type MockProjectsClient = ProjectsSupabaseClient & {
  /** Every recorded call, in order, so tests can assert on what was written. */
  calls: MockCall[];
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

/** Filter methods that record onto `call` and return the builder for chaining. */
function createFilterMethods<Builder>(
  call: FilteredCall,
  getBuilder: () => Builder,
) {
  const record = (filter: MockFilter) => {
    call.filters.push(filter);
    return getBuilder();
  };
  return {
    eq: (column: string, value: string | number | boolean) =>
      record({ method: "eq", column, value }),
    is: (column: string, value: null) =>
      record({ method: "is", column, value }),
    in: (column: string, values: readonly (string | number)[]) =>
      record({ method: "in", column, values }),
    not: (
      column: string,
      operator: string,
      value: string | number | boolean | null,
    ) => record({ method: "not", column, operator, value }),
  };
}

function createQueryBuilder(
  call: FilteredCall,
  result: QueryResult,
): ProjectsQueryBuilder {
  const builder: ProjectsQueryBuilder = {
    ...createFilterMethods(call, () => builder),
    order: () => builder,
    single: () => Promise.resolve(result),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

function createDeleteBuilder(
  call: FilteredCall,
  result: UpdateResult,
): ProjectsDeleteBuilder {
  const builder: ProjectsDeleteBuilder = {
    ...createFilterMethods(call, () => builder),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

function createUpdateBuilder(
  call: FilteredCall,
  values: unknown,
  result: UpdateResult,
  insertResult: InsertResult,
  onUpdate?: OnUpdate,
): ProjectsUpdateBuilder {
  const filters = createFilterMethods(call, () => builder);
  const builder: ProjectsUpdateBuilder = {
    eq: (column, value) => {
      onUpdate?.(values, column, value);
      return filters.eq(column, value);
    },
    in: (column, ids) => {
      onUpdate?.(values, column, ids);
      return filters.in(column, ids);
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
  deleteResult?: UpdateResult;
  queryResult?: QueryResult;
  /** Return a different result for each successive select call. */
  queryResults?: QueryResult[];
  onInsert?: (table: string, values: unknown) => void;
  /** Called for each `eq` or `in` filter on an update. */
  onUpdate?: OnUpdate;
  onSelect?: (table: string, columns?: string) => void;
}): MockProjectsClient {
  const insertResult = options.insertResult ?? {
    data: { id: "generated-id" },
    error: null,
  };
  const queryResult = options.queryResult ?? { data: [], error: null };
  let updateCallIndex = 0;
  let queryCallIndex = 0;
  const calls: MockCall[] = [];

  return {
    calls,
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
        calls.push({ table, kind: "insert", values });
        return createInsertBuilder(insertResult);
      },
      update: (values: unknown) => {
        const result =
          options.updateResults?.[updateCallIndex++] ??
          options.updateResult ?? { data: null, error: null };
        const call: FilteredCall = {
          table,
          kind: "update",
          values,
          filters: [],
        };
        calls.push(call);
        return createUpdateBuilder(
          call,
          values,
          result,
          insertResult,
          options.onUpdate,
        );
      },
      delete: () => {
        const call: FilteredCall = { table, kind: "delete", filters: [] };
        calls.push(call);
        return createDeleteBuilder(
          call,
          options.deleteResult ?? { data: null, error: null },
        );
      },
      select: (columns?: string) => {
        options.onSelect?.(table, columns);
        const call: FilteredCall = {
          table,
          kind: "select",
          columns,
          filters: [],
        };
        calls.push(call);
        return createQueryBuilder(
          call,
          options.queryResults?.[queryCallIndex++] ?? queryResult,
        );
      },
    }),
  } as MockProjectsClient;
}
