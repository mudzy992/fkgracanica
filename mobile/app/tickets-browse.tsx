import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { TicketBrowseSteps } from '../src/components/TicketBrowseSteps';
import { PrimaryButton } from '../src/components/primitives/PrimaryButton';
import { api } from '../src/lib/api';
import { useAuth } from '../src/lib/auth';
import { asArray, asNumber, asRecord, asString } from '../src/lib/content-helpers';
import { formatDateTimeBs } from '../src/lib/format-date';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';

type BrowseRow = { id: string; title: string; meta: string; prices: string };

export default function TicketsBrowseScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [rows, setRows] = useState<BrowseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [matchesRes, configRes] = await Promise.all([
        api.get('/ticketing/matches/ticketable'),
        api.get('/ticketing/config'),
      ]);
      const categories = asArray(asRecord(configRes.data).categories);
      const priceLabel = categories
        .map((cat) => {
          const item = asRecord(cat);
          const label = asString(item.label, asString(item.id, '—'));
          const price = asNumber(item.price, Number(asString(item.price, '0')));
          return `${label}: ${price} KM`;
        })
        .join(' · ');
      setRows(
        asArray(matchesRes.data).map((match, index) => {
          const item = asRecord(match);
          const home = asRecord(item.homeClub);
          const away = asRecord(item.awayClub);
          return {
            id: asString(item.id, String(index)),
            title: `${asString(home.name, 'Domaći')} vs ${asString(away.name, 'Gosti')}`,
            meta: formatDateTimeBs(asString(item.scheduledAt)),
            prices: priceLabel,
          };
        }),
      );
    } catch {
      setRows([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ListSkeleton />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void load().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.list}>
      <TicketBrowseSteps active={1} />
      <Text style={[styles.title, { color: colors.text }]}>{t('browseTickets')}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('ticketsBrowseHint')}</Text>
      {rows.length === 0 ? (
        <ScreenEmpty message={t('noMatches')} compact />
      ) : (
        rows.map((row) => (
          <View key={row.id} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.name, { color: colors.text }]}>{row.title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{row.meta}</Text>
            {row.prices ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {t('price')}: {row.prices}
              </Text>
            ) : null}
          </View>
        ))
      )}
      <PrimaryButton
        label={t('buyTickets')}
        onPress={() => {
          if (isAuthenticated) {
            router.push('/tickets-buy');
            return;
          }
          router.push({ pathname: '/login', params: { returnTo: '/tickets-buy' } });
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm },
  title: { ...typography.title },
  hint: { ...typography.caption, marginBottom: spacing.sm },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
