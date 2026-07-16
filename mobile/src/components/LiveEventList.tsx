import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { matchEventLabelKey } from '../lib/match-events';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { MatchEvent } from '../types/api';

type Props = { events: MatchEvent[]; connected: boolean };

export function LiveEventList({ events, connected }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.box, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('liveUpdates')}</Text>
        <Text style={[styles.status, { color: connected ? colors.success : colors.textMuted }]}>
          {connected ? t('socketConnected') : t('socketDisconnected')}
        </Text>
      </View>
      {events.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('noEvents')}</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.row, { borderTopColor: colors.border }]}>
              <Text style={[styles.minute, { color: colors.primary }]}>{item.minute}&apos;</Text>
              <Text style={[styles.label, { color: colors.text }]}>
                {t(matchEventLabelKey(item.type), { type: item.type })}
                {item.description ? ` — ${item.description}` : ''}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 10, padding: spacing.md, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.heading },
  status: { ...typography.caption, fontWeight: '600' },
  empty: { ...typography.body, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  minute: { fontWeight: '700', minWidth: 28 },
  label: { ...typography.body, flex: 1 },
});
