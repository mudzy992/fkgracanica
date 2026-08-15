import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../lib/theme';
import { useTheme } from '../lib/theme-context';
import type { ShowcaseSection } from './types';

const CARDS = [
  { title: 'Javni web', caption: 'Portal, live, članstvo' },
  { title: 'Admin', caption: 'CMS, kadar, blagajna' },
  { title: 'Mobile', caption: 'Navijač i osoblje' },
];

export function SurfaceTrio({ section }: { section: ShowcaseSection }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{section.body}</Text>
      <View style={styles.row}>
        {CARDS.map((card) => (
          <View key={card.title} style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.bar, { backgroundColor: colors.primary }]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
            <Text style={[styles.caption, { color: colors.textMuted }]}>{card.caption}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.heading, fontSize: 22 },
  body: { ...typography.body },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { borderRadius: 16, borderWidth: 1, flexGrow: 1, minWidth: 96, padding: spacing.md },
  bar: { borderRadius: 2, height: 3, marginBottom: 8, width: 28 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  caption: { ...typography.caption, marginTop: 4 },
});
