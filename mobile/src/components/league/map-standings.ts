import { asArray, asRecord, asString } from '../../lib/content-helpers';
import type { HomeLeagueRow } from '../home/load-home-extras';

export function mapStandingsRows(
  rows: unknown[],
  opts: { ownId: string; highlightId?: string },
): HomeLeagueRow[] {
  return asArray(rows).map((row, index) => {
    const item = asRecord(row);
    const id = asString(item.clubId, String(index));
    const isOwn = Boolean(opts.ownId && id === opts.ownId);
    return {
      id,
      clubName: asString(item.clubName, `Tim ${index + 1}`),
      slug: asString(item.clubSlug) || undefined,
      points: Number(item.points ?? 0),
      position: index + 1,
      crestPath: asString(item.crestPath) || undefined,
      played: Number(item.played ?? 0),
      goalDifference: Number(item.goalDifference ?? 0),
      form: asString(item.form),
      isOwn,
      isHighlight: opts.highlightId ? id === opts.highlightId : isOwn,
    };
  });
}
