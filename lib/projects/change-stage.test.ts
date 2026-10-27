import { changeStage } from "./change-stage";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

function updateCall(client: ReturnType<typeof createMockProjectsClient>) {
  const update = client.calls.find((call) => call.kind === "update");
  return update?.kind === "update" ? update : undefined;
}

describe("changeStage", () => {
  it("starts a Planning Project at the bottom of the In progress ranking", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "planning" }, error: null },
        { data: [{ plan_order: 2 }, { plan_order: null }, { plan_order: 7 }], error: null },
      ],
    });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result).toEqual({ data: null, error: null });
    expect(updateCall(client)).toEqual({
      table: "projects",
      kind: "update",
      values: { status: "in_progress", plan_order: 8, completed_at: null },
      filters: [
        { method: "eq", column: "id", value: "project-1" },
        { method: "eq", column: "user_id", value: "user-1" },
        { method: "eq", column: "status", value: "planning" },
      ],
    });
  });

  it("reopens a Completed Project at the bottom of In progress and clears the completion date", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "completed" }, error: null },
        { data: [], error: null },
      ],
    });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result).toEqual({ data: null, error: null });
    expect(updateCall(client)?.values).toEqual({
      status: "in_progress",
      plan_order: 0,
      completed_at: null,
    });
    expect(updateCall(client)?.filters).toContainEqual({
      method: "eq",
      column: "status",
      value: "completed",
    });
  });

  it.each([
    ["planning", "planning"],
    ["planning", "completed"],
    ["in_progress", "planning"],
    ["in_progress", "in_progress"],
    ["completed", "planning"],
    ["completed", "completed"],
    ["idea", "planning"],
    ["idea", "in_progress"],
    ["idea", "completed"],
  ])("rejects %s → %s without writing anything", async (from, to) => {
    const client = createMockProjectsClient({
      queryResult: { data: { status: from }, error: null },
    });

    const result = await changeStage("project-1", to as "planning", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/can't move/i);
    expect(updateCall(client)).toBeUndefined();
  });

  it("rejects a move to Idea", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: { status: "planning" }, error: null },
    });

    // An untyped caller could still ask for it
    const result = await changeStage("project-1", "idea" as "planning", client);

    expect(result.error).toMatch(/can't move/i);
    expect(updateCall(client)).toBeUndefined();
  });

  it("rejects a Project that doesn't exist or isn't the user's", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: null },
    });

    const result = await changeStage("missing", "in_progress", client);

    expect(result).toEqual({ data: null, error: "Project not found." });
    expect(updateCall(client)).toBeUndefined();
  });

  it("reports a Project moved elsewhere between the read and the write", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "planning" }, error: null },
        { data: [], error: null },
      ],
      // The status guard matched no row
      insertResult: { data: null, error: null },
    });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/changed/i);
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result.error).toMatch(/signed in/i);
    expect(client.calls).toEqual([]);
  });

  it("returns a Supabase error message when reading the Project fails", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: { message: "read failed" } },
    });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result).toEqual({ data: null, error: "read failed" });
  });

  it("returns a Supabase error message when reading the ranking fails", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "planning" }, error: null },
        { data: null, error: { message: "rank failed" } },
      ],
    });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result).toEqual({ data: null, error: "rank failed" });
    expect(updateCall(client)).toBeUndefined();
  });

  it("returns a Supabase error message on update failure", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "planning" }, error: null },
        { data: [], error: null },
      ],
      updateResult: { data: null, error: { message: "denied" } },
    });

    const result = await changeStage("project-1", "in_progress", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });

  describe("completing", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2026-10-27T09:30:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("moves an In progress Project to Completed with the completion date", async () => {
      const client = createMockProjectsClient({
        queryResult: { data: { status: "in_progress" }, error: null },
      });

      const result = await changeStage("project-1", "completed", client);

      expect(result).toEqual({ data: null, error: null });
      expect(updateCall(client)).toEqual({
        table: "projects",
        kind: "update",
        // Completed is ordered by completion date, not a manual rank
        values: {
          status: "completed",
          plan_order: null,
          completed_at: "2026-10-27T09:30:00.000Z",
        },
        filters: [
          { method: "eq", column: "id", value: "project-1" },
          { method: "eq", column: "user_id", value: "user-1" },
          { method: "eq", column: "status", value: "in_progress" },
        ],
      });
    });
  });
});
