import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { RequireAuth } from '../src/components/RequireAuth';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { ScreenLoading } from '../src/components/ScreenLoading';
import { TicketReserveForm } from '../src/components/TicketReserveForm';
import { api } from '../src/lib/api';
import { formatDateTimeBs } from '../src/lib/format-date';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';
import type { Match, MatchAvailability, TicketCategory, TicketingConfig } from '../src/types/api';

function TicketsBuyBody() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<MatchAvailability | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadBase = useCallback(async () => {
    try {
      setError(null);
      const [mRes, cRes] = await Promise.all([
        api.get<Match[]>('/ticketing/matches/ticketable'),
        api.get<TicketingConfig>('/ticketing/config'),
      ]);
      setMatches(Array.isArray(mRes.data) ? mRes.data : []);
      setCategories((cRes.data.categories ?? []).filter((c) => c.isActive !== false));
    } catch {
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void loadBase().finally(() => setLoading(false));
  }, [loadBase]);

  useEffect(() => {
    if (!matchId) {
      setAvailability(null);
      return;
    }
    void api
      .get<MatchAvailability>(`/ticketing/matches/${matchId}/availability`)
      .then(({ data }) => setAvailability(data))
      .catch(() => setAvailability(null));
  }, [matchId]);

  const selected = categories.find((c) => c.id === categoryId);
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  const handleReserve = async () => {
    if (!matchId || !selected) return;
    setSubmitting(true);
    try {
      await api.post('/ticketing/reserve', {
        matchId,
        category: selected.label,
        categoryId: selected.id,
        price: selected.price,
        quantity: qty,
        paymentIntent: 'box_office',
      });
      router.replace('/(tabs)/tickets');
    } catch {
      setError(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ScreenLoading />;
  if (error && matches.length === 0) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadBase().finally(() => setLoading(false));
        }}
      />
    );
  }

  if (!matchId) {
    return (
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<ScreenEmpty message={t('noMatches')} icon="football-outline" />}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setMatchId(item.id)}
            accessibilityRole="button"
          >
            <Text style={[styles.matchTitle, { color: colors.text }]}>
              {item.homeClub.name} {t('vs')} {item.awayClub.name}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {formatDateTimeBs(item.scheduledAt)}
            </Text>
          </Pressable>
        )}
      />
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <TicketReserveForm
        categories={categories}
        availability={availability}
        categoryId={categoryId}
        quantity={quantity}
        submitting={submitting}
        error={error}
        onBack={() => setMatchId(null)}
        onSelectCategory={setCategoryId}
        onChangeQuantity={setQuantity}
        onReserve={() => void handleReserve()}
      />
    </ScrollView>
  );
}

export default function TicketsBuyScreen() {
  const { t } = useTranslation();
  return (
    <RequireAuth returnTo="/tickets-buy">
      <Stack.Screen options={{ title: t('reserveTicket') }} />
      <TicketsBuyBody />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1 },
  card: { borderRadius: 10, padding: spacing.md, borderWidth: 1, marginBottom: spacing.md },
  matchTitle: { ...typography.heading },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
