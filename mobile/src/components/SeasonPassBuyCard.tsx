import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { SeasonPassMine } from '../types/api';

const WEB = 'https://fkgracanica.ba101.top';

export function SeasonPassBuyCard() {
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
      const provider = 'stripe';
      const { data: session } = await api.post<{ url: string }>('/payments/checkout/season-pass', {
        passId: opened.id,
        provider,
        successUrl: `${WEB}/ulaznice?kind=season&paid=1&provider=${provider}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${WEB}/ulaznice?kind=season&cancelled=1`,
      });
      if (session.url) await Linking.openURL(session.url);
    } catch {
      setError('Kupovina nije uspjela.');
    } finally {
      setBusy(false);
    }
  }, [data]);

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
      >
        <Text style={[styles.btnText, { color: colors.white }]}>
          {busy ? '...' : offer.salesModes.online ? 'Kupi sezonsku kartu' : 'Dostupno na blagajni'}
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
