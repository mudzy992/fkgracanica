import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { pickDefaultParticipation } from '../../lib/club-participation';
import { LeagueSeasonChips } from '../league/LeagueSeasonChips';
import {
  loadClubParticipations,
  loadClubSeasonStats,
  type TeamSeasonStatsData,
} from './load-team-stats';
import { TeamSeasonSummary } from './TeamSeasonSummary';

type Props = { clubId: string };

const emptyStats: TeamSeasonStatsData = { players: [] };

export function TeamSeasonStatsBlock({ clubId }: Props) {
  const { t } = useTranslation();
  const [editionId, setEditionId] = useState('');
  const [competitions, setCompetitions] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<TeamSeasonStatsData>(emptyStats);

  const load = useCallback(
    async (id: string) => {
      if (!clubId) return;
      try {
        setStats(await loadClubSeasonStats(clubId, id || undefined));
      } catch {
        setStats(emptyStats);
      }
    },
    [clubId],
  );

  useEffect(() => {
    if (!clubId) return;
    void (async () => {
      try {
        const rows = await loadClubParticipations(clubId);
        const next = rows.map((p) => ({
          id: p.seasonId,
          name: p.isLeague ? `${p.competitionName} · ${t('teamLeagueChip')}` : p.competitionName,
        }));
        setCompetitions(next);
        const def = pickDefaultParticipation(rows)?.seasonId ?? next[0]?.id ?? '';
        setEditionId((prev) => (prev && next.some((c) => c.id === prev) ? prev : def));
      } catch {
        setCompetitions([]);
      }
    })();
  }, [clubId, t]);

  useEffect(() => {
    void load(editionId);
  }, [load, editionId]);

  return (
    <View>
      <LeagueSeasonChips seasons={competitions} seasonId={editionId} onChange={setEditionId} />
      <TeamSeasonSummary
        seasonName={stats.seasonName}
        standing={stats.standing}
        totals={stats.totals}
        players={stats.players}
      />
    </View>
  );
}
