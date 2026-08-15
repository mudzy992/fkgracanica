import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import { StatusChip } from './StatusChip';
import type { ShowcaseModule, ShowcaseSection } from './types';

type Props = { section: ShowcaseSection; modules: ShowcaseModule[] };

export function CatalogBlock({ section, modules }: Props) {
  const { colors } = useTheme();
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{section.body}</Text>
      {section.bullets?.map((item) => (
        <Text key={item} style={[styles.bullet, { color: colors.text }]}>
          • {item}
        </Text>
      ))}
      {related.map((mod) => (
        <View key={mod.id} style={styles.row}>
          <Text style={[styles.mod, { color: colors.text }]}>{mod.title}</Text>
          <StatusChip badge={mod.badge} percent={mod.percent} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, gap: spacing.sm, marginBottom: spacing.md, padding: spacing.md },
  title: { ...typography.heading, fontSize: 20 },
  body: { ...typography.body },
  bullet: { ...typography.caption, lineHeight: 20 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  mod: { ...typography.caption, flex: 1, fontWeight: '600' },
});
