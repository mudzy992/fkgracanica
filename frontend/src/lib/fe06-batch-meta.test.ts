import { describe, expect, it } from 'vitest';
import {
  calendarKey,
  participationsInCalendar,
  participationLabel,
  pickDefaultParticipation,
  uniqueCalendarSeasons,
  type ClubParticipation,
} from './club-participation.util';
import { ticketCompetitionName, ticketMetaLine, ticketRoundLabel, ticketSeasonName } from './ticket-match-meta';
import { userInitials } from './user-initials';
import { absoluteUrl, buildDocumentTitle, defaultShareImage, stripHtml, truncateMeta } from './seo-meta';

describe('club-participation util', () => {
  const participation = (overrides: Partial<ClubParticipation>): ClubParticipation => ({
    seasonId: 's1', seasonName: '2025/26', yearStart: 2025, yearEnd: 2026,
    isActive: true, competitionId: 'c1', competitionName: 'Liga', isLeague: true,
    ...overrides,
  });

  it('labela spaja takmičenje i sezonu', () => {
    expect(participationLabel(participation({}))).toBe('Liga (2025/26)');
  });

  it('bira aktivnu ligu, pa aktivnu sezonu, pa najnoviju dostupnu', () => {
    const currentLeague = participation({ competitionId: 'l2', yearStart: 2025 });
    const olderLeague = participation({ competitionId: 'l1', yearStart: 2024, yearEnd: 2025 });
    const cup = participation({ competitionId: 'cup', isLeague: false });
    expect(pickDefaultParticipation([olderLeague, currentLeague, cup])?.competitionId).toBe('l2');
    expect(pickDefaultParticipation([olderLeague, cup])?.competitionId).toBe('l1');
    expect(pickDefaultParticipation([
      participation({ competitionId: 'cup-a', isLeague: false, yearStart: 2021, yearEnd: 2022 }),
      participation({ competitionId: 'cup-b', isLeague: false, yearStart: 2025, yearEnd: 2026 }),
    ])?.competitionId).toBe('cup-b');
    expect(pickDefaultParticipation([
      participation({ competitionId: 'old', isActive: false, yearStart: 2020 }),
      participation({ competitionId: 'new', isActive: false, yearStart: 2022 }),
    ])?.competitionId).toBe('new');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });

  it('koristi calendarSeasonId kad postoji i objedinjuje po kalendaru', () => {
    const autumn = participation({ calendarSeasonId: 'cal-1', yearStart: 2024 });
    const spring = participation({ seasonId: 's2', calendarSeasonId: 'cal-1', yearStart: 2025, seasonName: '2025/26' });
    const older = participation({ seasonId: 's3', yearStart: 2020, yearEnd: 2021 });
    expect(calendarKey(autumn)).toBe('cal-1');
    expect(calendarKey(older)).toBe('2020/2021');
    expect(participationsInCalendar([autumn, spring, older], 'cal-1')).toHaveLength(2);
    expect(uniqueCalendarSeasons([autumn, spring, older]).map((entry) => entry.key)).toEqual(['cal-1', '2020/2021']);
  });
});

describe('ticket-match-meta', () => {
  const match = {
    roundRel: { number: 6, name: 'Šesto kolo' },
    season: { name: '2025/26', competition: { name: 'Premijer liga' } },
  };

  it('vraća labelu kola, takmičenje i sezonu', () => {
    expect(ticketRoundLabel(match as never)).toBe('Šesto kolo');
    expect(ticketCompetitionName(match as never)).toBe('Premijer liga');
    expect(ticketSeasonName(match as never)).toBe('2025/26');
    expect(ticketMetaLine(match as never)).toBe('Premijer liga · 2025/26 · Šesto kolo');
  });

  it('koristi edition fallback i toleriše prazne podatke', () => {
    const edition = { edition: { competition: { name: 'Kup' }, season: { name: '2026' } } };
    expect(ticketCompetitionName(edition as never)).toBe('Kup');
    expect(ticketSeasonName(edition as never)).toBe('2026');
    expect(ticketRoundLabel()).toBeUndefined();
    expect(ticketMetaLine({ roundRel: { number: 2 } } as never)).toBe('2. kolo');
    expect(ticketMetaLine({} as never)).toBeUndefined();
  });
});

describe('user-initials i seo-meta', () => {
  it('uzima inicijale, email ili nepotpuno ime', () => {
    expect(userInitials({ firstName: ' test', lastName: 'user', email: 'x@y.z' })).toBe('TU');
    expect(userInitials({ firstName: null, lastName: null, email: 'ana@example.test' })).toBe('A');
    expect(userInitials({ firstName: 'Ana', lastName: null, email: 'a@b.c' })).toBe('A');
  });

  it('sastavlja naslov dokumenta bez ponavljanja naziva', () => {
    expect(buildDocumentTitle(undefined, 'FK')).toBe('FK');
    expect(buildDocumentTitle('  ', 'FK')).toBe('FK');
    expect(buildDocumentTitle('FK', 'FK')).toBe('FK');
    expect(buildDocumentTitle(' Vijesti ', 'FK')).toBe('Vijesti | FK');
  });

  it('gradi apsolutne URL-ove i zadržava već pune', () => {
    expect(absoluteUrl('vijesti/a')).toMatch(/^https?:\/\/.+\/vijesti\/a$/);
    expect(absoluteUrl('/kontakt')).toMatch(/^https?:\/\/.+\/kontakt$/);
    expect(absoluteUrl('https://example.test/x')).toBe('https://example.test/x');
    expect(absoluteUrl()).toMatch(/^https?:\/\/.+\/$/);
  });

  it('uklanja HTML i skraćuje meta opis', () => {
    expect(stripHtml('<p>Dobar   <b>dan</b></p>')).toBe('Dobar dan');
    expect(stripHtml(null)).toBe('');
    expect(truncateMeta('kratko')).toBe('kratko');
    expect(truncateMeta('a'.repeat(200), 10)).toBe(`${'a'.repeat(9)}…`);
    expect(defaultShareImage('originals/crest.png')).toContain('uploads/files/medium/crest.webp');
  });
});
