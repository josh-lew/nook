import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  const colors = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      blurEffect="none"
      disableTransparentOnScrollEdge
      indicatorColor={colors.surface}
      labelStyle={{ selected: { color: colors.primary } }}
      shadowColor="transparent"
    >
      <NativeTabs.Trigger
        name="index"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="explore"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Label>Projects</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
