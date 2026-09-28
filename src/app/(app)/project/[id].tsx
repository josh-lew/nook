import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  getProjectById,
  type NoteStage,
  type ProjectDetail,
} from "../../../../lib/projects";

const STAGE_LABELS: Record<NoteStage, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setError("Project not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await getProjectById(projectId);
    if (result.error || !result.data) {
      setProject(null);
      setError(result.error ?? "Project not found.");
      setLoading(false);
      return;
    }

    setProject(result.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (project?.title) {
      navigation.setOptions({ title: project.title });
    } else {
      navigation.setOptions({ title: "Project" });
    }
  }, [navigation, project?.title]);

  const otherPhotos =
    project?.photos.filter(
      (photo) =>
        !photo.isPrimary && photo.imageUrl !== project.primaryPhotoUrl,
    ) ?? [];

  return (
    <ThemedView style={styles.root}>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={theme.textPrimary} />
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.state}>
          <ThemedText themeColor="textSecondary" style={styles.stateText}>
            {error}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void load();
            }}
            style={({ pressed }) => [
              styles.retry,
              { backgroundColor: theme.surface },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold">Retry</ThemedText>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && project ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, Spacing.four) },
          ]}
        >
          <ThemedText type="subtitle">{project.title}</ThemedText>

          <View
            style={[
              styles.hero,
              { backgroundColor: theme.border },
            ]}
          >
            {project.primaryPhotoUrl ? (
              <Image
                source={{ uri: project.primaryPhotoUrl }}
                style={styles.heroImage}
                contentFit="cover"
                accessibilityLabel={`${project.title} photo`}
              />
            ) : (
              <SymbolView
                name={{
                  ios: "photo",
                  android: "photo",
                  web: "photo",
                }}
                size={48}
                tintColor={theme.textSecondary}
              />
            )}
          </View>

          {project.patternFileUrl ? (
            <View style={styles.section}>
              <ThemedText type="smallBold">Pattern</ThemedText>
              <Pressable
                accessibilityRole="link"
                onPress={() => {
                  void Linking.openURL(project.patternFileUrl!);
                }}
              >
                <ThemedText type="linkPrimary">Open pattern</ThemedText>
              </Pressable>
            </View>
          ) : null}

          {project.materials.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="smallBold">Materials</ThemedText>
              {project.materials.map((material) => (
                <View
                  key={material.id}
                  style={[
                    styles.materialRow,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  {material.photoUrl ? (
                    <Image
                      source={{ uri: material.photoUrl }}
                      style={styles.materialThumb}
                      contentFit="cover"
                      accessibilityLabel={
                        material.name
                          ? `${material.name} photo`
                          : "Material photo"
                      }
                    />
                  ) : null}
                  <View style={styles.materialBody}>
                    <ThemedText type="smallBold">
                      {material.name?.trim() || "Untitled material"}
                    </ThemedText>
                    {material.comment?.trim() ? (
                      <ThemedText type="small" themeColor="textSecondary">
                        {material.comment.trim()}
                      </ThemedText>
                    ) : null}
                    {material.url?.trim() ? (
                      <Pressable
                        accessibilityRole="link"
                        onPress={() => {
                          void Linking.openURL(material.url!);
                        }}
                      >
                        <ThemedText type="linkPrimary">Open link</ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {otherPhotos.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="smallBold">Other photos</ThemedText>
              <View style={styles.photoGrid}>
                {otherPhotos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.imageUrl }}
                    style={styles.gridPhoto}
                    contentFit="cover"
                    accessibilityLabel="Project photo"
                  />
                ))}
              </View>
            </View>
          ) : null}

          {project.notes.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="smallBold">Notes</ThemedText>
              {project.notes.map((note) => (
                <View
                  key={note.id}
                  style={[
                    styles.noteRow,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    {STAGE_LABELS[note.stage]} · {formatDate(note.createdAt)}
                  </ThemedText>
                  <ThemedText>{note.content}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : null}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
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
  section: {
    gap: Spacing.two,
  },
  materialRow: {
    flexDirection: "row",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  materialThumb: {
    width: 56,
    height: 56,
    borderRadius: Spacing.one,
  },
  materialBody: {
    flex: 1,
    gap: Spacing.half,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  gridPhoto: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: Spacing.one,
  },
  noteRow: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
