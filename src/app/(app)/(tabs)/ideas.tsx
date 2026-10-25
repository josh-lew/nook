import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IdeaCard } from "@/components/ideas/idea-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getIdeas, type IdeaListItem } from "../../../../lib/projects";

export default function IdeasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getIdeas();

    if (result.error) {
      setIdeas([]);
      setError(result.error);
      setLoading(false);
      return;
    }

    setIdeas(result.data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadIdeas();
    }, [loadIdeas]),
  );

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="subtitle">Ideas</ThemedText>
        <ThemedText themeColor="textSecondary">
          Things you might make one day.
        </ThemedText>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={theme.textPrimary} />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary" style={styles.stateText}>
              {error}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading ideas"
              onPress={() => {
                void loadIdeas();
              }}
              style={({ pressed }) => [
                styles.retryButton,
                { backgroundColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold">Retry</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && ideas.length === 0 ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary" style={styles.stateText}>
              No ideas yet — tap + on Home to capture one
            </ThemedText>
          </View>
        ) : null}

        {!loading && !error && ideas.length > 0 ? (
          <View style={styles.list}>
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onPress={() => {
                  router.push({
                    pathname: "/idea/[id]",
                    params: { id: idea.id },
                  });
                }}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  state: {
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
