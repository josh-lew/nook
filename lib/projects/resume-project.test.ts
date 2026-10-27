import { resumeProject } from "./resume-project";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

function updateCall(client: ReturnType<typeof createMockProjectsClient>) {
  const update = client.calls.find((call) => call.kind === "update");
  return update?.kind === "update" ? update : undefined;
}

const PAUSED = { status: "in_progress", paused_at: "2026-10-01T00:00:00Z" };

describe("resumeProject", () => {
  it("clears Paused and places the Project at the bottom of the active ranking", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: PAUSED, error: null },
        { data: [{ plan_order: 0 }, { plan_order: 3 }], error: null },
      ],
    });

    const result = await resumeProject("project-1", client);

    expect(result).toEqual({ data: null, error: null });
    // Only active Projects are ranked against
    expect(client.calls[1]).toMatchObject({
      kind: "select",
      filters: expect.arrayContaining([
        { method: "eq", column: "status", value: "in_progress" },
        { method: "is", column: "paused_at", value: null },
      ]),
    });
    expect(updateCall(client)).toEqual({
      table: "projects",
      kind: "update",
      values: { paused_at: null, plan_order: 4 },
      filters: [
        { method: "eq", column: "id", value: "project-1" },
        { method: "eq", column: "user_id", value: "user-1" },
        { method: "eq", column: "status", value: "in_progress" },
        { method: "not", column: "paused_at", operator: "is", value: null },
      ],
    });
  });

  it.each([
    ["an active In progress Project", { status: "in_progress", paused_at: null }],
    ["a Planning Project", { status: "planning", paused_at: null }],
    ["a Completed Project", { status: "completed", paused_at: null }],
    ["an Idea", { status: "idea", paused_at: null }],
  ])("rejects %s without writing anything", async (_label, row) => {
    const client = createMockProjectsClient({
      queryResult: { data: row, error: null },
    });

    const result = await resumeProject("project-1", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/only a paused/i);
    expect(updateCall(client)).toBeUndefined();
  });

  it("rejects a Project that doesn't exist or isn't the user's", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: null },
    });

    const result = await resumeProject("missing", client);

    expect(result).toEqual({ data: null, error: "Project not found." });
  });

  it("reports a Project changed elsewhere between the read and the write", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: PAUSED, error: null },
        { data: [], error: null },
      ],
      insertResult: { data: null, error: null },
    });

    const result = await resumeProject("project-1", client);

    expect(result.error).toMatch(/changed elsewhere/i);
  });

  it("returns a Supabase error message when reading the ranking fails", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: PAUSED, error: null },
        { data: null, error: { message: "rank failed" } },
      ],
    });

    const result = await resumeProject("project-1", client);

    expect(result).toEqual({ data: null, error: "rank failed" });
    expect(updateCall(client)).toBeUndefined();
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await resumeProject("project-1", client);

    expect(result.error).toMatch(/signed in/i);
    expect(client.calls).toEqual([]);
  });
});
