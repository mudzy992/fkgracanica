import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoginCrest } from '../src/components/auth/LoginCrest';
import { LoginFields } from '../src/components/auth/LoginFields';
import { PrimaryButton } from '../src/components/primitives/PrimaryButton';
import { useAuth } from '../src/lib/auth';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <LoginCrest />
        <Text style={[styles.title, { color: colors.text }]}>{t('appName')}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('loginLead')}</Text>
      </View>
      <View style={[styles.plate, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <LoginFields email={email} password={password} onEmail={setEmail} onPassword={setPassword} />
        <View style={styles.actions}>
          <PrimaryButton
            label={submitting ? t('signingIn') : t('signIn')}
            loading={submitting}
            disabled={!email.trim() || !password}
            onPress={() => void handleLogin()}
          />
          <Link href="/(tabs)/home" asChild>
            <Pressable style={styles.link} accessibilityRole="link">
              <Text style={[styles.linkText, { color: colors.primaryLight }]}>{t('continueAsGuest')}</Text>
            </Pressable>
          </Link>
          <Link href="/contact" asChild>
            <Pressable style={styles.link} accessibilityRole="link" accessibilityLabel={t('forgotPassword')}>
              <Text style={[styles.forgot, { color: colors.textMuted }]}>{t('forgotPassword')}</Text>
            </Pressable>
          </Link>
          <Text style={[styles.hint, { color: colors.textMuted }]}>{t('forgotPasswordHint')}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center', gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  title: { ...typography.title, fontWeight: '800', textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center' },
  plate: { borderRadius: 24, borderWidth: 1, padding: spacing.lg },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  link: { alignItems: 'center', paddingVertical: spacing.sm },
  linkText: { fontWeight: '700' },
  forgot: { fontWeight: '600' },
  hint: { ...typography.caption, textAlign: 'center' },
});
