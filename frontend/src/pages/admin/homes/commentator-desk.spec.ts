import { describe, expect, it } from 'vitest';
import type { Match } from '../../../types';
import {
  awaitingApproval,
  deskHref,
  deskCounts,
  groupDeskMatches,
  needsReport,
  pickCommentatorDeskMatches,
  pickToday,
  pickUpcoming,
  primaryDeskMatch,
} from './commentator-desk';

function fixture(partial: Partial<Match> & Pick<Match, 'id' | 'status'>): Match {
  return {
    seasonId: 's1',
    homeClubId: 'h',
    awayClubId: 'a',
    homeScore: 0,
    awayScore: 0,
    scheduledAt: new Date(2026, 7, 18, 20, 0, 0).toISOString(),
    minute: 0,
    ...partial,
  };
}

const now = new Date(2026, 7, 18, 18, 0, 0).getTime();

describe('commentator-desk', () => {
  it('routes live and scheduled to desk, finished to report', () => {
    expect(deskHref({ id: '1', status: 'LIVE' })).toBe('/admin/live/1');
    expect(deskHref({ id: '2', status: 'SCHEDULED' })).toBe('/admin/live/2');
    expect(deskHref({ id: '3', status: 'FINISHED' })).toBe('/admin/matches/3/report');
  });

  it('treats missing reportStatus as draft that still needs submit', () => {
    const draft = fixture({ id: 'd', status: 'FINISHED' });
    const pending = fixture({
      id: 'p',
      status: 'FINISHED',
      reportStatus: 'PENDING_APPROVAL',
    });
    expect(needsReport(draft)).toBe(true);
    expect(needsReport(pending)).toBe(false);
    expect(awaitingApproval(pending)).toBe(true);
  });

  it('groups live, today, upcoming, and both report states', () => {
    const live = fixture({ id: 'live', status: 'LIVE' });
    const today = fixture({
      id: 'today',
      status: 'SCHEDULED',
      scheduledAt: new Date(2026, 7, 18, 20, 0, 0).toISOString(),
    });
    const upcoming = fixture({
      id: 'up',
      status: 'SCHEDULED',
      scheduledAt: new Date(2026, 7, 19, 18, 0, 0).toISOString(),
    });
    const draft = fixture({
      id: 'draft',
      status: 'FINISHED',
      reportStatus: 'DRAFT',
    });
    const pending = fixture({
      id: 'pend',
      status: 'FINISHED',
      reportStatus: 'PENDING_APPROVAL',
    });
    const groups = groupDeskMatches([live, today, upcoming, draft, pending], now);
    expect(groups.map((g) => [g.key, g.matches.map((m) => m.id)])).toEqual([
      ['live', ['live']],
      ['today', ['today']],
      ['upcoming', ['up']],
      ['reports', ['draft', 'pend']],
    ]);
  });

  it('picks drafts onto the desk list and prefers live as primary', () => {
    const live = fixture({ id: 'live', status: 'HALFTIME' });
    const draft = fixture({
      id: 'draft',
      status: 'FINISHED',
      reportStatus: 'DRAFT',
    });
    const picked = pickCommentatorDeskMatches([draft, live], now);
    expect(picked.map((m) => m.id)).toEqual(['live', 'draft']);
    expect(primaryDeskMatch([draft, live], now)?.id).toBe('live');
  });

  it('spaja faze bez duplikata i sortira dan i predstojeće po vremenu', () => {
    const later = fixture({ id: 'b', status: 'SCHEDULED', scheduledAt: new Date(2026, 7, 18, 21, 0).toISOString() });
    const earlier = fixture({ id: 'a', status: 'SCHEDULED', scheduledAt: new Date(2026, 7, 18, 19, 0).toISOString() });
    expect(pickToday([later, earlier], now).map((m) => m.id)).toEqual(['a', 'b']);

    const soon = fixture({ id: 'soon', status: 'SCHEDULED', scheduledAt: new Date(2026, 7, 19, 18, 0).toISOString() });
    const laterUpcoming = fixture({ id: 'late', status: 'SCHEDULED', scheduledAt: new Date(2026, 7, 20, 18, 0).toISOString() });
    expect(pickUpcoming([laterUpcoming, soon], now).map((m) => m.id)).toEqual(['soon', 'late']);

    const merged = pickCommentatorDeskMatches([earlier, earlier, soon], now);
    expect(merged.map((m) => m.id)).toEqual(['a', 'soon']);
  });

  it('broji live, danas, nacrte i utakmice na odobrenju', () => {
    const counts = deskCounts([
      fixture({ id: 'l', status: 'LIVE' }),
      fixture({ id: 't', status: 'SCHEDULED' }),
      fixture({ id: 'd', status: 'FINISHED' }),
      fixture({ id: 'p', status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }),
    ], now);
    expect(counts).toEqual({ live: 1, today: 1, drafts: 1, pending: 1 });
  });
});
