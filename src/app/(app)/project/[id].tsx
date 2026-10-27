import { Image } from "expo-image";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { confirmDelete } from "@/components/confirm-delete";
import { HobbyPicker } from "@/components/ideas/hobby-picker";
import { MaterialOptions } from "@/components/project/material-options";
import { PatternOptions } from "@/components/project/pattern-options";
import { ProjectNotes } from "@/components/project/project-notes";
import {
  OpenPatternButton,
  ProjectPattern,
} from "@/components/project/project-pattern";
import { ProjectPhotos } from "@/components/project/project-photos";
import { ProjectSeed } from "@/components/project/project-seed";
import {
  StagePrompt,
  type StagePromptKind,
} from "@/components/project/stage-prompt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { STAGE_LABELS } from "@/constants/stages";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  changeStage,
  deleteProject,
  getProjectById,
  updateProject,
  type HobbyType,
  type ProjectDetail,
  type Stage,
} from "../../../../lib/projects";

type Section = "pattern" | "materials" | "photos" | "notes";

/** Every Stage shows the same sections, led by what matters at that Stage. */
const SECTION_ORDER: Record<Stage, Section[]> = {
  planning: ["pattern", "materials", "photos", "notes"],
  in_progress: ["pattern", "photos", "notes", "materials"],
  completed: ["photos", "notes", "pattern", "materials"],
};

/** The one move each Stage offers, and the skippable prompt shown after it. */
const STAGE_ACTIONS: Record<
  Stage,
  { label: string; to: Stage; prompt: StagePromptKind | null }
> = {
  planning: { label: "Start", to: "in_progress", prompt: "start" },
  in_progress: { label: "Complete", to: "completed", prompt: "complete" },
  completed: { label: "Reopen", to: "in_progress", prompt: null },
};

