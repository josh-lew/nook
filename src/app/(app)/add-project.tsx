import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyDetailsStep } from "@/components/add-project/key-details-step";
import {
  MaterialDraft,
  MaterialsStep,
} from "@/components/add-project/materials-step";
import { NotesStep } from "@/components/add-project/notes-step";
import { PatternStep } from "@/components/add-project/pattern-step";
import { StepFooter } from "@/components/add-project/step-footer";
import { StepHeader } from "@/components/add-project/step-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  HobbyType,
  insertProject,
  insertProjectMaterials,
  insertProjectNote,
  insertProjectPhotos,
  ProjectStatus,
  updateProject,
  UploadFile,
  uploadPatternFile,
  uploadProjectPhoto,
} from "../../../lib/projects";

type FormState = {
  title: string;
  hobbyType: HobbyType | null;
  status: ProjectStatus;
  patternFile: UploadFile | null;
  inspirationPhotos: UploadFile[];
  materials: MaterialDraft[];
  note: string;
};

type OptionalStep = "pattern" | "inspiration" | "materials" | "note";

type CompletedExtras = Record<OptionalStep, boolean>;

const EMPTY_COMPLETED: CompletedExtras = {
  pattern: false,
  inspiration: false,
  materials: false,
  note: false,
};

function parseStatus(value: string | string[] | undefined): ProjectStatus {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "in_progress" || raw === "completed" || raw === "planning") {
    return raw;
  }
  return "planning";
}

function isDirty(form: FormState, initialStatus: ProjectStatus): boolean {
  return (
    form.title.trim().length > 0 ||
    form.hobbyType !== null ||
    form.status !== initialStatus ||
    form.patternFile !== null ||
    form.inspirationPhotos.length > 0 ||
    form.materials.length > 0 ||
    form.note.trim().length > 0
  );
}

function hasPendingExtras(
  form: FormState,
  completed: CompletedExtras,
): boolean {
  return (
    (Boolean(form.patternFile) && !completed.pattern) ||
    (form.inspirationPhotos.length > 0 && !completed.inspiration) ||
    (form.materials.length > 0 && !completed.materials) ||
    (form.note.trim().length > 0 && !completed.note)
  );
}

