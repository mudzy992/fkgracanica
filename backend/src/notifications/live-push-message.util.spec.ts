import { MatchEventType } from '@prisma/client';
import { buildLivePushMessage } from './live-push-message.util';

describe('buildLivePushMessage', () => {
  const match = {
    id: 'm1',
    homeScore: 2,
    awayScore: 1,
    homeClub: { id: 'h', name: 'FK Gračanica' },
    awayClub: { id: 'a', name: 'Rival' },
  };

  it('builds goal with assist', () => {
    const msg = buildLivePushMessage(match, {
      type: MatchEventType.GOAL,
      minute: 67,
      teamSide: 'home',
      player: { firstName: 'Amir', lastName: 'Hodžić' },
      relatedPlayer: { firstName: 'Emir', lastName: 'Begić' },
    });
    expect(msg?.title).toBe('⚽ GOL! FK Gračanica 2:1 Rival');
    expect(msg?.body).toContain('Amir Hodžić (FK Gračanica)');
    expect(msg?.body).toContain('ass: Emir Begić');
  });

  it('skips corner and foul', () => {
    expect(
      buildLivePushMessage(match, { type: MatchEventType.CORNER, minute: 10 }),
    ).toBeNull();
    expect(
      buildLivePushMessage(match, { type: MatchEventType.FOUL, minute: 10 }),
    ).toBeNull();
  });

  it('builds kickoff', () => {
    const msg = buildLivePushMessage(match, {
      type: MatchEventType.KICKOFF,
      minute: 0,
    });
    expect(msg?.title).toContain('Utakmica počela');
    expect(msg?.body).toBe('FK Gračanica vs Rival');
  });
});
