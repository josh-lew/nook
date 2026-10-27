import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectSeed as Seed } from "../../../lib/projects";

type ProjectSeedProps = {
  seed: Seed;
};

/** Where a Promoted Project began: the Idea's photos and original description, read-only. */
export function ProjectSeed({ seed }: ProjectSeedProps) {
  const theme = useTheme();
  const description = seed.description?.trim();

  if (!description && seed.photos.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <ThemedText type="smallBold">Where it started</ThemedText>
      {seed.photos.length > 0 ? (
        <View style={styles.photos}>
          {seed.photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.imageUrl }}
              style={[styles.photo, { backgroundColor: theme.border }]}
              contentFit="cover"
              accessibilityLabel="Idea photo"
            />
          ))}
        </View>
      ) : null}
      {description ? <ThemedText type="small">{description}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  photos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: Spacing.two,
  },
});
