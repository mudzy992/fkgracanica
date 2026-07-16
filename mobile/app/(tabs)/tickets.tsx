import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/lib/api';
import { QrModal } from '../../src/components/QrModal';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { TicketOrderCard } from '../../src/components/TicketOrderCard';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';
import type { Ticket, TicketOrder } from '../../src/types/api';

type Filter = 'all' | 'valid' | 'used';

const VALID = new Set(['RESERVED', 'PAID_AT_BOX_OFFICE']);

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

  if (loading) return <ScreenLoading />;
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
      <View style={styles.filters}>
        {(['all', 'valid', 'used'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.background },
              filter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text },
                filter === f && { color: colors.white, fontWeight: '600' },
              ]}
            >
              {f === 'all' ? t('filterAll') : f === 'valid' ? t('filterValid') : t('filterUsed')}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={[styles.buyBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/tickets-buy')}
        accessibilityRole="button"
      >
        <Text style={[styles.buyText, { color: colors.white }]}>{t('reserveTicket')}</Text>
      </Pressable>
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
        ListEmptyComponent={<ScreenEmpty message={t('noTickets')} icon="ticket-outline" />}
        renderItem={({ item }) => (
          <TicketOrderCard
            order={item}
            onShowQr={setQrValue}
            onRefunded={() => void loadOrders()}
          />
        )}
      />
      <QrModal value={qrValue} onClose={() => setQrValue(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1 },
  filters: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 16, borderWidth: 1 },
  chipText: { ...typography.caption },
  buyBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buyText: { fontWeight: '600' },
});

export default function TicketsScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/tickets">
      <TicketsBody />
    </RequireAuth>
  );
}