export default function ProjectDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [hobbyType, setHobbyType] = useState<HobbyType | null>(null);
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sectionBusy, setSectionBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [prompt, setPrompt] = useState<StagePromptKind | null>(null);

  const busy = saving || sectionBusy || deleting || moving;

  /** Reloads the Project. With `resetFields`, the form takes the saved values too. */
  const load = useCallback(
    async (resetFields: boolean) => {
      if (!projectId) {
        setProject(null);
        setLoadError("Project not found.");
        setLoading(false);
        return;
      }

      const result = await getProjectById(projectId);
      // Ideas share the projects table, so an Idea id must not open here
      if (result.error || !result.data || result.data.status === "idea") {
        setProject(null);
        setLoadError(result.error ?? "Project not found.");
        setLoading(false);
        return;
      }

      setProject(result.data);
      setLoadError(null);
      if (resetFields) {
        setTitle(result.data.title);
        setHobbyType(result.data.hobbyType);
        setDescription(result.data.description ?? "");
      }
      setLoading(false);
    },
    [projectId],
  );

  useFocusEffect(
    useCallback(() => {
      void load(true);
    }, [load]),
  );

  const reload = useCallback(() => load(false), [load]);

  useEffect(() => {
    navigation.setOptions({ title: project?.title ?? "Project" });
  }, [navigation, project?.title]);

  const dirty =
    project !== null &&
    (title.trim() !== project.title ||
      hobbyType !== project.hobbyType ||
      (description.trim() || null) !== project.description);

  const handleSave = async () => {
    if (!project || !hobbyType) {
      return;
    }

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    setActionError(null);
    setSaving(true);
    const result = await updateProject(project.id, {
      title,
      hobby_type: hobbyType,
      description,
    });
    if (result.error) {
      setActionError(result.error);
    } else {
      await load(true);
    }
    setSaving(false);
  };

  const handleStageChange = async () => {
    if (!project || project.status === "idea") {
      return;
    }

    const action = STAGE_ACTIONS[project.status];
    setActionError(null);
    setMoving(true);
    const result = await changeStage(project.id, action.to);
    if (result.error) {
      setActionError(result.error);
    } else {
      await reload();
      // The move is already saved, so the prompt only ever adds to it
      setPrompt(action.prompt);
    }
    setMoving(false);
  };

  const handleDelete = async () => {
    if (!project) {
      return;
    }

    const confirmed = await confirmDelete(
      "Delete this Project?",
      `“${project.title}” will be removed from your Projects.`,
    );
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setDeleting(true);
    const result = await deleteProject(project.id);
    if (result.error) {
      setActionError(result.error);
      setDeleting(false);
      return;
    }

    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={[styles.root, styles.state]}>
        <ActivityIndicator size="large" color={theme.textPrimary} />
      </ThemedView>
    );
  }

  if (loadError || !project || project.status === "idea") {
    return (
      <ThemedView style={[styles.root, styles.state]}>
        <ThemedText themeColor="textSecondary" style={styles.stateText}>
          {loadError ?? "Project not found."}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setLoading(true);
            void load(true);
          }}
          style={({ pressed }) => [
            styles.retry,
            { backgroundColor: theme.surface },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="smallBold">Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const stage = project.status;
  const stageAction = STAGE_ACTIONS[stage];

  const sections: Record<Section, ReactNode> = {
    pattern: (
      <View key="pattern" style={styles.section}>
        <ProjectPattern
          project={project}
          disabled={busy}
          onBusyChange={setSectionBusy}
          onError={setActionError}
          onChanged={reload}
        />
        <PatternOptions
          project={project}
          disabled={busy}
          onBusyChange={setSectionBusy}
          onError={setActionError}
          onChanged={reload}
        />
      </View>
    ),
    materials: (
      <MaterialOptions
        key="materials"
        project={project}
        disabled={busy}
        onBusyChange={setSectionBusy}
        onError={setActionError}
        onChanged={reload}
      />
    ),
    photos: (
      <ProjectPhotos
        // Remount on a Stage change so the photo type picks up the new default
        key={`photos-${stage}`}
        project={project}
        stage={stage}
        disabled={busy}
        onBusyChange={setSectionBusy}
        onError={setActionError}
        onChanged={reload}
      />
    ),
    notes: (
      <ProjectNotes
        key="notes"
        project={project}
        stage={stage}
        disabled={busy}
        onBusyChange={setSectionBusy}
        onError={setActionError}
        onChanged={reload}
      />
    ),
  };

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, Spacing.four) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.hero, { backgroundColor: theme.border }]}>
          {project.primaryPhotoUrl ? (
            <Image
              source={{ uri: project.primaryPhotoUrl }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityLabel={`${project.title} cover photo`}
            />
          ) : (
            <SymbolView
              name={{ ios: "photo", android: "photo", web: "photo" }}
              size={48}
              tintColor={theme.textSecondary}
            />
          )}
        </View>

        <View style={styles.stageRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {STAGE_LABELS[stage]}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${stageAction.label} project`}
            disabled={busy}
            onPress={() => {
              void handleStageChange();
            }}
            style={({ pressed }) => [
              styles.stageBtn,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {moving ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
                {stageAction.label}
              </ThemedText>
            )}
          </Pressable>
        </View>

        {stage === "in_progress" && project.pattern ? (
          <OpenPatternButton pattern={project.pattern} />
        ) : null}

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Title
          </ThemedText>
          <TextInput
            accessibilityLabel="Title"
            editable={!busy}
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (titleError && value.trim()) {
                setTitleError(null);
              }
            }}
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                backgroundColor: theme.surface,
                borderColor: titleError ? theme.error : theme.border,
              },
            ]}
          />
          {titleError ? (
            <ThemedText type="small" style={{ color: theme.error }}>
              {titleError}
            </ThemedText>
          ) : null}
        </View>

        <HobbyPicker value={hobbyType} disabled={busy} onChange={setHobbyType} />

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            Description
          </ThemedText>
          <TextInput
            accessibilityLabel="Description"
            editable={!busy}
            value={description}
            onChangeText={setDescription}
            placeholder="What are you making?"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[
              styles.input,
              styles.multiline,
              {
                color: theme.textPrimary,
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          />
        </View>

        {dirty ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save changes"
            disabled={busy}
            onPress={() => {
              void handleSave();
            }}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <ThemedText style={{ color: theme.onPrimary }}>
                Save changes
              </ThemedText>
            )}
          </Pressable>
        ) : null}

        {actionError ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {actionError}
          </ThemedText>
        ) : null}

        {SECTION_ORDER[stage].map((section) => sections[section])}

        {/* Tucked below the current work: it's for looking back */}
        {project.seed ? <ProjectSeed seed={project.seed} /> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete project"
          disabled={busy}
          onPress={() => {
            void handleDelete();
          }}
          style={({ pressed }) => [
            styles.deleteBtn,
            { borderColor: theme.error },
            pressed && styles.pressed,
          ]}
        >
          {deleting ? (
            <ActivityIndicator color={theme.error} />
          ) : (
            <ThemedText style={{ color: theme.error }}>
              Delete project
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>

      <StagePrompt
        kind={prompt}
        project={project}
        onClose={() => setPrompt(null)}
        onChanged={reload}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.four,
  },
  stateText: {
    textAlign: "center",
  },
  retry: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  hero: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: Spacing.two,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stageBtn: {
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  primaryBtn: {
    alignSelf: "flex-end",
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.four,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
