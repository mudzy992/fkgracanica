import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { formatDateBs } from '../lib/format-date';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { TicketOrder } from '../types/api';
import { QrCodeView } from './QrCodeView';

type Props = {
  order: TicketOrder;
  onShowQr: (qr: string) => void;
  onRefunded: () => void;
};

export function TicketOrderCard({ order, onShowQr, onRefunded }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [refunding, setRefunding] = useState(false);
  const canRefund = order.status === 'paid';

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await api.post(`/ticketing/orders/${order.id}/refund`);
      onRefunded();
    } finally {
      setRefunding(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.orderTitle, { color: colors.text }]}>
        {t('order')} · {formatDateBs(order.createdAt)}
      </Text>
      <Text style={[styles.status, { color: colors.textMuted }]}>
        {t('status')}: {order.status}
      </Text>
      {order.tickets.map((ticket) => (
        <View key={ticket.id} style={[styles.ticket, { borderTopColor: colors.border }]}>
          <Text style={[styles.ticketLine, { color: colors.text }]}>
            {t('category')}: {ticket.category}
          </Text>
          <Text style={[styles.ticketLine, { color: colors.text }]}>
            {t('price')}: {ticket.price} KM · {ticket.status}
          </Text>
          <Pressable
            style={styles.qrWrap}
            onPress={() => onShowQr(ticket.qrCode)}
            accessibilityRole="button"
            accessibilityLabel={t('showQr')}
          >
            <QrCodeView value={ticket.qrCode} size={120} />
            <Text style={[styles.showQr, { color: colors.accent }]}>{t('showQr')}</Text>
          </Pressable>
        </View>
      ))}
      {canRefund ? (
        <Pressable
          style={[styles.refundBtn, { borderColor: colors.border }]}
          onPress={() => void handleRefund()}
          disabled={refunding}
          accessibilityRole="button"
        >
          <Text style={[styles.refundText, { color: colors.accent }]}>
            {refunding ? t('loading') : t('requestRefund')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, padding: spacing.md, borderWidth: 1, marginBottom: spacing.md },
  orderTitle: { ...typography.heading },
  status: { ...typography.caption, marginTop: spacing.xs },
  ticket: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  ticketLine: { ...typography.body, marginTop: spacing.xs },
  qrWrap: { marginTop: spacing.sm, alignItems: 'flex-start' },
  showQr: { marginTop: spacing.xs, fontWeight: '600' },
  refundBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  refundText: { ...typography.body, fontWeight: '600' },
});
