import type { ProjectStatus, UploadFile } from "../../../lib/projects";

export type ProjectPhotoType = "inspiration" | "progress" | "finished";

export type AdditionalPhotoDraft = {
  id: string;
  file: UploadFile;
  photoType: ProjectPhotoType;
};

export function defaultPhotoTypeForStatus(
  status: ProjectStatus,
): ProjectPhotoType {
  if (status === "in_progress") {
    return "progress";
  }
  if (status === "completed") {
    return "finished";
  }
  return "inspiration";
}

export function photoTypeOptionsForStatus(
  status: ProjectStatus,
): { value: ProjectPhotoType; label: string }[] {
  if (status === "in_progress") {
    return [
      { value: "inspiration", label: "Inspiration" },
      { value: "progress", label: "Progress" },
    ];
  }
  if (status === "completed") {
    return [
      { value: "inspiration", label: "Inspiration" },
      { value: "progress", label: "Progress" },
      { value: "finished", label: "Finished" },
    ];
  }
  return [];
}
