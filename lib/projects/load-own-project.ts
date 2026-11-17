import type {
  DataResult,
  ProjectStatus,
  ProjectsSupabaseClient,
} from "./types";

export type OwnProject = {
  userId: string;
  status: ProjectStatus;
  pausedAt: string | null;
};

/**
 * Reads the signed-in maker's Project before a guarded write. `action` names
 * the write in the signed-out error, e.g. "pause".
 */
export async function loadOwnProject(
  projectId: string,
  action: string,
  client: ProjectsSupabaseClient,
): Promise<DataResult<OwnProject>> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    return { data: null, error: userError.message };
  }

  if (!user) {
    return {
      data: null,
      error: `You must be signed in to ${action} a project.`,
    };
  }

  const { data: project, error: projectError } = await client
    .from("projects")
    .select("status, paused_at")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (projectError) {
    return { data: null, error: projectError.message };
  }

  const row = project as {
    status: ProjectStatus;
    paused_at?: string | null;
  } | null;

  if (!row) {
    return { data: null, error: "Project not found." };
  }

  return {
    data: {
      userId: user.id,
      status: row.status,
      pausedAt: row.paused_at ?? null,
    },
    error: null,
  };
}
