import { MatchEventType } from '@prisma/client';

type Club = { id: string; name: string };
type Player = { firstName: string; lastName: string } | null;

export type LivePushMatch = {
  id: string;
  homeScore: number;
  awayScore: number;
  homeClub: Club;
  awayClub: Club;
};

export type LivePushEvent = {
  type: MatchEventType;
  minute: number;
  teamSide?: string | null;
  description?: string | null;
  player?: Player;
  relatedPlayer?: Player;
};

const SKIP = new Set<MatchEventType>([
  MatchEventType.SECOND_HALF,
  MatchEventType.CORNER,
  MatchEventType.FOUL,
  MatchEventType.OFFSIDE,
  MatchEventType.SHOT,
  MatchEventType.SHOT_ON_TARGET,
  MatchEventType.FREE_KICK,
  MatchEventType.SAVE,
  MatchEventType.COMMENT,
]);

function playerName(p: Player | undefined) {
  if (!p) return null;
  return `${p.firstName} ${p.lastName}`.trim();
}

function scoreLine(m: LivePushMatch) {
  return `${m.homeClub.name} ${m.homeScore}:${m.awayScore} ${m.awayClub.name}`;
}

function teamLabel(m: LivePushMatch, side?: string | null) {
  if (side === 'away') return m.awayClub.name;
  if (side === 'home') return m.homeClub.name;
  return null;
}

export function buildLivePushMessage(
  match: LivePushMatch,
  event: LivePushEvent,
): { title: string; body: string } | null {
  if (SKIP.has(event.type)) return null;

  const name = playerName(event.player);
  const related = playerName(event.relatedPlayer);
  const min = `${event.minute}'`;
  const score = scoreLine(match);
  const team = teamLabel(match, event.teamSide);

  switch (event.type) {
    case MatchEventType.GOAL: {
      const who = [name, team ? `(${team})` : null].filter(Boolean).join(' ');
      const ass = related ? ` (ass: ${related})` : '';
      return {
        title: `⚽ GOL! ${score}`,
        body: `${who || 'Gol'} — ${min}${ass}`,
      };
    }
    case MatchEventType.OWN_GOAL:
      return {
        title: `⚽ Autogol! ${score}`,
        body: `${name ? `${name} (autogol)` : 'Autogol'} — ${min}`,
      };
    case MatchEventType.YELLOW_CARD:
      return { title: '🟨 Žuti karton', body: `${name ?? 'Igrač'} — ${min}` };
    case MatchEventType.RED_CARD:
      return {
        title: '🟥 Crveni karton!',
        body: `${name ?? 'Igrač'} isključen — ${min}`,
      };
    case MatchEventType.SECOND_YELLOW:
      return {
        title: '🟨🟥 Drugi žuti!',
        body: `${name ?? 'Igrač'} isključen — ${min}`,
      };
    case MatchEventType.PENALTY_SCORED:
      return {
        title: `⚽ Penal! ${score}`,
        body: `${name ?? 'Penal'} — ${min}`,
      };
    case MatchEventType.PENALTY_MISSED:
      return {
        title: '❌ Promašen penal',
        body: `${name ?? 'Igrač'} nije uspio — ${min}`,
      };
    case MatchEventType.SUBSTITUTION:
      return {
        title: '🔄 Izmjena',
        body: `Ulazi ${name ?? '?'}, izlazi ${related ?? '?'} — ${min}`,
      };
    case MatchEventType.KICKOFF:
      return {
        title: '🎬 Utakmica počela!',
        body: `${match.homeClub.name} vs ${match.awayClub.name}`,
      };
    case MatchEventType.HALFTIME:
      return { title: '⏸ Poluvrijeme', body: score };
    case MatchEventType.FULL_TIME:
      return { title: '🏁 Kraj utakmice!', body: `${score} — Rezultat` };
    case MatchEventType.INJURY:
      return { title: '🚑 Povreda', body: `${name ?? 'Igrač'} — ${min}` };
    case MatchEventType.VAR:
      return {
        title: '📺 VAR',
        body: event.description?.trim() || `Pregled — ${min}`,
      };
    case MatchEventType.EXTRA_TIME:
      return { title: '⏱ Produžeci', body: score };
    default:
      return null;
  }
}
