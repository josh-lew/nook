import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { IdeaListItem } from "../../../lib/projects";

type IdeaCardProps = {
  idea: IdeaListItem;
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={`${idea.title} idea`}
      style={[styles.card, { backgroundColor: theme.surface }]}
    >
      <View style={[styles.imageWrap, { backgroundColor: theme.border }]}>
        {idea.photoUrl ? (
          <Image
            source={{ uri: idea.photoUrl }}
            style={styles.image}
            contentFit="cover"
            accessibilityLabel={`${idea.title} photo`}
          />
        ) : (
          <SymbolView
            name={{ ios: "lightbulb", android: "lightbulb", web: "lightbulb" }}
            size={24}
            tintColor={theme.textSecondary}
          />
        )}
      </View>

      <ThemedText type="smallBold" numberOfLines={2} style={styles.title}>
        {idea.title}
      </ThemedText>
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
    width: 64,
    height: 64,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    flex: 1,
  },
});
