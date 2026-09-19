import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
};

export function AuthButton({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}: AuthButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? { backgroundColor: theme.primary }
          : { backgroundColor: 'transparent' },
        (pressed || isDisabled) && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.background : theme.textPrimary} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isPrimary ? theme.background : theme.textPrimary },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    minHeight: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
