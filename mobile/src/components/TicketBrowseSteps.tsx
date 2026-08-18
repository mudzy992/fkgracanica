import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography } from '../lib/theme';
import { useTheme } from '../lib/theme-context';

type Step = 1 | 2 | 3;

type Props = { active: Step };

export function TicketBrowseSteps({ active }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const steps = [
    { n: 1 as const, label: t('ticketStepBrowse') },
    { n: 2 as const, label: t('ticketStepReserve') },
    { n: 3 as const, label: t('ticketStepTicket') },
  ];

  return (
    <View style={styles.row}>
      {steps.map((step) => {
        const isActive = step.n === active;
        const isDone = step.n < active;
        const tone = isActive || isDone ? colors.primaryLight : colors.textMuted;
        return (
          <View key={step.n} style={styles.item}>
            <View style={[styles.dot, { borderColor: tone, backgroundColor: isActive ? tone : 'transparent' }]}>
              <Text style={[styles.num, { color: isActive ? colors.background : tone }]}>{step.n}</Text>
            </View>
            <Text style={[styles.label, { color: tone }]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  item: { flex: 1, alignItems: 'center', gap: spacing.xs },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontSize: 11, fontWeight: '800' },
  label: { ...typography.caption, fontWeight: '700', textAlign: 'center' },
});
