import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { commentatorStyles as styles } from './commentator-styles';

export type MatchOption = { id: string; title: string; status?: string; reportStatus?: string };

type Props = {
  matches: MatchOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CommentatorMatchSelector({ matches, selectedId, onSelect }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{t('commentatorSelectMatch')}</Text>
      {matches.length === 0 ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('noMatches')}</Text>
      ) : (
        <View style={styles.row}>
          {matches.map((match) => {
            const selected = selectedId === match.id;
            return (
              <Pressable
                key={match.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => onSelect(match.id)}
              >
                <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>
                  {match.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
