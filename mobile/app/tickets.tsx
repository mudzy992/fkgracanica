import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api } from '../src/lib/api';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { QrModal } from '../src/components/QrModal';
import { PrimaryButton } from '../src/components/primitives/PrimaryButton';
import { RequireAuth } from '../src/components/RequireAuth';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { SeasonPassStrip } from '../src/components/SeasonPassStrip';
import { TicketOrderCard } from '../src/components/TicketOrderCard';
import { useTheme } from '../src/lib/theme-context';
import { spacing, typography } from '../src/lib/theme';
import type { Ticket, TicketOrder } from '../src/types/api';

type Filter = 'all' | 'valid' | 'used';
const VALID = new Set(['PAID_AT_BOX_OFFICE']);

function ticketMatches(ticket: Ticket, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'valid') return VALID.has(ticket.status);
  return ticket.status === 'USED';
}

function TicketsBody() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get<TicketOrder[]>('/ticketing/orders');
      setOrders(data);
    } catch {
      setOrders([]);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  const filtered = useMemo(
    () =>
      orders
        .map((o) => ({ ...o, tickets: o.tickets.filter((tk) => ticketMatches(tk, filter)) }))
        .filter((o) => o.tickets.length > 0),
    [orders, filter],
  );

  if (loading) return <ListSkeleton rows={4} />;
  if (error) {
    return (
      <ScreenEmpty
        message={error}
        icon="alert-circle-outline"
        actionLabel={t('retry')}
        onAction={() => {
          setLoading(true);
          void loadOrders().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadOrders().finally(() => setRefreshing(false));
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.filters}>
              {(['all', 'valid', 'used'] as Filter[]).map((f) => {
                const active = filter === f;
                return (
                  <Pressable
                    key={f}
                    style={[
                      styles.chip,
                      { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.background },
                    ]}
                    onPress={() => setFilter(f)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.white : colors.text }]}>
                      {f === 'all' ? t('filterAll') : f === 'valid' ? t('filterValid') : t('filterUsed')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <SeasonPassStrip onShowQr={setQrValue} onBuy={() => router.push('/tickets-buy')} />
            <PrimaryButton label={t('reserveTicket')} onPress={() => router.push('/tickets-buy')} />
          </View>
        }
        ListEmptyComponent={<ScreenEmpty message={t('noTickets')} icon="ticket-outline" compact />}
        renderItem={({ item }) => (
          <TicketOrderCard order={item} onShowQr={setQrValue} onChanged={() => void loadOrders()} />
        )}
      />
      <QrModal value={qrValue} onClose={() => setQrValue(null)} />
    </>
  );
}

export default function TicketsScreen() {
  const { t } = useTranslation();
  return (
    <RequireAuth returnTo="/tickets">
      <Stack.Screen options={{ title: t('tickets') }} />
      <TicketsBody />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1, gap: spacing.sm },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  filters: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 1 },
  chipText: { ...typography.caption, fontWeight: '700' },
});
