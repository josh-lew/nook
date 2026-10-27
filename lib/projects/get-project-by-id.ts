import { supabase } from "../supabase";
import { derivePattern, type Pattern } from "./derive-pattern";
import { pickProjectPhotoUrl } from "./get-projects-by-status";
import type {
  DataResult,
  HobbyType,
  PhotoType,
  ProjectStatus,
  ProjectsSupabaseClient,
  Stage,
} from "./types";

export type ProjectDetailPhoto = {
  id: string;
  imageUrl: string;
  photoType: PhotoType | null;
  isPrimary: boolean;
  createdAt: string;
};

export type ProjectDetailMaterial = {
  id: string;
  name: string | null;
  url: string | null;
  photoUrl: string | null;
  comment: string | null;
  isSelected: boolean;
};

export type ProjectDetailPatternOption = {
  id: string;
  url: string | null;
  photoUrl: string | null;
  comment: string | null;
  isSelected: boolean;
};

export type ProjectDetailNote = {
  id: string;
  stage: Stage;
  content: string;
  createdAt: string;
};

export type ProjectDetail = {
  id: string;
  title: string;
  hobbyType: HobbyType;
  status: ProjectStatus;
  description: string | null;
  /** Derived from the chosen Pattern Option and the Pattern Files; null when there is none. */
  pattern: Pattern | null;
  patternOptions: ProjectDetailPatternOption[];
  primaryPhotoUrl: string | null;
  photos: ProjectDetailPhoto[];
  materials: ProjectDetailMaterial[];
  notes: ProjectDetailNote[];
};

type DetailPhotoRow = {
  id: string;
  image_url: string;
  photo_type: PhotoType | null;
  is_primary: boolean;
  created_at: string;
};

type DetailMaterialRow = {
  id: string;
  name: string | null;
  url: string | null;
  photo_url: string | null;
  comment: string | null;
  is_selected: boolean | null;
  created_at: string;
};

type DetailPatternOptionRow = {
  id: string;
  url: string | null;
  photo_url: string | null;
  comment: string | null;
  is_selected: boolean | null;
  created_at: string;
};

type DetailPatternFileRow = {
  id: string;
  file_url: string;
  name: string;
  content_type: string;
  created_at: string;
};

type DetailNoteRow = {
  id: string;
  stage: Stage;
  content: string;
  created_at: string;
};

export type ProjectDetailRow = {
  id: string;
  title: string;
  hobby_type: HobbyType;
  status: ProjectStatus;
  description: string | null;
  project_photos: DetailPhotoRow[] | null;
  project_materials: DetailMaterialRow[] | null;
  pattern_options: DetailPatternOptionRow[] | null;
  pattern_files: DetailPatternFileRow[] | null;
  project_notes: DetailNoteRow[] | null;
};

function byCreatedAtAsc(a: { created_at: string }, b: { created_at: string }) {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function byCreatedAtDesc(
  a: { created_at: string },
  b: { created_at: string },
) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function mapProjectDetailRow(row: ProjectDetailRow): ProjectDetail {
  const photoRows = [...(row.project_photos ?? [])].sort(byCreatedAtDesc);
  const materialRows = [...(row.project_materials ?? [])].sort(byCreatedAtAsc);
  const patternOptionRows = [...(row.pattern_options ?? [])].sort(
    byCreatedAtAsc,
  );
  const noteRows = [...(row.project_notes ?? [])].sort(byCreatedAtAsc);
  const patternFiles = [...(row.pattern_files ?? [])]
    .sort(byCreatedAtAsc)
    .map((file) => ({
      id: file.id,
      fileUrl: file.file_url,
      name: file.name,
      contentType: file.content_type,
    }));

  return {
    id: row.id,
    title: row.title,
    hobbyType: row.hobby_type,
    status: row.status,
    description: row.description,
    pattern: derivePattern(patternOptionRows, patternFiles),
    patternOptions: patternOptionRows.map((option) => ({
      id: option.id,
      url: option.url,
      photoUrl: option.photo_url,
      comment: option.comment,
      isSelected: Boolean(option.is_selected),
    })),
    primaryPhotoUrl: pickProjectPhotoUrl(photoRows),
    photos: photoRows.map((photo) => ({
      id: photo.id,
      imageUrl: photo.image_url,
      photoType: photo.photo_type,
      isPrimary: photo.is_primary,
      createdAt: photo.created_at,
    })),
    materials: materialRows.map((material) => ({
      id: material.id,
      name: material.name,
      url: material.url,
      photoUrl: material.photo_url,
      comment: material.comment,
      isSelected: Boolean(material.is_selected),
    })),
    notes: noteRows.map((note) => ({
      id: note.id,
      stage: note.stage,
      content: note.content,
      createdAt: note.created_at,
    })),
  };
}

export async function getProjectById(
  projectId: string,
  client: ProjectsSupabaseClient = supabase as unknown as ProjectsSupabaseClient,
): Promise<DataResult<ProjectDetail>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return { data: null, error: "You must be signed in to view a project." };
  }

  const { data, error } = await client
    .from("projects")
    .select(
      `
      id,
      title,
      hobby_type,
      status,
      description,
      project_photos ( id, image_url, photo_type, is_primary, created_at ),
      project_materials ( id, name, url, photo_url, comment, is_selected, created_at ),
      pattern_options ( id, url, photo_url, comment, is_selected, created_at ),
      pattern_files ( id, file_url, name, content_type, created_at ),
      project_notes ( id, stage, content, created_at )
    `,
    )
    .eq("user_id", user.id)
    .eq("id", projectId)
    .is("deleted_at", null)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Project not found." };
  }

  return {
    data: mapProjectDetailRow(data as ProjectDetailRow),
    error: null,
  };
}
