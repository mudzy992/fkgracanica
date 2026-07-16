import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { type AddEventBody, type LiveActionRunner, postLiveEvent } from './commentator-api';
import { EVENT_I18N, MORE_EVENTS, QUICK_EVENTS, type LiveEventType } from './commentator-events';
import { commentatorStyles as styles } from './commentator-styles';

type Props = {
  matchId: string;
  run: LiveActionRunner;
};

export function CommentatorEventsPanel({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [teamSide, setTeamSide] = useState<'home' | 'away'>('home');
  const [minute, setMinute] = useState('');
  const [description, setDescription] = useState('');
  const [showMore, setShowMore] = useState(false);

  const fire = (type: LiveEventType) => {
    const body: AddEventBody = { type, teamSide };
    const min = Number(minute);
    if (Number.isInteger(min) && min >= 0 && min <= 130) body.minute = min;
    if (description.trim()) body.description = description.trim();
    void run(async () => {
      await postLiveEvent(matchId, body);
      setDescription('');
    });
  };

  const renderEvents = (types: readonly LiveEventType[]) => (
    <View style={styles.row}>
      {types.map((type) => (
        <Pressable
          key={type}
          accessibilityRole="button"
          accessibilityLabel={t(EVENT_I18N[type])}
          style={[styles.actionBtn, { backgroundColor: colors.surface }]}
          onPress={() => fire(type)}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>{t(EVENT_I18N[type])}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorEvents')}</Text>
      <View style={styles.row}>
        {(['home', 'away'] as const).map((side) => {
          const selected = teamSide === side;
          return (
            <Pressable
              key={side}
              accessibilityRole="button"
              accessibilityState={{ selected }}
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
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
        value={description}
        onChangeText={setDescription}
        placeholder={t('commentatorEventNote')}
        placeholderTextColor={colors.textMuted}
      />
      {renderEvents(QUICK_EVENTS)}
      <Pressable onPress={() => setShowMore((v) => !v)}>
        <Text style={[styles.hint, { color: colors.primary }]}>
          {showMore ? t('commentatorLessEvents') : t('commentatorMoreEvents')}
        </Text>
      </Pressable>
      {showMore ? renderEvents(MORE_EVENTS) : null}
    </View>
  );
}
