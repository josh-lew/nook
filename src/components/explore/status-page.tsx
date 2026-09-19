import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

import {
  AddProjectModal,
  ProjectCategory,
} from "@/components/explore/add-project-modal";
import { ProjectCard } from "@/components/explore/project-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  getProjectsByStatus,
  type ProjectListItem,
  type ProjectStatus,
} from "../../../lib/projects";

type StatusPageProps = {
  title: string;
  subtitle: string;
  category: ProjectCategory;
  contentContainerStyle?: ViewStyle;
};

const CATEGORY_TO_STATUS: Record<ProjectCategory, ProjectStatus> = {
  planning: "planning",
  inProgress: "in_progress",
  completed: "completed",
};

const EMPTY_COPY: Record<ProjectCategory, string> = {
  planning: "No planning projects yet — tap + to add one",
  inProgress: "No in-progress projects yet — tap + to add one",
  completed: "No completed projects yet — tap + to add one",
};

export function StatusPage({
  title,
  subtitle,
  category,
  contentContainerStyle,
}: StatusPageProps) {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const status = CATEGORY_TO_STATUS[category];

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        setError(null);

        const result = await getProjectsByStatus(status);
        if (!active) {
          return;
        }

        if (result.error) {
          setProjects([]);
          setError(result.error);
          setLoading(false);
          return;
        }

        setProjects(result.data ?? []);
        setLoading(false);
      }

      void load();

      return () => {
        active = false;
      };
    }, [status, reloadKey]),
  );

  const openAddProject = () => {
    setModalVisible(false);
    router.push({
      pathname: "/add-project",
      params: { status },
    });
  };

  return (
    <ThemedView style={[styles.page, { width }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add project"
            hitSlop={Spacing.two}
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <SymbolView
              name={{
                ios: "plus.circle.fill",
                android: "add_circle",
                web: "add_circle",
              }}
              size={28}
              tintColor={theme.text}
            />
          </Pressable>
        </View>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={theme.text} />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary" style={styles.stateText}>
              {error}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading projects"
              onPress={() => setReloadKey((key) => key + 1)}
              style={({ pressed }) => [
                styles.retryButton,
                { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold">Retry</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && projects.length === 0 ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary" style={styles.stateText}>
              {EMPTY_COPY[category]}
            </ThemedText>
          </View>
        ) : null}

        {!loading && !error && projects.length > 0 ? (
          <View style={styles.list}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <AddProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={category}
        onSelectNew={openAddProject}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    textAlign: "left",
    marginRight: Spacing.two,
  },
  subtitle: {
    textAlign: "left",
  },
  list: {
    width: "100%",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  state: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  stateText: {
    textAlign: "center",
  },
  retryButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
