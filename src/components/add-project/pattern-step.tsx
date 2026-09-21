import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import type { UploadFile } from "../../../lib/projects";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type PatternStepProps = {
  patternFile: UploadFile | null;
  inspirationPhotos: UploadFile[];
  onChangePatternFile: (file: UploadFile | null) => void;
  onChangeInspirationPhotos: (files: UploadFile[]) => void;
};

export function PatternStep({
  patternFile,
  inspirationPhotos,
  onChangePatternFile,
  onChangeInspirationPhotos,
}: PatternStepProps) {
  const theme = useTheme();
  const [preparing, setPreparing] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  const pickPattern = async () => {
    setPickError(null);

    try {
      const pickResult = await File.pickFileAsync({
        mimeTypes: ["application/pdf", "image/*"],
      });

      if (pickResult.canceled || !pickResult.result) {
        return;
      }

      const picked = pickResult.result;
      setPreparing(true);
      const base64 = await picked.base64();
      onChangePatternFile({
        uri: picked.uri,
        name: picked.name,
        type: picked.type || "application/octet-stream",
        base64,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not prepare that file. Try another copy.";
      setPickError(message);
    } finally {
      setPreparing(false);
    }
  };

  const pickInspiration = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const next = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `inspiration-${index + 1}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
      base64: asset.base64 ?? undefined,
    }));

    onChangeInspirationPhotos([...inspirationPhotos, ...next]);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.section}>
        <ThemedText type="smallBold">Pattern file</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Optional PDF or image of your pattern.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          disabled={preparing}
          onPress={() => {
            void pickPattern();
          }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.surface },
            pressed && styles.pressed,
            preparing && styles.disabled,
          ]}
        >
          {preparing ? (
            <ActivityIndicator color={theme.textPrimary} />
          ) : (
            <ThemedText type="small">
              {patternFile ? "Replace pattern file" : "Choose pattern file"}
            </ThemedText>
          )}
        </Pressable>
        {pickError ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {pickError}
          </ThemedText>
        ) : null}
        {patternFile ? (
          <View style={styles.fileRow}>
            <ThemedText type="small" style={styles.fileName}>
              {patternFile.name}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setPickError(null);
                onChangePatternFile(null);
              }}
            >
              <ThemedText type="small" themeColor="textSecondary">
                Remove
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Inspiration photos</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Optional photos for mood and ideas.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void pickInspiration();
          }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.surface },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="small">Add inspiration photos</ThemedText>
        </Pressable>
        {inspirationPhotos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} style={styles.fileRow}>
            <ThemedText type="small" style={styles.fileName}>
              {photo.name}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                onChangeInspirationPhotos(
                  inspirationPhotos.filter((_, i) => i !== index),
                )
              }
            >
              <ThemedText type="small" themeColor="textSecondary">
                Remove
              </ThemedText>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.two,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    minHeight: 36,
    justifyContent: "center",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  fileName: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
