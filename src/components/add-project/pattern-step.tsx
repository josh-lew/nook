import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import {
  defaultPhotoTypeForStatus,
  type AdditionalPhotoDraft,
  type ProjectPhotoType,
} from "@/components/add-project/photo-type";
import { PhotoTypeToggle } from "@/components/add-project/photo-type-toggle";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ProjectStatus, UploadFile } from "../../../lib/projects";

type PatternStepProps = {
  status: ProjectStatus;
  patternFile: UploadFile | null;
  additionalPhotos: AdditionalPhotoDraft[];
  onChangePatternFile: (file: UploadFile | null) => void;
  onChangeAdditionalPhotos: (photos: AdditionalPhotoDraft[]) => void;
};

export function PatternStep({
  status,
  patternFile,
  additionalPhotos,
  onChangePatternFile,
  onChangeAdditionalPhotos,
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

  const pickAdditionalPhotos = async () => {
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

    const defaultType = defaultPhotoTypeForStatus(status);
    const next: AdditionalPhotoDraft[] = result.assets.map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      file: {
        uri: asset.uri,
        name: asset.fileName ?? `reference-${index + 1}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
        base64: asset.base64 ?? undefined,
      },
      photoType: defaultType,
    }));

    onChangeAdditionalPhotos([...additionalPhotos, ...next]);
  };

  const updatePhotoType = (id: string, photoType: ProjectPhotoType) => {
    onChangeAdditionalPhotos(
      additionalPhotos.map((photo) =>
        photo.id === id ? { ...photo, photoType } : photo,
      ),
    );
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
        <ThemedText type="smallBold">
          Additional reference photos (optional)
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Extra photos for mood and reference — not the main project photo.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void pickAdditionalPhotos();
          }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.surface },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="small">Add reference photos</ThemedText>
        </Pressable>
        {additionalPhotos.map((photo) => (
          <View key={photo.id} style={styles.fileBlock}>
            <View style={styles.fileRow}>
              <ThemedText type="small" style={styles.fileName}>
                {photo.file.name}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  onChangeAdditionalPhotos(
                    additionalPhotos.filter((item) => item.id !== photo.id),
                  )
                }
              >
                <ThemedText type="small" themeColor="textSecondary">
                  Remove
                </ThemedText>
              </Pressable>
            </View>
            <PhotoTypeToggle
              status={status}
              value={photo.photoType}
              onChange={(photoType) => updatePhotoType(photo.id, photoType)}
            />
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
  fileBlock: {
    gap: Spacing.two,
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
