import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { matchEventLabelKey } from '../../lib/match-events';
import { spacing, typography } from '../../lib/theme';
import type { MatchEvent } from '../../types/api';

export function LiveEventToast({ event }: { event: MatchEvent | null }) {
  const { t } = useTranslation();
  if (!event) return null;
  const player = event.player ? `${event.player.firstName} ${event.player.lastName}` : '';
  return (
    <View style={styles.toast}>
      <Text style={styles.min}>{event.minute}'</Text>
      <Text style={styles.label}>
        {t(matchEventLabelKey(event.type), { type: event.type })}
        {player ? ` — ${player}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  min: { color: '#FACC15', fontWeight: '800' },
  label: { ...typography.body, color: '#fff', flex: 1, fontWeight: '600' },
});
