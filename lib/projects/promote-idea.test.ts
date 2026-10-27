import { promoteIdea } from "./promote-idea";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

function updateCall(client: ReturnType<typeof createMockProjectsClient>) {
  const update = client.calls.find((call) => call.kind === "update");
  return update?.kind === "update" ? update : undefined;
}

describe("promoteIdea", () => {
  it("turns an Idea into a Planning Project at the bottom of the Planning ranking", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        {
          data: { status: "idea", description: "Saw it on Pinterest" },
          error: null,
        },
        { data: [{ plan_order: 0 }, { plan_order: 4 }, { plan_order: null }], error: null },
      ],
    });

    const result = await promoteIdea("idea-1", client);

    expect(result).toEqual({ data: null, error: null });
    expect(updateCall(client)).toEqual({
      table: "projects",
      kind: "update",
      values: {
        status: "planning",
        seed_description: "Saw it on Pinterest",
        plan_order: 5,
      },
      filters: [
        { method: "eq", column: "id", value: "idea-1" },
        { method: "eq", column: "user_id", value: "user-1" },
        { method: "eq", column: "status", value: "idea" },
      ],
    });
  });

  it("starts the Planning ranking at 0 when Planning is empty", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "idea", description: null }, error: null },
        { data: [], error: null },
      ],
    });

    await promoteIdea("idea-1", client);

    expect(updateCall(client)?.values).toMatchObject({
      plan_order: 0,
      seed_description: null,
    });
  });

  it.each(["planning", "in_progress", "completed"])(
    "rejects a %s Project without writing anything",
    async (status) => {
      const client = createMockProjectsClient({
        queryResult: { data: { status, description: null }, error: null },
      });

      const result = await promoteIdea("project-1", client);

      expect(result.data).toBeNull();
      expect(result.error).toMatch(/only an idea/i);
      expect(updateCall(client)).toBeUndefined();
    },
  );

  it("rejects an Idea that doesn't exist or isn't the user's", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: null },
    });

    const result = await promoteIdea("missing", client);

    expect(result).toEqual({ data: null, error: "Idea not found." });
    expect(updateCall(client)).toBeUndefined();
  });

  it("reports an Idea promoted elsewhere between the read and the write", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "idea", description: null }, error: null },
        { data: [], error: null },
      ],
      // The status guard matched no row
      insertResult: { data: null, error: null },
    });

    const result = await promoteIdea("idea-1", client);

    expect(result).toEqual({ data: null, error: "Only an Idea can be promoted." });
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await promoteIdea("idea-1", client);

    expect(result.error).toMatch(/signed in/i);
    expect(client.calls).toEqual([]);
  });

  it("returns a Supabase error message on update failure", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "idea", description: null }, error: null },
        { data: [], error: null },
      ],
      updateResult: { data: null, error: { message: "denied" } },
    });

    const result = await promoteIdea("idea-1", client);

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
