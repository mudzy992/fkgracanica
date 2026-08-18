import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { startMobileCheckout } from '../lib/start-mobile-checkout';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { SeasonPassMine } from '../types/api';

export function SeasonPassBuyCard() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [data, setData] = useState<SeasonPassMine | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .get<SeasonPassMine>('/ticketing/season-pass/me')
      .then(({ data: row }) => setData(row))
      .catch(() => setData(null));
  }, []);

  const buy = useCallback(async () => {
    if (!data?.offer.available || data.pass?.status === 'ACTIVE') return;
    setBusy(true);
    setError(null);
    try {
      const opened =
        data.pass?.status === 'PENDING'
          ? data.pass
          : (await api.post<{ id: string; status: string }>('/ticketing/season-pass/open')).data;
      if (!data.offer.salesModes.online) return;
      const result = await startMobileCheckout({ kind: 'season', body: { passId: opened.id } });
      if (result === 'cancelled') setError(t('paymentCancelled'));
      if (result === 'paid') {
        const { data: row } = await api.get<SeasonPassMine>('/ticketing/season-pass/me');
        setData(row);
      }
    } catch {
      setError(t('paymentFailed'));
    } finally {
      setBusy(false);
    }
  }, [data, t]);

  const offer = data?.offer;
  if (!offer?.available || data?.pass?.status === 'ACTIVE') return null;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{offer.label}</Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {offer.season?.name} · {offer.price} KM
      </Text>
      <Pressable
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={() => void buy()}
        disabled={busy}
        accessibilityRole="button"
      >
        <Text style={[styles.btnText, { color: colors.white }]}>
          {busy ? t('loading') : offer.salesModes.online ? t('buySeasonPass') : t('seasonPassBoxOffice')}
        </Text>
      </Pressable>
      {error ? <Text style={[styles.meta, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { margin: spacing.md, borderWidth: 1, borderRadius: 10, padding: spacing.md },
  title: { ...typography.heading },
  meta: { ...typography.caption, marginTop: spacing.xs },
  btn: { marginTop: spacing.sm, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center' },
  btnText: { fontWeight: '600' },
});
