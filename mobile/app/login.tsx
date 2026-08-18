import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LoginCrest } from '../src/components/auth/LoginCrest';
import { useAuth } from '../src/lib/auth';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const target = typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/(tabs)/home';
      router.replace(target as '/(tabs)/home');
    } catch {
      Alert.alert(t('error'), t('invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <LoginCrest />
        <Text style={[styles.title, { color: colors.primary }]}>{t('appName')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('login')}</Text>

        <Text style={[styles.label, { color: colors.textMuted }]}>{t('email')}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
          ]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="admin@fkgracanica.ba"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>{t('password')}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
          ]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
        />

        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }, submitting && styles.buttonDisabled]}
          onPress={() => void handleLogin()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.white }]}>{t('signIn')}</Text>
          )}
        </Pressable>

        <Link href="/(tabs)/home" asChild>
          <Pressable style={styles.skip}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('continueAsGuest')}</Text>
          </Pressable>
        </Link>
        <Link href="/contact" asChild>
          <Pressable style={styles.skip} accessibilityRole="link" accessibilityLabel={t('forgotPassword')}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>{t('forgotPassword')}</Text>
          </Pressable>
        </Link>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('forgotPasswordHint')}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  card: { borderRadius: 12, padding: spacing.lg, borderWidth: 1 },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center', marginBottom: spacing.lg },
  label: { ...typography.caption, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  button: { borderRadius: 8, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  skip: { marginTop: spacing.lg, alignItems: 'center', padding: spacing.sm },
  hint: { ...typography.caption, textAlign: 'center' },
});
