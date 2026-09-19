import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { CraftChips } from '@/components/auth/craft-chips';
import { Spacing } from '@/constants/theme';
import { Craft, useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const validate = () => {
    const next: {
      email?: string;
      name?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email';
    if (!name.trim()) next.name = 'Name is required';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (!confirmPassword) next.confirmPassword = 'Confirm your password';
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setError(null);
    setNeedsEmailConfirm(false);
    if (!validate()) return;

    setLoading(true);
    const result = await signUp({
      email: email.trim(),
      password,
      name: name.trim(),
      crafts,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Email confirmation enabled: no session until the user confirms.
    if (!result.session) {
      setNeedsEmailConfirm(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.five,
            paddingBottom: insets.bottom + Spacing.five,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Create account</Text>
          <Text style={{ color: theme.textSecondary }}>Join Nook and pick your crafts</Text>
        </View>

        <View style={styles.form}>
          <AuthTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            error={fieldErrors.email}
          />
          <AuthTextField
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            error={fieldErrors.name}
          />
          <AuthTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            error={fieldErrors.password}
          />
          <AuthTextField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />

          <CraftChips selected={crafts} onChange={setCrafts} />

          {error ? (
            <Text style={[styles.formError, { color: theme.error }]}>{error}</Text>
          ) : null}
          {needsEmailConfirm ? (
            <Text style={{ color: theme.textSecondary }}>
              Check your email to confirm your account, then log in.
            </Text>
          ) : null}

          <AuthButton label="Create account" onPress={onSubmit} loading={loading} />
        </View>

        <View style={styles.swap}>
          <Text style={{ color: theme.textSecondary }}>Already have an account?</Text>
          <Link href="/login" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.swapLink, { color: theme.textPrimary }]}>Log in</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
  },
  form: {
    gap: Spacing.three,
  },
  formError: {
    fontSize: 14,
  },
  swap: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  swapLink: {
    fontWeight: '600',
    fontSize: 16,
  },
});