export default function AddProjectScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{ status?: string }>();
  const initialStatus = useMemo(
    () => parseStatus(params.status),
    [params.status],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    title: "",
    hobbyType: null,
    status: initialStatus,
    patternFile: null,
    inspirationPhotos: [],
    materials: [],
    note: "",
  });
  const [titleError, setTitleError] = useState<string | null>(null);
  const [hobbyError, setHobbyError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const allowLeaveRef = useRef(false);
  const projectIdRef = useRef<string | null>(null);
  const completedRef = useRef<CompletedExtras>({ ...EMPTY_COMPLETED });
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    setForm((current) => ({ ...current, status: initialStatus }));
  }, [initialStatus]);

  const leave = useCallback(() => {
    allowLeaveRef.current = true;
    router.back();
  }, [router]);

  const requestClose = useCallback(() => {
    if (projectIdRef.current) {
      if (!hasPendingExtras(formRef.current, completedRef.current)) {
        leave();
        return;
      }

      Alert.alert(
        "Leave this project?",
        "Your project is already saved. Anything that hasn’t finished uploading won’t be added.",
        [
          { text: "Keep editing", style: "cancel" },
          { text: "Leave", style: "destructive", onPress: leave },
        ],
      );
      return;
    }

    if (!isDirty(form, initialStatus)) {
      leave();
      return;
    }

    Alert.alert("Discard this project?", "Your entered details will be lost.", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: leave,
      },
    ]);
  }, [form, initialStatus, leave]);

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      "beforeRemove",
      (event: {
        preventDefault: () => void;
        data: { action: unknown };
      }) => {
        if (allowLeaveRef.current || saving) {
          return;
        }

        if (projectIdRef.current) {
          if (!hasPendingExtras(formRef.current, completedRef.current)) {
            return;
          }

          event.preventDefault();
          Alert.alert(
            "Leave this project?",
            "Your project is already saved. Anything that hasn’t finished uploading won’t be added.",
            [
              { text: "Keep editing", style: "cancel" },
              {
                text: "Leave",
                style: "destructive",
                onPress: () => {
                  allowLeaveRef.current = true;
                  navigation.dispatch(event.data.action as never);
                },
              },
            ],
          );
          return;
        }

        if (!isDirty(form, initialStatus)) {
          return;
        }

        event.preventDefault();
        Alert.alert(
          "Discard this project?",
          "Your entered details will be lost.",
          [
            { text: "Keep editing", style: "cancel" },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => {
                allowLeaveRef.current = true;
                navigation.dispatch(event.data.action as never);
              },
            },
          ],
        );
      },
    );

    return unsubscribe;
  }, [form, initialStatus, navigation, saving]);

  const validateStepOne = () => {
    let ok = true;
    if (!form.title.trim()) {
      setTitleError("Title is required.");
      ok = false;
    } else {
      setTitleError(null);
    }

    if (!form.hobbyType) {
      setHobbyError("Choose a hobby type.");
      ok = false;
    } else {
      setHobbyError(null);
    }

    return ok;
  };

  const goNext = () => {
    if (stepIndex === 0 && !validateStepOne()) {
      return;
    }
    setStepIndex((current) => Math.min(current + 1, 3));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const showPartialFailure = (step: OptionalStep, message: string) => {
    Alert.alert(
      "Project saved",
      `${message}\n\nYour project was created. Retry this step, continue without it, or keep editing.`,
      [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Continue without it",
          onPress: () => {
            void handleSave({ skip: step });
          },
        },
        {
          text: "Retry",
          onPress: () => {
            void handleSave();
          },
        },
      ],
    );
  };

  const handleSave = async (options?: { skip?: OptionalStep }) => {
    const currentForm = formRef.current;

    if (!currentForm.hobbyType) {
      if (!validateStepOne()) {
        setStepIndex(0);
      }
      return;
    }

    if (!currentForm.title.trim()) {
      validateStepOne();
      setStepIndex(0);
      return;
    }

    if (options?.skip) {
      completedRef.current[options.skip] = true;

      if (options.skip === "pattern") {
        setForm((current) => ({ ...current, patternFile: null }));
        formRef.current = { ...formRef.current, patternFile: null };
      } else if (options.skip === "inspiration") {
        setForm((current) => ({ ...current, inspirationPhotos: [] }));
        formRef.current = { ...formRef.current, inspirationPhotos: [] };
      } else if (options.skip === "materials") {
        setForm((current) => ({ ...current, materials: [] }));
        formRef.current = { ...formRef.current, materials: [] };
      } else if (options.skip === "note") {
        setForm((current) => ({ ...current, note: "" }));
        formRef.current = { ...formRef.current, note: "" };
      }
    }

    const formSnapshot = formRef.current;
    if (!formSnapshot.hobbyType) {
      return;
    }

    setSaving(true);
    setSubmitError(null);

    let activeProjectId = projectIdRef.current;

    if (!activeProjectId) {
      const projectResult = await insertProject({
        title: formSnapshot.title.trim(),
        hobby_type: formSnapshot.hobbyType,
        status: formSnapshot.status,
      });

      if (projectResult.error || !projectResult.data) {
        setSubmitError(projectResult.error ?? "Could not create project.");
        setSaving(false);
        return;
      }

      activeProjectId = projectResult.data.id;
      projectIdRef.current = activeProjectId;
      setProjectId(activeProjectId);
    } else {
      const updateResult = await updateProject(activeProjectId, {
        title: formSnapshot.title.trim(),
        hobby_type: formSnapshot.hobbyType,
        status: formSnapshot.status,
      });

      if (updateResult.error) {
        setSubmitError(updateResult.error);
        setSaving(false);
        return;
      }
    }

    if (formSnapshot.patternFile && !completedRef.current.pattern) {
      const uploadResult = await uploadPatternFile(
        activeProjectId,
        formSnapshot.patternFile,
      );
      if (uploadResult.error || !uploadResult.data) {
        setSaving(false);
        showPartialFailure(
          "pattern",
          uploadResult.error ?? "Could not upload pattern file.",
        );
        return;
      }

      const updateResult = await updateProject(activeProjectId, {
        pattern_file_url: uploadResult.data.url,
      });
      if (updateResult.error) {
        setSaving(false);
        showPartialFailure("pattern", updateResult.error);
        return;
      }

      completedRef.current.pattern = true;
    }

    if (
      formSnapshot.inspirationPhotos.length > 0 &&
      !completedRef.current.inspiration
    ) {
      const photoUrls: { image_url: string }[] = [];
      for (const photo of formSnapshot.inspirationPhotos) {
        const uploadResult = await uploadProjectPhoto(activeProjectId, photo);
        if (uploadResult.error || !uploadResult.data) {
          setSaving(false);
          showPartialFailure(
            "inspiration",
            uploadResult.error ?? "Could not upload inspiration photo.",
          );
          return;
        }
        photoUrls.push({ image_url: uploadResult.data.url });
      }

      const photosResult = await insertProjectPhotos(
        activeProjectId,
        photoUrls,
      );
      if (photosResult.error) {
        setSaving(false);
        showPartialFailure("inspiration", photosResult.error);
        return;
      }

      completedRef.current.inspiration = true;
    }

    if (formSnapshot.materials.length > 0 && !completedRef.current.materials) {
      const materialRows = [];
      for (const material of formSnapshot.materials) {
        let photoUrl: string | null = null;
        if (material.photo) {
          const uploadResult = await uploadProjectPhoto(
            activeProjectId,
            material.photo,
          );
          if (uploadResult.error || !uploadResult.data) {
            setSaving(false);
            showPartialFailure(
              "materials",
              uploadResult.error ?? "Could not upload material photo.",
            );
            return;
          }
          photoUrl = uploadResult.data.url;
        }

        materialRows.push({
          name: material.name.trim() || null,
          url: material.url.trim() || null,
          photo_url: photoUrl,
          comment: material.comment.trim() || null,
        });
      }

      const materialsResult = await insertProjectMaterials(
        activeProjectId,
        materialRows,
      );
      if (materialsResult.error) {
        setSaving(false);
        showPartialFailure("materials", materialsResult.error);
        return;
      }

      completedRef.current.materials = true;
    }

    if (formSnapshot.note.trim() && !completedRef.current.note) {
      const noteResult = await insertProjectNote(
        activeProjectId,
        formSnapshot.note,
      );
      if (noteResult.error) {
        setSaving(false);
        showPartialFailure("note", noteResult.error);
        return;
      }

      completedRef.current.note = true;
    }

    setSaving(false);
    leave();
  };

  const goSkip = () => {
    if (stepIndex === 3) {
      void handleSave();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, 3));
  };

  return (
    <ThemedView
      style={[
        styles.root,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}
    >
      <View style={styles.content}>
        <StepHeader stepIndex={stepIndex} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {stepIndex === 0 ? (
            <KeyDetailsStep
              title={form.title}
              hobbyType={form.hobbyType}
              status={form.status}
              titleError={titleError}
              hobbyError={hobbyError}
              onChangeTitle={(title) =>
                setForm((current) => ({ ...current, title }))
              }
              onChangeHobby={(hobbyType) =>
                setForm((current) => ({ ...current, hobbyType }))
              }
              onChangeStatus={(status) =>
                setForm((current) => ({ ...current, status }))
              }
            />
          ) : null}

          {stepIndex === 1 ? (
            <PatternStep
              patternFile={form.patternFile}
              inspirationPhotos={form.inspirationPhotos}
              onChangePatternFile={(patternFile) =>
                setForm((current) => ({ ...current, patternFile }))
              }
              onChangeInspirationPhotos={(inspirationPhotos) =>
                setForm((current) => ({ ...current, inspirationPhotos }))
              }
            />
          ) : null}

          {stepIndex === 2 ? (
            <MaterialsStep
              materials={form.materials}
              onChange={(materials) =>
                setForm((current) => ({ ...current, materials }))
              }
            />
          ) : null}

          {stepIndex === 3 ? (
            <NotesStep
              note={form.note}
              onChangeNote={(note) =>
                setForm((current) => ({ ...current, note }))
              }
            />
          ) : null}

          {projectId &&
          hasPendingExtras(form, completedRef.current) &&
          !saving ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.savedHint}
            >
              Project created. Retry failed uploads, continue without them, or
              leave anytime — Save won’t create a duplicate.
            </ThemedText>
          ) : null}

          {submitError ? (
            <ThemedText
              type="small"
              style={[styles.submitError, { color: theme.error }]}
            >
              {submitError}
            </ThemedText>
          ) : null}
        </ScrollView>

        <StepFooter
          stepIndex={stepIndex}
          saving={saving}
          onCancel={requestClose}
          onBack={goBack}
          onNext={goNext}
          onSkip={goSkip}
          onSave={() => {
            void handleSave();
          }}
        />
      </View>

      {saving ? (
        <View
          style={[styles.savingOverlay, { backgroundColor: theme.background }]}
        >
          <ActivityIndicator size="large" color={theme.textPrimary} />
          <ThemedText themeColor="textSecondary">
            {projectId ? "Finishing project…" : "Saving project…"}
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.four,
    flexGrow: 1,
  },
  savedHint: {
    marginTop: Spacing.three,
  },
  submitError: {
    marginTop: Spacing.three,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.92,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
});
