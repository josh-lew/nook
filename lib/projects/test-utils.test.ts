import { createMockProjectsClient } from "./test-utils";

describe("createMockProjectsClient", () => {
  it("records a delete with its filters and resolves the delete result", async () => {
    const client = createMockProjectsClient({
      deleteResult: { data: null, error: { message: "delete failed" } },
    });

    const result = await client
      .from("pattern_files")
      .delete()
      .eq("id", "file-1");

    expect(result).toEqual({ data: null, error: { message: "delete failed" } });
    expect(client.calls).toEqual([
      {
        table: "pattern_files",
        kind: "delete",
        filters: [{ method: "eq", column: "id", value: "file-1" }],
      },
    ]);
  });

  it("records a multi-row delete filtered with in", async () => {
    const client = createMockProjectsClient({});

    await client.from("pattern_files").delete().in("id", ["file-1", "file-2"]);

    expect(client.calls).toEqual([
      {
        table: "pattern_files",
        kind: "delete",
        filters: [{ method: "in", column: "id", values: ["file-1", "file-2"] }],
      },
    ]);
  });

  it("records the values of each insert", async () => {
    const client = createMockProjectsClient({});

    await client.from("pattern_options").insert([{ url: "a" }, { url: "b" }]);

    expect(client.calls).toEqual([
      {
        table: "pattern_options",
        kind: "insert",
        values: [{ url: "a" }, { url: "b" }],
      },
    ]);
  });

  it("records the values and filters of each multi-row update", async () => {
    const client = createMockProjectsClient({});

    await client
      .from("projects")
      .update({ rank: 1 })
      .in("id", ["project-1", "project-2"]);
    await client.from("projects").update({ rank: 2 }).eq("id", "project-3");

    expect(client.calls).toEqual([
      {
        table: "projects",
        kind: "update",
        values: { rank: 1 },
        filters: [
          { method: "in", column: "id", values: ["project-1", "project-2"] },
        ],
      },
      {
        table: "projects",
        kind: "update",
        values: { rank: 2 },
        filters: [{ method: "eq", column: "id", value: "project-3" }],
      },
    ]);
  });

  it("resolves each successive select with its own result", async () => {
    const client = createMockProjectsClient({
      queryResults: [
        { data: { status: "idea" }, error: null },
        { data: [{ rank: 3 }], error: null },
      ],
    });

    const first = await client.from("projects").select("status").single();
    const second = await client.from("projects").select("rank");

    expect(first).toEqual({ data: { status: "idea" }, error: null });
    expect(second).toEqual({ data: [{ rank: 3 }], error: null });
  });

  it("records a select filtered with in and not and resolves the query result", async () => {
    const rows = [{ id: "project-1" }];
    const client = createMockProjectsClient({
      queryResult: { data: rows, error: null },
    });

    const result = await client
      .from("projects")
      .select("id")
      .in("hobby_type", ["knit", "crochet"])
      .not("status", "eq", "idea");

    expect(result).toEqual({ data: rows, error: null });
    expect(client.calls).toEqual([
      {
        table: "projects",
        kind: "select",
        columns: "id",
        filters: [
          { method: "in", column: "hobby_type", values: ["knit", "crochet"] },
          { method: "not", column: "status", operator: "eq", value: "idea" },
        ],
      },
    ]);
  });
});
