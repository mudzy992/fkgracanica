import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { QrCodeView } from '../QrCodeView';
import { formatDateBs } from '../../lib/format-date';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Membership } from '../../types/api';

type Props = { membership: Membership };

export function MembershipCardVisual({ membership }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const card = membership.card;
  if (!card) return null;

  return (
    <LinearGradient colors={[colors.primary, '#0B1B3A']} style={styles.card}>
      <Text style={[styles.eyebrow, { color: colors.primaryLight }]}>{t('membershipCard')}</Text>
      <Text style={[styles.number, { color: colors.white }]}>{card.cardNumber}</Text>
      <View style={styles.meta}>
        <View>
          <Text style={[styles.label, { color: colors.primaryLight }]}>{t('status')}</Text>
          <Text style={[styles.value, { color: colors.white }]}>{membership.status}</Text>
        </View>
        <View>
          <Text style={[styles.label, { color: colors.primaryLight }]}>{t('validUntil')}</Text>
          <Text style={[styles.value, { color: colors.white }]}>{formatDateBs(membership.endDate)}</Text>
        </View>
      </View>
      <View style={[styles.qr, { backgroundColor: colors.white }]}>
        <QrCodeView value={card.qrCode} size={160} />
      </View>
      <Text style={[styles.hint, { color: colors.primaryLight }]}>{t('qrHint')}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: spacing.lg, marginBottom: spacing.lg },
  eyebrow: { ...typography.caption, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  number: { ...typography.title, marginTop: spacing.sm, letterSpacing: 1 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  label: { ...typography.caption },
  value: { ...typography.body, fontWeight: '700', marginTop: 2 },
  qr: { alignSelf: 'center', borderRadius: 12, padding: spacing.sm, marginTop: spacing.lg },
  hint: { ...typography.caption, textAlign: 'center', marginTop: spacing.md },
});
