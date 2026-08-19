import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Match } from '../../../types';
import {
  awaitingApproval,
  deskHref,
  groupDeskMatches,
  needsReport,
  pickCommentatorDeskMatches,
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
    assert.equal(deskHref({ id: '1', status: 'LIVE' }), '/admin/live/1');
    assert.equal(deskHref({ id: '2', status: 'SCHEDULED' }), '/admin/live/2');
    assert.equal(deskHref({ id: '3', status: 'FINISHED' }), '/admin/matches/3/report');
  });

  it('treats missing reportStatus as draft that still needs submit', () => {
    const draft = fixture({ id: 'd', status: 'FINISHED' });
    const pending = fixture({ id: 'p', status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' });
    assert.equal(needsReport(draft), true);
    assert.equal(needsReport(pending), false);
    assert.equal(awaitingApproval(pending), true);
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
    const draft = fixture({ id: 'draft', status: 'FINISHED', reportStatus: 'DRAFT' });
    const pending = fixture({ id: 'pend', status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' });
    const groups = groupDeskMatches([live, today, upcoming, draft, pending], now);
    assert.deepEqual(
      groups.map((g) => [g.key, g.matches.map((m) => m.id)]),
      [
        ['live', ['live']],
        ['today', ['today']],
        ['upcoming', ['up']],
        ['reports', ['draft', 'pend']],
      ],
    );
  });

  it('picks drafts onto the desk list and prefers live as primary', () => {
    const live = fixture({ id: 'live', status: 'HALFTIME' });
    const draft = fixture({ id: 'draft', status: 'FINISHED', reportStatus: 'DRAFT' });
    const picked = pickCommentatorDeskMatches([draft, live], now);
    assert.deepEqual(
      picked.map((m) => m.id),
      ['live', 'draft'],
    );
    assert.equal(primaryDeskMatch([draft, live], now)?.id, 'live');
  });
});
