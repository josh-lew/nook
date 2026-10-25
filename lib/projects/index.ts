export type {
  DataResult,
  HobbyType,
  InsertIdeaInput,
  InsertProjectInput,
  InsertProjectMaterialInput,
  InsertProjectPhotoArgs,
  InsertProjectPhotoInput,
  PhotoType,
  ProjectStatus,
  ProjectsDeleteBuilder,
  ProjectsQueryBuilder,
  ProjectsSupabaseClient,
  ProjectsUpdateBuilder,
  Stage,
  UpdateProjectInput,
  UploadFile,
  UploadsSupabaseClient,
} from "./types";
export type { InsertProjectNoteResult } from "./insert-project-note";
export type {
  ProjectDetail,
  ProjectDetailMaterial,
  ProjectDetailNote,
  ProjectDetailPhoto,
  ProjectDetailRow,
} from "./get-project-by-id";
export type {
  ProjectListItem,
  ProjectListRow,
} from "./get-projects-by-status";

export type { IdeaListItem, IdeaListRow } from "./get-ideas";

export { getIdeas, mapIdeaListRow } from "./get-ideas";
export { insertIdea } from "./insert-idea";
export { insertProject } from "./insert-project";
export { insertProjectMaterials } from "./insert-project-materials";
export { insertProjectNote } from "./insert-project-note";
export { insertProjectPhoto } from "./insert-project-photo";
export { insertProjectPhotos } from "./insert-project-photos";
export { setPrimaryPhoto } from "./set-primary-photo";
export { updateProject } from "./update-project";
export {
  getProjectById,
  mapProjectDetailRow,
} from "./get-project-by-id";
export {
  getProjectsByStatus,
  mapProjectListRow,
  pickLatestPhotoUrl,
  pickMaterialName,
  pickProjectPhotoUrl,
} from "./get-projects-by-status";
export { sanitizeFilename, resolveContentType, stabilizeUploadFile, uploadPatternFile, uploadProjectPhoto } from "./uploads";
