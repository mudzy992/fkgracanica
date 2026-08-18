import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type { LeagueLeaderItem, LeagueRoundOption } from './load-league-screen';

export function mapLeaders(rows: unknown[]): LeagueLeaderItem[] {
  return asArray(rows)
    .slice(0, 8)
    .map((row) => {
      const item = asRecord(row);
      return {
        playerId: asString(item.playerId),
        name: `${asString(item.firstName)} ${asString(item.lastName)}`.trim(),
        value: Number(item.value ?? 0),
      };
    })
    .filter((r) => r.playerId);
}

export function mapRounds(rows: unknown[]): LeagueRoundOption[] {
  return asArray(rows)
    .map((row) => {
      const item = asRecord(row);
      const number = Number(item.number ?? 0);
      return {
        id: asString(item.id),
        number,
        name: asString(item.name) || String(number),
      };
    })
    .filter((r) => r.id && r.number > 0)
    .sort((a, b) => a.number - b.number);
}

export function roundsPlayed(matches: unknown[]): number {
  let max = 0;
  for (const match of asArray(matches)) {
    const item = asRecord(match);
    if (asString(item.status) !== 'FINISHED') continue;
    const roundRel = asRecord(item.roundRel);
    const n = Number(roundRel.number ?? item.round ?? 0);
    if (n > max) max = n;
  }
  return max;
}
