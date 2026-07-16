import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { type LiveActionRunner, postReportEvent, postReportSubmit } from './commentator-api';
import { EVENT_I18N, QUICK_EVENTS, type LiveEventType } from './commentator-events';
import { commentatorStyles as styles } from './commentator-styles';

type Props = {
  matchId: string;
  run: LiveActionRunner;
};

export function CommentatorReportPanel({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');
  const [minute, setMinute] = useState('0');
  const [type, setType] = useState<LiveEventType>('GOAL');

  const addEvent = () => {
    const min = Number(minute);
    if (!Number.isInteger(min) || min < 0 || min > 130) return;
    void run(async () => {
      await postReportEvent(matchId, { type, minute: min, teamSide });
      Alert.alert(t('commentatorTitle'), t('commentatorReportEventAdded'));
    });
  };

  const submit = () => {
    void run(async () => {
      await postReportSubmit(matchId);
      Alert.alert(t('commentatorTitle'), t('commentatorReportSubmitted'));
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorReport')}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('commentatorReportHint')}</Text>
      <View style={styles.row}>
        {(['home', 'away'] as const).map((side) => {
          const selected = teamSide === side;
          return (
            <Pressable
              key={side}
              style={[
                styles.chip,
                { borderColor: colors.border },
                selected && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setTeamSide(side)}
            >
              <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>
                {side === 'home' ? t('commentatorHome') : t('commentatorAway')}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
        keyboardType="number-pad"
        value={minute}
        onChangeText={setMinute}
        placeholder={t('minute')}
        placeholderTextColor={colors.textMuted}
      />
      <View style={styles.row}>
        {QUICK_EVENTS.map((eventType) => {
          const selected = type === eventType;
          return (
            <Pressable
              key={eventType}
              style={[
                styles.actionBtn,
                { backgroundColor: selected ? colors.primary : colors.surface },
              ]}
              onPress={() => setType(eventType)}
            >
              <Text style={[styles.actionText, { color: selected ? colors.white : colors.text }]}>
                {t(EVENT_I18N[eventType])}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={[styles.submit, { backgroundColor: colors.surface }]} onPress={addEvent}>
        <Text style={[styles.submitText, { color: colors.text }]}>{t('commentatorReportAddEvent')}</Text>
      </Pressable>
      <Pressable style={[styles.submit, { backgroundColor: colors.primary }]} onPress={submit}>
        <Text style={[styles.submitText, { color: colors.white }]}>{t('commentatorReportSubmit')}</Text>
      </Pressable>
    </View>
  );
}
