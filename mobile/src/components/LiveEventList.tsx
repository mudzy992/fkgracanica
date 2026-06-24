import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { matchEventLabelKey } from '../lib/match-events';
import { colors, spacing, typography } from '../lib/theme';
import type { MatchEvent } from '../types/api';

type Props = { events: MatchEvent[]; connected: boolean };

export function LiveEventList({ events, connected }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('liveUpdates')}</Text>
        <Text style={[styles.status, connected ? styles.on : styles.off]}>
          {connected ? t('socketConnected') : t('socketDisconnected')}
        </Text>
      </View>
      {events.length === 0 ? (
        <Text style={styles.empty}>{t('noEvents')}</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.minute}>{item.minute}&apos;</Text>
              <Text style={styles.label}>
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
  box: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.heading, color: colors.text },
  status: { ...typography.caption, fontWeight: '600' },
  on: { color: colors.success },
  off: { color: colors.textMuted },
  empty: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  minute: { fontWeight: '700', color: colors.primary, minWidth: 28 },
  label: { ...typography.body, color: colors.text, flex: 1 },
});
