import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
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
          <Text style={[styles.title, { color: theme.text }]}>Log in</Text>
          <Text style={{ color: theme.textSecondary }}>Welcome back to Nook</Text>
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            error={fieldErrors.password}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert('Coming soon', 'Password reset is not available yet.')}
            style={styles.forgot}>
            <Text style={{ color: theme.textSecondary }}>Forgot password?</Text>
          </Pressable>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <AuthButton label="Log in" onPress={onSubmit} loading={loading} />
        </View>

        <View style={styles.swap}>
          <Text style={{ color: theme.textSecondary }}>Don&apos;t have an account?</Text>
          <Link href="/register" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.swapLink, { color: theme.text }]}>Create an account</Text>
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
  forgot: {
    alignSelf: 'flex-end',
  },
  formError: {
    color: '#c44',
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
