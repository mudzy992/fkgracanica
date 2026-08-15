import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { spacing } from '../lib/theme';
import type { ShowcaseBadge } from './types';

const LABELS: Record<ShowcaseBadge, string> = {
  ready: 'Spremno',
  in_progress: 'U toku',
  after_launch: 'Poslije lansiranja',
  web_only: 'Web admin',
};

export function StatusChip({ badge, percent }: { badge: ShowcaseBadge; percent?: number }) {
  const { colors } = useTheme();
  const label = badge === 'in_progress' && percent != null ? `${LABELS[badge]} · ${percent}%` : LABELS[badge];
  const bg =
    badge === 'ready' ? colors.success : badge === 'in_progress' ? '#B45309' : colors.surface;
  const fg = badge === 'web_only' || badge === 'after_launch' ? colors.textMuted : colors.white;

  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  text: { fontSize: 11, fontWeight: '600' },
});
