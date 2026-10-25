import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { HobbyType, ProjectListItem } from "../../../lib/projects";

const HOBBY_ICONS: Record<HobbyType, number> = {
  crochet: require("@/assets/images/icons/crocheting.png"),
  knit: require("@/assets/images/icons/knitting.png"),
  sewing: require("@/assets/images/icons/sewing-machine.png"),
};

type ProjectCardProps = {
  project: ProjectListItem;
  onPress: () => void;
};

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function PresenceLabel({ label, active }: { label: string; active: boolean }) {
  const theme = useTheme();

  if (active) {
    return (
      <View style={[styles.chip, { backgroundColor: theme.border }]}>
        <ThemedText type="small">{label}</ThemedText>
      </View>
    );
  }

  return (
    <ThemedText type="small" themeColor="textSecondary">
      {label}
    </ThemedText>
  );
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const theme = useTheme();
  const hobbyIcon = HOBBY_ICONS[project.hobbyType];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${project.title} project`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageWrap, { backgroundColor: theme.border }]}>
        {project.photoUrl ? (
          <Image
            source={{ uri: project.photoUrl }}
            style={styles.image}
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
            size={28}
            tintColor={theme.textSecondary}
          />
        )}
      </View>

      <View style={styles.body}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {project.title}
        </ThemedText>

        <PresenceLabel label="Pattern" active={project.hasPattern} />
        <PresenceLabel label="Material" active={project.hasMaterial} />

        <ThemedText type="small">
          Created at: {formatCreatedAt(project.createdAt)}
        </ThemedText>
      </View>

      <Image
        source={hobbyIcon}
        style={styles.hobbyIcon}
        contentFit="contain"
        accessibilityLabel={`${project.hobbyType} project`}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
  imageWrap: {
    width: 88,
    height: 80,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  body: {
    flex: 1,
    gap: Spacing.half,
    minWidth: 0,
  },
  hobbyIcon: {
    width: 28,
    height: 28,
  },
  chip: {
    alignSelf: "flex-start",
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
