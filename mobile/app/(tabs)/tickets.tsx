import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/lib/api';
import { QrCodeView } from '../../src/components/QrCodeView';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { formatDateBs } from '../../src/lib/format-date';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { Ticket, TicketOrder } from '../../src/types/api';

type Filter = 'all' | 'valid' | 'used';

const VALID = new Set(['RESERVED', 'PAID_AT_BOX_OFFICE']);

function ticketMatches(ticket: Ticket, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'valid') return VALID.has(ticket.status);
  return ticket.status === 'USED';
}

function TicketsBody() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [qrValue, setQrValue] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get<TicketOrder[]>('/ticketing/orders');
      setOrders(data);
    } catch {
      setOrders([]);
    }
  }, []);

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

  return (
    <>
      <View style={styles.filters}>
        {(['all', 'valid', 'used'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f === 'all' ? t('filterAll') : f === 'valid' ? t('filterValid') : t('filterUsed')}
            </Text>
          </Pressable>
        ))}
      </View>
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
          <View style={styles.card}>
            <Text style={styles.orderTitle}>
              {t('order')} · {formatDateBs(item.createdAt)}
            </Text>
            <Text style={styles.status}>
              {t('status')}: {item.status}
            </Text>
            {item.tickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticket}>
                <Text style={styles.ticketLine}>
                  {t('category')}: {ticket.category}
                </Text>
                <Text style={styles.ticketLine}>
                  {t('price')}: {ticket.price} KM
                </Text>
                <Text style={styles.ticketLine}>
                  {t('status')}: {ticket.status}
                </Text>
                <Pressable
                  style={styles.qrWrap}
                  onPress={() => setQrValue(ticket.qrCode)}
                  accessibilityLabel={t('showQr')}
                >
                  <QrCodeView value={ticket.qrCode} size={120} />
                  <Text style={styles.showQr}>{t('showQr')}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      />
      <Modal visible={!!qrValue} transparent animationType="fade" onRequestClose={() => setQrValue(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setQrValue(null)}>
          <View style={styles.modalCard}>
            {qrValue ? <QrCodeView value={qrValue} size={260} /> : null}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, flexGrow: 1 },
  filters: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: 0 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  orderTitle: { ...typography.heading, color: colors.text },
  status: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  ticket: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ticketLine: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  qrWrap: { marginTop: spacing.sm, alignItems: 'flex-start' },
  showQr: { color: colors.accent, marginTop: spacing.xs, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg },
});

export default function TicketsScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/tickets">
      <TicketsBody />
    </RequireAuth>
  );
}
