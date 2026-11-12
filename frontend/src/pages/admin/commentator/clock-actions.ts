import { canExtraHalftime, canHalftime, isTied } from '../../../lib/match-live-phase';
import type { Match } from '../../../types';

export type ClockActionStyle = 'primary' | 'outline' | 'end';

/**
 * P-FE06-42: ključ je unija, ne `string` — ako `buildClockActions` emitira
 * ključ za koji `CommentatorClockActions` nema rukovaoca, padne `tsc`, a ne
 * tiho ništa u produkciji.
 */
export type ClockActionKey =
  | 'start' | 'ht' | 'end' | 'resume2' | 'ft' | 'et'
  | 'eth' | 'et2' | 'etend' | 'pen' | 'penend';

export type ClockActionSpec = {
  key: ClockActionKey;
  label: string;
  style: ClockActionStyle;
  confirm?: boolean;
};

type ClockMatch = Pick<Match, 'status' | 'liveBreak' | 'matchPeriod' | 'homeScore' | 'awayScore'>;

export function buildClockActions(match: ClockMatch): ClockActionSpec[] {
  const liveBreak = match.liveBreak ?? 'NONE';
  const period = match.matchPeriod;
  const actions: ClockActionSpec[] = [];
  if (match.status === 'SCHEDULED') {
    actions.push({ key: 'start', label: 'Započni', style: 'primary' });
  }
  if (canHalftime(match)) {
    actions.push({ key: 'ht', label: 'Poluvrijeme', style: 'outline' });
    actions.push({ key: 'end', label: 'Završi', style: 'end', confirm: true });
  }
  if (match.status === 'HALFTIME' && liveBreak === 'REGULAR_HT') {
    actions.push({ key: 'resume2', label: '2. poluvrijeme', style: 'primary' });
  }
  if (match.status === 'LIVE' && period === 'SECOND_HALF') {
    if (isTied(match)) {
      actions.push({ key: 'ft', label: 'Kraj regularnog', style: 'outline' });
    } else {
      actions.push({ key: 'end', label: 'Završi', style: 'end', confirm: true });
    }
  }
  if (match.status === 'HALFTIME' && liveBreak === 'POST_REGULATION' && isTied(match)) {
    actions.push({ key: 'et', label: 'Produžeci', style: 'primary' });
  }
  if (match.status === 'LIVE' && period === 'EXTRA_FIRST' && canExtraHalftime(match)) {
    actions.push({ key: 'eth', label: 'Pauza ET', style: 'outline' });
  }
  if (match.status === 'HALFTIME' && liveBreak === 'ET_HT') {
    actions.push({ key: 'et2', label: '2. produžetak', style: 'primary' });
  }
  if (match.status === 'LIVE' && period === 'EXTRA_SECOND') {
    if (isTied(match)) {
      actions.push({ key: 'etend', label: 'Kraj produžetaka', style: 'outline' });
    } else {
      actions.push({ key: 'end', label: 'Završi', style: 'end', confirm: true });
    }
  }
  if (match.status === 'HALFTIME' && liveBreak === 'POST_EXTRA' && isTied(match)) {
    actions.push({ key: 'pen', label: 'Penali', style: 'primary' });
  }
  if (match.status === 'LIVE' && period === 'PENALTIES') {
    actions.push({ key: 'penend', label: 'Završi penale', style: 'end', confirm: true });
  }
  return actions;
}

export function clockBreakHint(match: ClockMatch): string | null {
  const liveBreak = match.liveBreak ?? 'NONE';
  if (match.status !== 'HALFTIME' || liveBreak === 'NONE' || liveBreak === 'REGULAR_HT') return null;
  if (liveBreak === 'POST_REGULATION' || liveBreak === 'POST_EXTRA') return 'Neriješeno';
  return 'Pauza';
}
