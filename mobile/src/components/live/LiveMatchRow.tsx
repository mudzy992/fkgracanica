import { useTranslation } from 'react-i18next';
import { useLiveClock } from '../../hooks/use-live-clock';
import { formatLiveMinute } from '../../lib/live-clock';
import { matchMetaLine } from '../../lib/match-status';
import type { Match } from '../../types/api';
import { MatchScoreRow } from './MatchScoreRow';

type Props = {
  match: Match;
  onPress: (id: string) => void;
  locale: string;
  featured?: boolean;
};

export function LiveMatchRow({ match, onPress, locale, featured }: Props) {
  const { t } = useTranslation();
  const clock = useLiveClock(match);
  const metaLine = matchMetaLine(match, (n) => t('matchRound', { n }));
  const minute = match.status === 'HALFTIME' ? undefined : formatLiveMinute(clock, match.minute);
  return (
    <MatchScoreRow
      homeName={match.homeClub.name}
      awayName={match.awayClub.name}
      homeCrestPath={match.homeClub.crestPath ?? undefined}
      awayCrestPath={match.awayClub.crestPath ?? undefined}
      status={match.status}
      homeScore={match.homeScore}
      awayScore={match.awayScore}
      minute={minute}
      scheduledAt={match.scheduledAt}
      locale={locale}
      featured={featured}
      metaLine={metaLine || undefined}
      hasStream={Boolean(match.liveStreamUrl || match.youtubeUrl)}
      onPress={() => onPress(match.id)}
    />
  );
}
