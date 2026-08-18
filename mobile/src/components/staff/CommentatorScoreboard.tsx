import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLiveMatch } from '../../hooks/use-live-match';
import { matchStatusKey } from '../../lib/match-status';
import { useTheme } from '../../lib/theme-context';
import { commentatorStyles as styles } from './commentator-styles';

type Props = { matchId: string };

export function CommentatorScoreboard({ matchId }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { match } = useLiveMatch(matchId);
  if (!match) return null;
  const home = match.homeClub?.name ?? t('commentatorHome');
  const away = match.awayClub?.name ?? t('commentatorAway');
  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {home} {match.homeScore}:{match.awayScore} {away}
      </Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {t(matchStatusKey(match.status))}
        {match.minute != null ? ` · ${match.minute}'` : ''}
      </Text>
    </View>
  );
}
