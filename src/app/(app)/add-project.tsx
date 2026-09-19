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
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    setForm((current) => ({ ...current, status: initialStatus }));
  }, [initialStatus]);

  const leave = useCallback(() => {
    allowLeaveRef.current = true;
    router.back();
  }, [router]);

  const requestClose = useCallback(() => {
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
    const unsubscribe = navigation.addListener("beforeRemove", (event: {
      preventDefault: () => void;
      data: { action: unknown };
    }) => {
      if (allowLeaveRef.current || saving || !isDirty(form, initialStatus)) {
        return;
      }

      event.preventDefault();
      Alert.alert("Discard this project?", "Your entered details will be lost.", [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            allowLeaveRef.current = true;
            navigation.dispatch(event.data.action as never);
          },
        },
      ]);
    });

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

  const goSkip = () => {
    if (stepIndex === 3) {
      void handleSave();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, 3));
  };

  const handleSave = async () => {
    if (!validateStepOne() || !form.hobbyType) {
      setStepIndex(0);
      return;
    }

    setSaving(true);
    setSubmitError(null);

    const projectResult = await insertProject({
      title: form.title.trim(),
      hobby_type: form.hobbyType,
      status: form.status,
    });

    if (projectResult.error || !projectResult.data) {
      setSubmitError(projectResult.error ?? "Could not create project.");
      setSaving(false);
      return;
    }

    const projectId = projectResult.data.id;

    if (form.patternFile) {
      const uploadResult = await uploadPatternFile(projectId, form.patternFile);
      if (uploadResult.error || !uploadResult.data) {
        setSubmitError(uploadResult.error ?? "Could not upload pattern file.");
        setSaving(false);
        return;
      }

      const updateResult = await updateProject(projectId, {
        pattern_file_url: uploadResult.data.url,
      });
      if (updateResult.error) {
        setSubmitError(updateResult.error);
        setSaving(false);
        return;
      }
    }

    if (form.inspirationPhotos.length > 0) {
      const photoUrls: { image_url: string }[] = [];
      for (const photo of form.inspirationPhotos) {
        const uploadResult = await uploadProjectPhoto(projectId, photo);
        if (uploadResult.error || !uploadResult.data) {
          setSubmitError(
            uploadResult.error ?? "Could not upload inspiration photo.",
          );
          setSaving(false);
          return;
        }
        photoUrls.push({ image_url: uploadResult.data.url });
      }

      const photosResult = await insertProjectPhotos(projectId, photoUrls);
      if (photosResult.error) {
        setSubmitError(photosResult.error);
        setSaving(false);
        return;
      }
    }

    if (form.materials.length > 0) {
      const materialRows = [];
      for (const material of form.materials) {
        let photoUrl: string | null = null;
        if (material.photo) {
          const uploadResult = await uploadProjectPhoto(
            projectId,
            material.photo,
          );
          if (uploadResult.error || !uploadResult.data) {
            setSubmitError(
              uploadResult.error ?? "Could not upload material photo.",
            );
            setSaving(false);
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
        projectId,
        materialRows,
      );
      if (materialsResult.error) {
        setSubmitError(materialsResult.error);
        setSaving(false);
        return;
      }
    }

    if (form.note.trim()) {
      const noteResult = await insertProjectNote(projectId, form.note);
      if (noteResult.error) {
        setSubmitError(noteResult.error);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    leave();
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
              onChangeTitle={(title) => setForm((current) => ({ ...current, title }))}
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
          onSave={handleSave}
        />
      </View>

      {saving ? (
        <View
          style={[styles.savingOverlay, { backgroundColor: theme.background }]}
        >
          <ActivityIndicator size="large" color={theme.textPrimary} />
          <ThemedText themeColor="textSecondary">Saving project…</ThemedText>
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
