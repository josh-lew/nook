import { useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProjectCategory } from "@/components/explore/add-project-modal";
import { PageDots } from "@/components/explore/page-dots";
import { StatusPage } from "@/components/explore/status-page";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

const PAGES: {
  title: string;
  subtitle: string;
  category: ProjectCategory;
}[] = [
  {
    title: "Planning",
    subtitle: "Projects you’re planning will show up here.",
    category: "planning",
  },
  {
    title: "In Progress",
    subtitle: "Projects you’re working on will show up here.",
    category: "inProgress",
  },
  {
    title: "Completed",
    subtitle: "Finished projects will show up here.",
    category: "completed",
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [listVersion, setListVersion] = useState(0);

  const syncActiveIndex = (offsetX: number) => {
    const nextIndex = Math.round(offsetX / width);
    const clamped = Math.max(0, Math.min(nextIndex, PAGES.length - 1));
    setActiveIndex((current) => (current === clamped ? current : clamped));
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncActiveIndex(event.nativeEvent.contentOffset.x);
  };

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top }]}>
      <PageDots count={PAGES.length} activeIndex={activeIndex} />

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
        accessibilityLabel="Project status pages"
      >
        {PAGES.map((page) => (
          <StatusPage
            key={page.title}
            title={page.title}
            subtitle={page.subtitle}
            category={page.category}
            listVersion={listVersion}
            onProjectsChanged={() => setListVersion((version) => version + 1)}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pager: {
    flex: 1,
    marginTop: Spacing.one,
  },
});
