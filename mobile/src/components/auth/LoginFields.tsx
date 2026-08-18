import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';

type Props = {
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
};

export function LoginFields({ email, password, onEmail, onPassword }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('email')}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        value={email}
        onChangeText={onEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="ime@fkgracanica.ba"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('email')}
      />
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('password')}</Text>
      <View style={[styles.passRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.passInput, { color: colors.text }]}
          value={password}
          onChangeText={onPassword}
          secureTextEntry={!visible}
          autoComplete="password"
          textContentType="password"
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t('password')}
        />
        <Pressable
          onPress={() => setVisible((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={visible ? t('hidePassword') : t('showPassword')}
          style={styles.eye}
        >
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    fontSize: 16,
  },
  passRow: {
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passInput: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 6, fontSize: 16 },
  eye: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
