import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { formatDateBs } from '../lib/format-date';
import { startMobileCheckout } from '../lib/start-mobile-checkout';
import { canCancelOrder, canPayOrderOnline, canShowTicketQr } from '../lib/ticketing-status';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import { ticketStatusKey } from './ticket-status';
import type { TicketOrder } from '../types/api';
import { QrCodeView } from './QrCodeView';

type Props = {
  order: TicketOrder;
  onShowQr: (qr: string) => void;
  onChanged: () => void;
};

export function TicketOrderCard({ order, onShowQr, onChanged }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const canPay = canPayOrderOnline(order);
  const canCancel = canCancelOrder(order);
  const canRefund = order.status === 'paid';

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
      onChanged();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.orderTitle, { color: colors.text }]}>
        {t('order')} · {formatDateBs(order.createdAt)}
      </Text>
      <Text style={[styles.status, { color: colors.textMuted }]}>
        {t('status')}: {t(ticketStatusKey(order.status))}
      </Text>
      {order.tickets.map((ticket) => {
        const showQr = canShowTicketQr(ticket.status);
        return (
          <View key={ticket.id} style={[styles.ticket, { borderTopColor: colors.border }]}>
            <Text style={[styles.ticketLine, { color: colors.text }]}>
              {t('category')}: {ticket.category}
            </Text>
            <Text style={[styles.ticketLine, { color: colors.text }]}>
              {t('price')}: {ticket.price} KM · {t(ticketStatusKey(ticket.status))}
            </Text>
            {showQr ? (
              <Pressable style={styles.qrWrap} onPress={() => onShowQr(ticket.qrCode)} accessibilityRole="button">
                <QrCodeView value={ticket.qrCode} size={120} />
                <Text style={[styles.showQr, { color: colors.accent }]}>{t('showQr')}</Text>
              </Pressable>
            ) : ticket.status === 'RESERVED' ? (
              <Text style={[styles.hint, { color: colors.textMuted }]}>{t('payReservedHint')}</Text>
            ) : null}
          </View>
        );
      })}
      {canPay ? (
        <Pressable
          style={[styles.refundBtn, { borderColor: colors.border }]}
          disabled={busy}
          onPress={() =>
            void run(async () => {
              await startMobileCheckout({ kind: 'tickets', body: { orderId: order.id } });
            })
          }
          accessibilityRole="button"
        >
          <Text style={[styles.refundText, { color: colors.accent }]}>{busy ? t('loading') : t('payOnline')}</Text>
        </Pressable>
      ) : null}
      {canCancel ? (
        <Pressable
          style={[styles.refundBtn, { borderColor: colors.border }]}
          disabled={busy}
          onPress={() => void run(async () => {
            await api.post(`/ticketing/orders/${order.id}/cancel`);
          })}
          accessibilityRole="button"
        >
          <Text style={[styles.refundText, { color: colors.danger }]}>{t('cancelReservation')}</Text>
        </Pressable>
      ) : null}
      {canRefund ? (
        <Pressable
          style={[styles.refundBtn, { borderColor: colors.border }]}
          disabled={busy}
          onPress={() => void run(async () => {
            await api.post(`/ticketing/orders/${order.id}/refund`);
          })}
          accessibilityRole="button"
        >
          <Text style={[styles.refundText, { color: colors.accent }]}>{busy ? t('loading') : t('requestRefund')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: spacing.md, borderWidth: 1, marginBottom: spacing.md },
  orderTitle: { ...typography.heading },
  status: { ...typography.caption, marginTop: spacing.xs },
  ticket: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderStyle: 'dashed' },
  ticketLine: { ...typography.body, marginTop: spacing.xs },
  qrWrap: { marginTop: spacing.sm, alignItems: 'flex-start' },
  showQr: { marginTop: spacing.xs, fontWeight: '600' },
  hint: { ...typography.caption, marginTop: spacing.sm },
  refundBtn: { marginTop: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, alignItems: 'center' },
  refundText: { ...typography.body, fontWeight: '600' },
});
