import { useTranslation } from 'react-i18next';
import { MatchScoreRow } from './MatchScoreRow';
import { matchMetaLine } from '../../lib/match-status';
import type { Match } from '../../types/api';

type Props = {
  match: Match;
  onPress: (id: string) => void;
  locale: string;
  featured?: boolean;
};

export function LiveMatchRow({ match, onPress, locale, featured }: Props) {
  const { t } = useTranslation();
  const metaLine = matchMetaLine(match, (n) => t('matchRound', { n }));
  return (
    <MatchScoreRow
      homeName={match.homeClub.name}
      awayName={match.awayClub.name}
      homeCrestPath={match.homeClub.crestPath ?? undefined}
      awayCrestPath={match.awayClub.crestPath ?? undefined}
      status={match.status}
      homeScore={match.homeScore}
      awayScore={match.awayScore}
      minute={match.minute}
      scheduledAt={match.scheduledAt}
      locale={locale}
      featured={featured}
      metaLine={metaLine || undefined}
      onPress={() => onPress(match.id)}
    />
  );
}
