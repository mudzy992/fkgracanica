import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUnreadNotifications } from '../../hooks/use-unread-notifications';
import { api } from '../../lib/api';
import { formatDateTimeBs } from '../../lib/format-date';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { Match, Membership } from '../../types/api';

function pickCurrent(items: Membership[]) {
  return items.find((m) => m.status === 'ACTIVE') ?? items.find((m) => m.status === 'PENDING') ?? items[0];
}

export function MemberHomeStrip({ memberships }: { memberships: Membership[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { count } = useUnreadNotifications();
  const [next, setNext] = useState<Match | null>(null);
  const current = pickCurrent(memberships);
  const statusLabel =
    current?.status === 'ACTIVE' ? t('statusActive')
    : current?.status === 'PENDING' ? t('statusPending')
    : current?.status === 'SUSPENDED' ? t('statusSuspended')
    : current?.status === 'EXPIRED' ? t('statusExpired')
    : current?.status === 'CANCELLED' ? t('statusCancelled')
    : t('notAMember');

  useEffect(() => {
    void api
      .get<Match | null>('/public/next-home-match')
      .then(({ data }) => setNext(data))
      .catch(() => setNext(null));
  }, []);

  const nextLabel = next
    ? `${next.homeClub?.name ?? '—'} – ${next.awayClub?.name ?? '—'}`
    : t('noNextMatch');

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('membership')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{statusLabel}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {current?.card ? current.card.cardNumber : t('digitalCardAfter')}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(next ? `/(tabs)/live/${next.id}` : '/(tabs)/tickets')}
        style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('nextMatch')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{nextLabel}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {next ? formatDateTimeBs(next.scheduledAt) : t('tickets')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/notifications')}
        style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('unreadShort')}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{count}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('notifications')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, marginBottom: spacing.md },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md },
  kicker: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { ...typography.body, fontWeight: '700', marginTop: 4 },
  hint: { ...typography.caption, marginTop: 4 },
});
