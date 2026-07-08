import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/lib/api';
import { QrCodeView } from '../../src/components/QrCodeView';
import { RequireAuth } from '../../src/components/RequireAuth';
import { colors, spacing, typography } from '../../src/lib/theme';
import type { TicketOrder } from '../../src/types/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function TicketsBody() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
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
      ListEmptyComponent={<Text style={styles.empty}>{t('noTickets')}</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderTitle}>
            {t('order')} · {formatDate(item.createdAt)}
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
              <View style={styles.qrWrap}>
                <QrCodeView value={ticket.qrCode} size={120} />
              </View>
            </View>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});

export default function TicketsScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/tickets">
      <TicketsBody />
    </RequireAuth>
  );
}
