import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { type LiveActionRunner, postLive } from './commentator-api';
import { commentatorStyles as styles } from './commentator-styles';

type ClockAction = { path: string; labelKey: string };

const REGULAR: ClockAction[] = [
  { path: 'start', labelKey: 'commentatorStart' },
  { path: 'halftime', labelKey: 'commentatorHalftime' },
  { path: 'resume', labelKey: 'commentatorResume' },
  { path: 'end', labelKey: 'commentatorEnd' },
];

const EXTRA: ClockAction[] = [
  { path: 'regular-time/end', labelKey: 'commentatorRegularEnd' },
  { path: 'extra-time/start', labelKey: 'commentatorEtStart' },
  { path: 'extra-time/halftime', labelKey: 'commentatorEtHalftime' },
  { path: 'extra-time/resume', labelKey: 'commentatorEtResume' },
  { path: 'extra-time/end', labelKey: 'commentatorEtEnd' },
];

const PENALTIES: ClockAction[] = [
  { path: 'penalties/start', labelKey: 'commentatorPenStart' },
  { path: 'penalties/end', labelKey: 'commentatorPenEnd' },
];

type Props = {
  matchId: string;
  run: LiveActionRunner;
};

export function CommentatorClockPanel({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const renderGroup = (titleKey: string, actions: ClockAction[]) => (
    <View style={{ gap: 8 }}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t(titleKey)}</Text>
      <View style={styles.row}>
        {actions.map((action) => (
          <Pressable
            key={action.path}
            accessibilityRole="button"
            accessibilityLabel={t(action.labelKey)}
            style={[styles.actionBtn, { backgroundColor: colors.surface }]}
            onPress={() => void run(() => postLive(matchId, action.path))}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>{t(action.labelKey)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorClock')}</Text>
      {renderGroup('commentatorClockRegular', REGULAR)}
      {renderGroup('commentatorClockExtra', EXTRA)}
      {renderGroup('commentatorClockPenalties', PENALTIES)}
    </View>
  );
}
