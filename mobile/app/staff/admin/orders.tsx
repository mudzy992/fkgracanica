import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequirePermission } from '../../../src/components/RequirePermission';
import { ScreenEmpty } from '../../../src/components/ScreenEmpty';
import { api } from '../../../src/lib/api';
import { asArray, asRecord, asString } from '../../../src/lib/content-helpers';
import { useTheme } from '../../../src/lib/theme-context';
import { spacing, typography } from '../../../src/lib/theme';

type OrderItem = { id: string; status: string; email: string; match: string; total: string };

export default function AdminOrdersScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [items, setItems] = useState<OrderItem[]>([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/ticketing/admin/orders', { params: { limit: 50 } });
      setItems(
        asArray(asRecord(data).data ?? data).map((row, i) => {
          const order = asRecord(row);
          const user = asRecord(order.user);
          const tickets = asArray(order.tickets);
          const first = asRecord(tickets[0]);
          const match = asRecord(first.match);
          const home = asString(asRecord(match.homeClub).name, '');
          const away = asString(asRecord(match.awayClub).name, '');
          return {
            id: asString(order.id, String(i)),
            status: asString(order.status, '-'),
            email: asString(user.email, '-'),
            match: home && away ? `${home} vs ${away}` : asString(order.id, '-'),
            total: asString(order.totalAmount ?? order.amount ?? tickets.length, String(tickets.length)),
          };
        }),
      );
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequirePermission permission="ticketing.manage" returnTo="/staff/admin/orders">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
        ListEmptyComponent={<ScreenEmpty message={t('noOrders')} icon="ticket-outline" />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.name, { color: colors.text }]}>{item.match}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.email}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.status}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{item.total}</Text>
          </View>
        )}
      />
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  name: { ...typography.body, fontWeight: '600' },
  meta: { ...typography.caption, marginTop: spacing.xs },
});
