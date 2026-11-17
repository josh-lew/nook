import { useState } from "react";

import {
  insertProjectNote,
  pauseProject,
  resumeProject,
  type ProjectDetail,
} from "../../lib/projects";

type UsePauseProjectOptions = {
  project: ProjectDetail | null;
  /** Reloads the Project after a pause or resume, whether or not it worked. */
  reload: () => Promise<void>;
  /** Shows why a resume failed; pause errors stay in the sheet. */
  onResumeError: (error: string | null) => void;
};

/** Pause and Resume for the Project screen, including the pause note sheet. */
export function usePauseProject({
  project,
  reload,
  onResumeError,
}: UsePauseProjectOptions) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [pauseError, setPauseError] = useState<string | null>(null);

  /** Resolves true once paused and noted, so the sheet can keep the note on failure. */
  const pause = async (note: string) => {
    if (!project) {
      return false;
    }

    setPauseError(null);
    setPausing(true);
    // A failed note leaves the Project Paused, so a retry saves just the note
    const result = project.paused
      ? await insertProjectNote(project.id, note, "in_progress")
      : await pauseProject(project.id, note);
    // Reload either way: a failed note still leaves the Project Paused
    await reload();
    setPausing(false);
    if (result.error) {
      setPauseError(result.error);
      return false;
    }
    setSheetVisible(false);
    return true;
  };

  const resume = async () => {
    if (!project) {
      return;
    }

    onResumeError(null);
    setResuming(true);
    const result = await resumeProject(project.id);
    if (result.error) {
      onResumeError(result.error);
    }
    // Reload either way: an error may mean it changed elsewhere
    await reload();
    setResuming(false);
  };

  return {
    sheetVisible,
    openSheet: () => setSheetVisible(true),
    closeSheet: () => {
      setPauseError(null);
      setSheetVisible(false);
    },
    pausing,
    resuming,
    pauseError,
    pause,
    resume,
  };
}
