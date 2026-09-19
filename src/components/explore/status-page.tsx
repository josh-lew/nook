import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type StatusPageProps = {
  title: string;
  subtitle: string;
  category: ProjectCategory;
  contentContainerStyle?: ViewStyle;
};

export function StatusPage({
  title,
  subtitle,
  category,
  contentContainerStyle,
}: StatusPageProps) {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

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
      </ScrollView>

      <AddProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={category}
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
  pressed: {
    opacity: 0.7,
  },
});
