import {
  getProjectsByStatus,
  mapProjectListRow,
  pickLatestPhotoUrl,
  pickMaterialName,
  pickProjectPhotoUrl,
  type ProjectListRow,
} from "./get-projects-by-status";
import { createMockProjectsClient } from "./test-utils";

jest.mock("../supabase", () => ({
  supabase: {},
}));

const sampleRow: ProjectListRow = {
  id: "p1",
  title: "Scarf",
  hobby_type: "knit",
  status: "planning",
  created_at: "2026-01-02T00:00:00Z",
  plan_order: null,
  pattern_files: [{ id: "f1" }],
  project_photos: [
    {
      id: "ph1",
      image_url: "https://example.com/old.jpg",
      created_at: "2026-01-01T00:00:00Z",
      is_primary: false,
    },
    {
      id: "ph2",
      image_url: "https://example.com/new.jpg",
      created_at: "2026-01-03T00:00:00Z",
      is_primary: false,
    },
  ],
  project_materials: [
    {
      id: "m1",
      name: "First yarn",
      is_selected: false,
      created_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "m2",
      name: "Chosen yarn",
      is_selected: true,
      created_at: "2026-01-02T00:00:00Z",
    },
  ],
  pattern_options: [
    { id: "po1", is_selected: false },
    { id: "po2", is_selected: true },
  ],
};

describe("pickLatestPhotoUrl", () => {
  it("returns the most recent photo url", () => {
    expect(pickLatestPhotoUrl(sampleRow.project_photos)).toBe(
      "https://example.com/new.jpg",
    );
  });

  it("returns null when there are no photos", () => {
    expect(pickLatestPhotoUrl([])).toBeNull();
  });
});

describe("pickProjectPhotoUrl", () => {
  it("prefers the primary photo over a newer non-primary", () => {
    expect(
      pickProjectPhotoUrl([
        {
          id: "ph1",
          image_url: "https://example.com/primary.jpg",
          created_at: "2026-01-01T00:00:00Z",
          is_primary: true,
        },
        {
          id: "ph2",
          image_url: "https://example.com/newer.jpg",
          created_at: "2026-01-03T00:00:00Z",
          is_primary: false,
        },
      ]),
    ).toBe("https://example.com/primary.jpg");
  });

  it("falls back to the latest photo when none is primary", () => {
    expect(pickProjectPhotoUrl(sampleRow.project_photos)).toBe(
      "https://example.com/new.jpg",
    );
  });

  it("returns null when there are no photos", () => {
    expect(pickProjectPhotoUrl([])).toBeNull();
  });
});

describe("pickMaterialName", () => {
  it("prefers the selected material", () => {
    expect(pickMaterialName(sampleRow.project_materials)).toBe("Chosen yarn");
  });

  it("falls back to the earliest named material", () => {
    expect(
      pickMaterialName([
        {
          id: "m2",
          name: "Later",
          is_selected: false,
          created_at: "2026-01-02T00:00:00Z",
        },
        {
          id: "m1",
          name: "Earlier",
          is_selected: false,
          created_at: "2026-01-01T00:00:00Z",
        },
      ]),
    ).toBe("Earlier");
  });
});

describe("mapProjectListRow", () => {
  it("maps nested relations into list card fields", () => {
    expect(mapProjectListRow(sampleRow)).toEqual({
      id: "p1",
      title: "Scarf",
      hobbyType: "knit",
      stage: "planning",
      photoUrl: "https://example.com/new.jpg",
      hasPattern: true,
      hasMaterial: true,
      materialName: "Chosen yarn",
      createdAt: "2026-01-02T00:00:00Z",
    });
  });

  it("has a Pattern once an option is chosen or a Pattern File is added", () => {
    expect(mapProjectListRow(sampleRow).hasPattern).toBe(true);
    expect(
      mapProjectListRow({ ...sampleRow, pattern_files: [] }).hasPattern,
    ).toBe(true);
    expect(
      mapProjectListRow({
        ...sampleRow,
        pattern_options: [{ id: "po1", is_selected: false }],
      }).hasPattern,
    ).toBe(true);
  });

  it("has no Pattern while Pattern Options are only being weighed up", () => {
    expect(
      mapProjectListRow({
        ...sampleRow,
        pattern_options: [{ id: "po1", is_selected: false }],
        pattern_files: [],
      }).hasPattern,
    ).toBe(false);
    expect(
      mapProjectListRow({
        ...sampleRow,
        pattern_options: null,
        pattern_files: null,
      }).hasPattern,
    ).toBe(false);
  });

  it("uses the primary photo when present", () => {
    expect(
      mapProjectListRow({
        ...sampleRow,
        project_photos: [
          {
            id: "ph1",
            image_url: "https://example.com/primary.jpg",
            created_at: "2026-01-01T00:00:00Z",
            is_primary: true,
          },
          {
            id: "ph2",
            image_url: "https://example.com/newer.jpg",
            created_at: "2026-01-03T00:00:00Z",
            is_primary: false,
          },
        ],
      }).photoUrl,
    ).toBe("https://example.com/primary.jpg");
  });
});

describe("getProjectsByStatus", () => {
  it("returns mapped projects for the current user", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: [sampleRow], error: null },
    });

    const result = await getProjectsByStatus("planning", client);

    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      {
        id: "p1",
        title: "Scarf",
        hobbyType: "knit",
        stage: "planning",
        photoUrl: "https://example.com/new.jpg",
        hasPattern: true,
        hasMaterial: true,
        materialName: "Chosen yarn",
        createdAt: "2026-01-02T00:00:00Z",
      },
    ]);
  });

  it("only asks for Projects in the Stage, so Ideas never appear", async () => {
    const client = createMockProjectsClient({});

    await getProjectsByStatus("planning", client);

    expect(client.calls).toEqual([
      expect.objectContaining({
        table: "projects",
        kind: "select",
        filters: expect.arrayContaining([
          { method: "eq", column: "status", value: "planning" },
        ]),
      }),
    ]);
    expect(client.calls[0]).not.toMatchObject({
      filters: expect.arrayContaining([
        { method: "eq", column: "status", value: "idea" },
      ]),
    });
  });

  it("returns an error when the user is not signed in", async () => {
    const client = createMockProjectsClient({ user: null });

    const result = await getProjectsByStatus("planning", client);

    expect(result.data).toBeNull();
    expect(result.error).toMatch(/signed in/i);
  });

  it("returns a Supabase error message", async () => {
    const client = createMockProjectsClient({
      queryResult: { data: null, error: { message: "permission denied" } },
    });

    const result = await getProjectsByStatus("in_progress", client);

    expect(result).toEqual({ data: null, error: "permission denied" });
  });
});
