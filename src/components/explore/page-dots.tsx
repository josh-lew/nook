import { StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const INACTIVE_SIZE = 8;
const ACTIVE_SIZE = 12;

type PageDotsProps = {
  count: number;
  activeIndex: number;
};

export function PageDots({ count, activeIndex }: PageDotsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row} accessibilityRole="adjustable">
      {Array.from({ length: count }, (_, index) => {
        const active = index === activeIndex;
        const size = active ? ACTIVE_SIZE : INACTIVE_SIZE;

        return (
          <View
            key={index}
            accessibilityLabel={`Page ${index + 1} of ${count}${active ? ", current" : ""}`}
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: active ? theme.text : theme.textSecondary,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
});
