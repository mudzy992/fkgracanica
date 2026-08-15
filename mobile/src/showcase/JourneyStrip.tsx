import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../lib/theme';
import { useTheme } from '../lib/theme-context';
import { StatusChip } from './StatusChip';
import type { ShowcaseModule, ShowcaseSection } from './types';

const STEPS = [
  { n: '01', title: 'Sadržaj' },
  { n: '02', title: 'Članstvo' },
  { n: '03', title: 'Ulaznica' },
  { n: '04', title: 'Ulaz QR' },
];

type Props = { section: ShowcaseSection; modules: ShowcaseModule[] };

export function JourneyStrip({ section, modules }: Props) {
  const { colors } = useTheme();
  const related = (section.moduleIds ?? [])
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is ShowcaseModule => !!m);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]}>{section.title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{section.body}</Text>
      <View style={styles.steps}>
        {STEPS.map((step) => (
          <View key={step.n} style={[styles.step, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.n, { color: colors.primaryLight }]}>{step.n}</Text>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
          </View>
        ))}
      </View>
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
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  step: { borderRadius: 14, borderWidth: 1, flexGrow: 1, minWidth: 72, padding: spacing.sm },
  n: { fontSize: 16, fontWeight: '800' },
  stepTitle: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  mod: { ...typography.caption, flex: 1, fontWeight: '600' },
});
