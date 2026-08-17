import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { SeasonPassMine } from '../types/api';

type Props = { onShowQr: (value: string) => void; onBuy: () => void };

export function SeasonPassStrip({ onShowQr, onBuy }: Props) {
  const { colors } = useTheme();
  const [data, setData] = useState<SeasonPassMine | null>(null);

  const load = useCallback(async () => {
    try {
      const { data: row } = await api.get<SeasonPassMine>('/ticketing/season-pass/me');
      setData(row);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pass = data?.pass;
  const offer = data?.offer;
  if (pass?.status === 'ACTIVE') {
    return (
      <View style={[styles.card, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
        <Text style={[styles.chip, { color: colors.primaryLight }]}>SEZONA</Text>
        <Text style={[styles.title, { color: colors.text }]}>{pass.label}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{pass.season?.name}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Važi za sve domaće utakmice</Text>
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => onShowQr(pass.qrCode)}
        >
          <Text style={[styles.btnText, { color: colors.white }]}>QR</Text>
        </Pressable>
      </View>
    );
  }
  if (!offer?.available) return null;
  return (
    <Pressable
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}
      onPress={onBuy}
    >
      <Text style={[styles.chip, { color: colors.primaryLight }]}>SEZONA</Text>
      <Text style={[styles.title, { color: colors.text }]}>{offer.label}</Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {offer.season?.name} · {offer.price} KM
      </Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>Važi za sve domaće utakmice</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderRadius: 10, padding: spacing.md },
  chip: { ...typography.caption, fontWeight: '700', letterSpacing: 1.2 },
  title: { ...typography.heading, marginTop: spacing.xs },
  meta: { ...typography.caption, marginTop: spacing.xs },
  hint: { ...typography.caption, marginTop: 2 },
  btn: { marginTop: spacing.sm, borderRadius: 8, paddingVertical: spacing.xs, alignItems: 'center' },
  btnText: { fontWeight: '600' },
});
