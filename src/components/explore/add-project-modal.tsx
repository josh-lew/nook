import { SymbolView } from "expo-symbols";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ProjectCategory = "planning" | "inProgress" | "completed";

export type ProjectListItem = {
  id: string;
  name: string;
};

type AddProjectModalProps = {
  visible: boolean;
  onClose: () => void;
  category: ProjectCategory;
  projects?: ProjectListItem[];
  onSelectNew?: () => void;
  onSelectProject?: (project: ProjectListItem) => void;
};

const PREVIOUS_EMPTY_COPY: Record<
  Exclude<ProjectCategory, "planning">,
  string
> = {
  inProgress: "No planning projects yet",
  completed: "No in-progress projects yet",
};

export function AddProjectModal({
  visible,
  onClose,
  category,
  projects = [],
  onSelectNew,
  onSelectProject,
}: AddProjectModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.backdrop}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
              borderTopColor: theme.border,
            },
          ]}
        >
          <View style={styles.handleRow}>
            <View
              style={[styles.handle, { backgroundColor: theme.border }]}
            />
          </View>

          <View style={styles.header}>
            <ThemedText type="smallBold" style={styles.headerTitle}>
              Add Project
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={Spacing.two}
              onPress={onClose}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                size={18}
                tintColor={theme.textSecondary}
              />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="New project"
            onPress={onSelectNew}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.surface },
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{
                ios: "plus.circle.fill",
                android: "add_circle",
                web: "add_circle",
              }}
              size={22}
              tintColor={theme.textPrimary}
            />
            <ThemedText type="default">New</ThemedText>
          </Pressable>

          {category === "planning" ? (
            <View style={styles.cozy}>
              <SymbolView
                name={{
                  ios: "cup.and.saucer.fill",
                  android: "coffee",
                  web: "coffee",
                }}
                size={48}
                tintColor={theme.textSecondary}
              />
              <ThemedText themeColor="textSecondary" style={styles.cozyText}>
                A little nook for your next make.
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.cozyText}>
                Yarn, tea, and a quiet afternoon — start when you’re ready.
              </ThemedText>
            </View>
          ) : (
            <>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {projects.length === 0 ? (
                  <ThemedText
                    themeColor="textSecondary"
                    style={styles.emptyList}
                  >
                    {PREVIOUS_EMPTY_COPY[category]}
                  </ThemedText>
                ) : (
                  projects.map((project) => (
                    <Pressable
                      key={project.id}
                      accessibilityRole="button"
                      accessibilityLabel={project.name}
                      onPress={() => onSelectProject?.(project)}
                      style={({ pressed }) => [
                        styles.projectRow,
                        { borderBottomColor: theme.border },
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText type="default">{project.name}</ThemedText>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    height: "50%",
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    zIndex: 1,
  },
  handleRow: {
    alignItems: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.three,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.two,
  },
  emptyList: {
    textAlign: "center",
    paddingVertical: Spacing.five,
  },
  projectRow: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cozy: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  cozyText: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
