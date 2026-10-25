import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  const colors = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      blurEffect="none"
      disableTransparentOnScrollEdge
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      indicatorColor={colors.background}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: colors.primary },
      }}
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
        name="ideas"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Label>Ideas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="lightbulb" md="lightbulb" />
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
