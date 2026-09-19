import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { HobbyType, ProjectListItem } from "../../../lib/projects";

const HOBBY_LABELS: Record<HobbyType, string> = {
  crochet: "Crochet",
  knit: "Knit",
  sewing: "Sewing",
};

type ProjectCardProps = {
  project: ProjectListItem;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const theme = useTheme();
  const hobbyLabel = project.hobbyType
    ? HOBBY_LABELS[project.hobbyType]
    : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface },
      ]}
    >
      <View
        style={[
          styles.imageWrap,
          { backgroundColor: theme.border },
        ]}
      >
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
        {hobbyLabel ? (
          <ThemedText themeColor="textSecondary" type="small">
            {hobbyLabel}
          </ThemedText>
        ) : null}
        {project.hasPattern ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.border },
            ]}
          >
            <ThemedText type="small">Pattern</ThemedText>
          </View>
        ) : null}
        {project.materialName ? (
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={1}>
            {project.materialName}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: Spacing.two,
    padding: Spacing.two,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
