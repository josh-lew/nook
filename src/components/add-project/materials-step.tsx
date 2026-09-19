import * as ImagePicker from "expo-image-picker";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import type { UploadFile } from "../../../lib/projects";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type MaterialDraft = {
  id: string;
  name: string;
  url: string;
  photo: UploadFile | null;
  comment: string;
};

type MaterialsStepProps = {
  materials: MaterialDraft[];
  onChange: (materials: MaterialDraft[]) => void;
};

export function MaterialsStep({ materials, onChange }: MaterialsStepProps) {
  const theme = useTheme();

  const updateAt = (index: number, patch: Partial<MaterialDraft>) => {
    onChange(
      materials.map((material, i) =>
        i === index ? { ...material, ...patch } : material,
      ),
    );
  };

  const addMaterial = () => {
    onChange([
      ...materials,
      {
        id: `${Date.now()}-${materials.length}`,
        name: "",
        url: "",
        photo: null,
        comment: "",
      },
    ]);
  };

  const pickPhoto = async (index: number) => {
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
    updateAt(index, {
      photo: {
        uri: asset.uri,
        name: asset.fileName ?? `material-${index + 1}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
        base64: asset.base64 ?? undefined,
      },
    });
  };

  return (
    <View style={styles.wrapper}>
      <ThemedText type="small" themeColor="textSecondary">
        Optional. Add yarns, fabric, or notions — you can skip this step.
      </ThemedText>

      {materials.map((material, index) => (
        <View
          key={material.id}
          style={[
            styles.card,
            { backgroundColor: theme.surface },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText type="smallBold">Material {index + 1}</ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                onChange(materials.filter((_, i) => i !== index))
              }
            >
              <ThemedText type="small" themeColor="textSecondary">
                Remove
              </ThemedText>
            </Pressable>
          </View>

          <TextInput
            accessibilityLabel={`Material ${index + 1} name`}
            value={material.name}
            onChangeText={(name) => updateAt(index, { name })}
            placeholder="Name"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
          />
          <TextInput
            accessibilityLabel={`Material ${index + 1} url`}
            value={material.url}
            onChangeText={(url) => updateAt(index, { url })}
            placeholder="Link (optional)"
            autoCapitalize="none"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
          />
          <TextInput
            accessibilityLabel={`Material ${index + 1} comment`}
            value={material.comment}
            onChangeText={(comment) => updateAt(index, { comment })}
            placeholder="Comment (optional)"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => pickPhoto(index)}
            style={({ pressed }) => [
              styles.photoBtn,
              { borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="small">
              {material.photo
                ? `Photo: ${material.photo.name}`
                : "Add photo (optional)"}
            </ThemedText>
          </Pressable>
        </View>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={addMaterial}
        style={({ pressed }) => [
          styles.addBtn,
          { backgroundColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="smallBold">Add material</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  photoBtn: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
