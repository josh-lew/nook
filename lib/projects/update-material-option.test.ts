import { createMockProjectsClient } from "./test-utils";
import { updateMaterialOption } from "./update-material-option";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const oldScreenshot =
  "https://abc.supabase.co/storage/v1/object/sign/project-photos/user-1/project-1/1700000000000-old.jpg?token=xyz";
const newScreenshot =
  "https://abc.supabase.co/storage/v1/object/sign/project-photos/user-1/project-1/1700000000001-new.jpg?token=xyz";

describe("updateMaterialOption", () => {
  it("marks a Material Option as chosen", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "material-1" }, error: null },
    });

    const result = await updateMaterialOption(
      "material-1",
      { is_selected: true },
      client,
    );

    expect(result).toEqual({ data: { id: "material-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "project_materials",
        kind: "update",
        values: { is_selected: true },
        filters: [{ method: "eq", column: "id", value: "material-1" }],
      },
    ]);
  });

  it("unmarks a chosen Material Option", async () => {
    const client = createMockProjectsClient({});

    await updateMaterialOption("material-1", { is_selected: false }, client);

    expect(client.calls[0]).toMatchObject({ values: { is_selected: false } });
  });

  it("saves an edited link and comment trimmed, and a blank one as cleared", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: { id: "material-1" }, error: null },
    });

    const result = await updateMaterialOption(
      "material-1",
      {
        url: "  https://example.com/merino  ",
        photo_url: null,
        comment: "   ",
      },
      client,
    );

    expect(result).toEqual({ data: { id: "material-1" }, error: null });
    expect(client.calls.find((call) => call.kind === "update")).toMatchObject({
      values: {
        url: "https://example.com/merino",
        photo_url: null,
        comment: null,
      },
    });
  });

  it("removes the old screenshot from storage when it's replaced", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: { photo_url: oldScreenshot }, error: null },
      insertResult: { data: { id: "material-1" }, error: null },
    });

    const result = await updateMaterialOption(
      "material-1",
      { photo_url: newScreenshot },
      client,
    );

    expect(result).toEqual({ data: { id: "material-1" }, error: null });
    expect(client.calls).toEqual([
      {
        table: "project_materials",
        kind: "select",
        columns: "photo_url",
        filters: [{ method: "eq", column: "id", value: "material-1" }],
      },
      {
        table: "project_materials",
        kind: "update",
        values: { photo_url: newScreenshot },
        filters: [{ method: "eq", column: "id", value: "material-1" }],
      },
      {
        bucket: "project-photos",
        kind: "remove",
        paths: ["user-1/project-1/1700000000000-old.jpg"],
      },
    ]);
  });

  it("keeps the old screenshot when the update fails", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: { photo_url: oldScreenshot }, error: null },
      insertResult: { data: null, error: { message: "denied" } },
    });

    await updateMaterialOption("material-1", { photo_url: null }, client);

    expect(client.calls.map((call) => call.kind)).toEqual(["select", "update"]);
  });

  it("refuses to clear both the link and the screenshot", async () => {
    const client = createMockProjectsClient({});

    const result = await updateMaterialOption(
      "material-1",
      { url: "  ", photo_url: null, comment: "Soft" },
      client,
    );

    expect(result).toEqual({
      data: null,
      error: "A material needs a link or a screenshot.",
    });
    expect(client.calls).toEqual([]);
  });

  it("returns a Supabase error message on failure", async () => {
    const client = createMockProjectsClient({
      insertResult: { data: null, error: { message: "denied" } },
    });

    const result = await updateMaterialOption(
      "material-1",
      { is_selected: true },
      client,
    );

    expect(result).toEqual({ data: null, error: "denied" });
  });
});
