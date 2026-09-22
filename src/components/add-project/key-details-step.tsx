import * as ImagePicker from "expo-image-picker";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { PhotoTypeToggle } from "@/components/add-project/photo-type-toggle";
import type { ProjectPhotoType } from "@/components/add-project/photo-type";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { HobbyType, ProjectStatus, UploadFile } from "../../../lib/projects";

const HOBBY_OPTIONS: { value: HobbyType; label: string }[] = [
  { value: "crochet", label: "Crochet" },
  { value: "knit", label: "Knit" },
  { value: "sewing", label: "Sewing" },
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

type KeyDetailsStepProps = {
  title: string;
  hobbyType: HobbyType | null;
  status: ProjectStatus;
  primaryPhoto: UploadFile | null;
  primaryPhotoType: ProjectPhotoType;
  titleError?: string | null;
  hobbyError?: string | null;
  onChangeTitle: (value: string) => void;
  onChangeHobby: (value: HobbyType) => void;
  onChangeStatus: (value: ProjectStatus) => void;
  onChangePrimaryPhoto: (file: UploadFile | null) => void;
  onChangePrimaryPhotoType: (value: ProjectPhotoType) => void;
};

export function KeyDetailsStep({
  title,
  hobbyType,
  status,
  primaryPhoto,
  primaryPhotoType,
  titleError,
  hobbyError,
  onChangeTitle,
  onChangeHobby,
  onChangeStatus,
  onChangePrimaryPhoto,
  onChangePrimaryPhotoType,
}: KeyDetailsStepProps) {
  const theme = useTheme();

  const pickPrimaryPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.85,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    onChangePrimaryPhoto({
      uri: asset.uri,
      name: asset.fileName ?? "project-photo.jpg",
      type: asset.mimeType ?? "image/jpeg",
      base64: asset.base64 ?? undefined,
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Title
        </ThemedText>
        <TextInput
          accessibilityLabel="Title"
          value={title}
          onChangeText={onChangeTitle}
          placeholder="e.g. Cosy winter scarf"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              color: theme.textPrimary,
              backgroundColor: theme.surface,
              borderColor: titleError ? theme.error : theme.border,
            },
          ]}
        />
        {titleError ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {titleError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Hobby
        </ThemedText>
        <View style={styles.chips}>
          {HOBBY_OPTIONS.map((option) => {
            const selected = hobbyType === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChangeHobby(option.value)}
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
        {hobbyError ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {hobbyError}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Status
        </ThemedText>
        <View style={styles.chips}>
          {STATUS_OPTIONS.map((option) => {
            const selected = status === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChangeStatus(option.value)}
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
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Project photo</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Add a photo to represent this project — you can update it as things
          progress.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void pickPrimaryPhoto();
          }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.surface },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="small">
            {primaryPhoto ? "Replace project photo" : "Choose project photo"}
          </ThemedText>
        </Pressable>
        {primaryPhoto ? (
          <View style={styles.fileBlock}>
            <View style={styles.fileRow}>
              <ThemedText type="small" style={styles.fileName}>
                {primaryPhoto.name}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => onChangePrimaryPhoto(null)}
              >
                <ThemedText type="small" themeColor="textSecondary">
                  Remove
                </ThemedText>
              </Pressable>
            </View>
            <PhotoTypeToggle
              status={status}
              value={primaryPhotoType}
              onChange={onChangePrimaryPhotoType}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
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
});
