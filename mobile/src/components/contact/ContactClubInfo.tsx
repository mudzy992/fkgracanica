import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';
import { openMaps } from '../../lib/open-maps';
import { usePublicSettings } from '../../lib/use-public-settings';

export function ContactClubInfo() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const settings = usePublicSettings();
  const email = settings['contact.email'];
  const phone = settings['contact.phone'];
  const address = settings['contact.address'];
  if (!email && !phone && !address) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('contactInfo')}</Text>
      {email ? (
        <InfoRow icon="mail-outline" label={t('email')} value={email} onPress={() => void Linking.openURL(`mailto:${email}`)} />
      ) : null}
      {phone ? (
        <InfoRow
          icon="call-outline"
          label={t('contactPhone')}
          value={phone}
          onPress={() => void Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)}
        />
      ) : null}
      {address ? (
        <Pressable
          onPress={() => void openMaps(address)}
          accessibilityRole="link"
          accessibilityLabel={t('openMap')}
          style={[styles.map, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Ionicons name="location" size={28} color={colors.primaryLight} />
          <View style={styles.mapCopy}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{t('contactAddress')}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{address}</Text>
            <Text style={[styles.cta, { color: colors.primaryLight }]}>{t('openMap')}</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: 'mail-outline' | 'call-outline';
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={`${label}: ${value}`} style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.primaryLight} />
      <View style={styles.mapCopy}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  heading: { ...typography.heading },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  map: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 12, borderWidth: 1, padding: spacing.md },
  mapCopy: { flex: 1, gap: 2 },
  label: { ...typography.caption, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  value: { ...typography.body, fontWeight: '600' },
  cta: { ...typography.caption, fontWeight: '700', marginTop: 2 },
});
