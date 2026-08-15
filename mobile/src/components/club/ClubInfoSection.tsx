import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { ClubStadiumInfo } from './load-club-public';

type Props = { stadium: ClubStadiumInfo };

export function ClubInfoSection({ stadium }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {t('clubStadium')}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <InfoRow icon="business-outline" label={t('clubStadiumName')} value={stadium.name} />
        {stadium.city ? (
          <InfoRow icon="location-outline" label={t('clubStadiumCity')} value={stadium.city} />
        ) : null}
        {stadium.address ? (
          <InfoRow icon="map-outline" label={t('clubStadiumAddress')} value={stadium.address} />
        ) : null}
        {stadium.capacity != null ? (
          <InfoRow
            icon="people-outline"
            label={t('clubStadiumCapacity')}
            value={String(stadium.capacity)}
          />
        ) : null}
        {stadium.description ? (
          <Text style={[styles.desc, { color: colors.textMuted, borderTopColor: colors.border }]}>
            {stadium.description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={colors.link} style={styles.icon} />
      <View style={styles.rowBody}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingHorizontal: spacing.md },
  title: { ...typography.heading, fontWeight: '800' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  icon: { marginTop: 2 },
  rowBody: { flex: 1, gap: 2 },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: { ...typography.body, fontWeight: '600' },
  desc: {
    ...typography.body,
    borderTopWidth: 1,
    paddingTop: spacing.md,
    lineHeight: 22,
  },
});
