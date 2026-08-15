import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import { StatusChip } from './StatusChip';
import type { ShowcaseBadge, ShowcaseModule } from './types';

const ORDER: ShowcaseBadge[] = ['ready', 'in_progress', 'web_only', 'after_launch'];
const TITLES: Record<ShowcaseBadge, string> = {
  ready: 'Spremno',
  in_progress: 'U toku',
  web_only: 'Web admin',
  after_launch: 'Poslije lansiranja',
};

export function RoadmapBlock({ modules }: { modules: ShowcaseModule[] }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.text }]}>Mapa isporuke</Text>
      {ORDER.map((badge) => {
        const items = modules.filter((m) => m.badge === badge);
        if (!items.length) return null;
        return (
          <View key={badge} style={styles.group}>
            <View style={styles.head}>
              <StatusChip badge={badge} />
              <Text style={[styles.groupTitle, { color: colors.text }]}>{TITLES[badge]}</Text>
            </View>
            {items.map((mod) => (
              <View key={mod.id} style={styles.row}>
                <Text style={[styles.mod, { color: colors.text }]}>{mod.title}</Text>
                <Text style={{ color: colors.textMuted }}>{mod.percent}%</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, marginBottom: spacing.md },
  heading: { ...typography.heading, fontSize: 20 },
  group: { gap: 6 },
  head: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  groupTitle: { fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  mod: { ...typography.caption, flex: 1, marginRight: spacing.sm },
});
