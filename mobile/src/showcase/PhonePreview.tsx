import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../lib/theme';
import { useTheme } from '../lib/theme-context';
import { StatusChip } from './StatusChip';
import type { ShowcaseModule, ShowcaseSection } from './types';

type Props = { section: ShowcaseSection; modules: ShowcaseModule[] };

export function PhonePreview({ section, modules }: Props) {
  const { colors } = useTheme();
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{section.body}</Text>
      <View style={styles.phoneWrap}>
        <View style={[styles.bezel, { borderColor: '#1e293b', backgroundColor: '#020617' }]}>
          <View style={styles.notch} />
          <View style={styles.screen}>
            <View style={styles.hero} />
            <View style={[styles.score, { backgroundColor: colors.background }]}>
              <Text style={[styles.scoreText, { color: colors.text }]}>2 — 1</Text>
              <Text style={[styles.live, { color: colors.success }]}>LIVE</Text>
            </View>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <View style={[styles.lineShort, { backgroundColor: colors.border }]} />
          </View>
        </View>
      </View>
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
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.heading, fontSize: 22 },
  body: { ...typography.body },
  phoneWrap: { alignItems: 'center', marginVertical: spacing.md },
  bezel: { borderRadius: 28, borderWidth: 5, overflow: 'hidden', paddingTop: 10, width: 168 },
  notch: { alignSelf: 'center', backgroundColor: '#0f172a', borderRadius: 8, height: 8, marginBottom: 8, width: 56 },
  screen: { gap: 8, minHeight: 220, padding: 10 },
  hero: { backgroundColor: '#1d4ed8', borderRadius: 10, height: 56 },
  score: { alignItems: 'center', borderRadius: 10, padding: 8 },
  scoreText: { fontSize: 18, fontWeight: '800' },
  live: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  line: { borderRadius: 4, height: 8, width: '100%' },
  lineShort: { borderRadius: 4, height: 8, width: '60%' },
  bullet: { ...typography.caption, lineHeight: 20 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  mod: { ...typography.caption, flex: 1, fontWeight: '600' },
});
