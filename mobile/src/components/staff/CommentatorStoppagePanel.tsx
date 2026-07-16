import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { type LiveActionRunner, postLive } from './commentator-api';
import { commentatorStyles as styles } from './commentator-styles';

const HALVES: { value: 1 | 2 | 3 | 4; labelKey: string }[] = [
  { value: 1, labelKey: 'commentatorHalf1' },
  { value: 2, labelKey: 'commentatorHalf2' },
  { value: 3, labelKey: 'commentatorHalfEt1' },
  { value: 4, labelKey: 'commentatorHalfEt2' },
];

type Props = {
  matchId: string;
  run: LiveActionRunner;
};

export function CommentatorStoppagePanel({ matchId, run }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [half, setHalf] = useState<1 | 2 | 3 | 4>(1);
  const [minutes, setMinutes] = useState('3');

  const submit = () => {
    const mins = Number(minutes);
    if (!Number.isInteger(mins) || mins < 1 || mins > 15) return;
    void run(() => postLive(matchId, 'stoppage', { half, minutes: mins }));
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorStoppage')}</Text>
      <View style={styles.row}>
        {HALVES.map((item) => {
          const selected = half === item.value;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                { borderColor: colors.border },
                selected && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setHalf(item.value)}
            >
              <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
        keyboardType="number-pad"
        value={minutes}
        onChangeText={setMinutes}
        placeholder={t('commentatorStoppageMins')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('commentatorStoppageMins')}
      />
      <Pressable
        accessibilityRole="button"
        style={[styles.submit, { backgroundColor: colors.primary }]}
        onPress={submit}
      >
        <Text style={[styles.submitText, { color: colors.white }]}>{t('commentatorSetStoppage')}</Text>
      </Pressable>
    </View>
  );
}
