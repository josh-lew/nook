import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthTextField({ label, error, style, ...props }: AuthTextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : theme.border,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
  },
});
