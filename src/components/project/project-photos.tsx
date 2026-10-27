import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  defaultPhotoType,
  insertProjectPhoto,
  setPrimaryPhoto,
  uploadProjectPhoto,
  type InsertProjectPhotoArgs,
  type ProjectDetail,
  type Stage,
} from "../../../lib/projects";

type AddablePhotoType = InsertProjectPhotoArgs["photo_type"];

const PHOTO_TYPE_OPTIONS: { value: AddablePhotoType; label: string }[] = [
  { value: "inspiration", label: "Inspiration" },
  { value: "progress", label: "Progress" },
  { value: "finished", label: "Finished" },
];

const PHOTO_TYPE_LABELS: Record<string, string> = {
  inspiration: "Inspiration",
  material: "Material",
  progress: "Progress",
  finished: "Finished",
};

type ProjectPhotosProps = {
  project: ProjectDetail;
  stage: Stage;
  disabled?: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  /** Called after any write so the screen can reload the Project. */
  onChanged: () => Promise<void>;
};

/** Photo grid with an add flow (type defaults from the Stage) and cover picking. */
export function ProjectPhotos({
  project,
  stage,
  disabled,
  onBusyChange,
  onError,
  onChanged,
}: ProjectPhotosProps) {
  const theme = useTheme();
  const [photoType, setPhotoType] = useState<AddablePhotoType>(() =>
    defaultPhotoType(stage),
  );
  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<void>) => {
    onError(null);
    setBusy(true);
    onBusyChange(true);
    await work();
    await onChanged();
    setBusy(false);
    onBusyChange(false);
  };

  const addPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      base64: true,
    });

    if (picked.canceled || !picked.assets?.length) {
      return;
    }

    await run(async () => {
      for (const [index, asset] of picked.assets.entries()) {
        const uploadResult = await uploadProjectPhoto(project.id, {
          uri: asset.uri,
          name: asset.fileName ?? `photo-${index + 1}.jpg`,
          type: asset.mimeType ?? "image/jpeg",
          base64: asset.base64 ?? undefined,
        });
        const photoResult =
          uploadResult.error || !uploadResult.data
            ? uploadResult
            : await insertProjectPhoto(project.id, {
                image_url: uploadResult.data.url,
                stage,
                photo_type: photoType,
              });

        if (photoResult.error) {
          onError(`A photo didn’t upload: ${photoResult.error}`);
          break;
        }
      }
    });
  };

  const makeCover = async (photoId: string) => {
    await run(async () => {
      const result = await setPrimaryPhoto(project.id, photoId);
      if (result.error) {
        onError(result.error);
      }
    });
  };

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">Photos</ThemedText>

      {project.photos.length > 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Tap a photo to make it the cover.
        </ThemedText>
      ) : null}

      <View style={styles.grid}>
        {project.photos.map((photo) => {
          const isCover = photo.imageUrl === project.primaryPhotoUrl;
          return (
            <Pressable
              key={photo.id}
              accessibilityRole="button"
              accessibilityLabel={isCover ? "Cover photo" : "Make cover photo"}
              accessibilityState={{ selected: isCover }}
              disabled={disabled || busy || isCover}
              onPress={() => {
                void makeCover(photo.id);
              }}
              style={({ pressed }) => [styles.photoWrap, pressed && styles.pressed]}
            >
              <Image
                source={{ uri: photo.imageUrl }}
                style={[
                  styles.photo,
                  { backgroundColor: theme.border },
                  isCover && { borderColor: theme.primary, borderWidth: 2 },
                ]}
                contentFit="cover"
              />
              <View style={[styles.badge, { backgroundColor: theme.surface }]}>
                <ThemedText type="small">
                  {isCover
                    ? "Cover"
                    : photo.photoType
                      ? PHOTO_TYPE_LABELS[photo.photoType]
                      : "Photo"}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View accessibilityRole="radiogroup" style={styles.chips}>
        {PHOTO_TYPE_OPTIONS.map((option) => {
          const selected = photoType === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} photo`}
              accessibilityState={{ checked: selected }}
              disabled={disabled || busy}
              onPress={() => setPhotoType(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.border : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}
            >
              <ThemedText type="small">{option.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add photos"
        disabled={disabled || busy}
        onPress={() => {
          void addPhotos();
        }}
        style={({ pressed }) => [
          styles.addBtn,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={theme.textSecondary} />
        ) : (
          <>
            <SymbolView
              name={{
                ios: "photo.badge.plus",
                android: "add_photo_alternate",
                web: "add_photo_alternate",
              }}
              size={20}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="small">Add photos</ThemedText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  photoWrap: {
    width: "31%",
    aspectRatio: 1,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: Spacing.one,
  },
  badge: {
    position: "absolute",
    left: Spacing.one,
    bottom: Spacing.one,
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.one,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
