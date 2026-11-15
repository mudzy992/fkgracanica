import { describe, expect, it } from 'vitest';
import {
  leagueEditionId,
  mapCalendarEditions,
  mapCalendarSeasons,
  pickDefaultEditionId,
  pickDefaultLeagueSeasonId,
} from './league-season';
import { flattenSeasonEditions } from './flatten-editions';
import { mediaUrl } from './media';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch03 — P-MOB03 lib', () => {
  it('mapCalendarSeasons filtrira bez id i default Sezona', () => {
    expect(mapCalendarSeasons(null)).toEqual([]);
    expect(mapCalendarSeasons([{ id: '1', name: '24/25', isActive: true }, { name: 'bez id' }])).toEqual([
      { id: '1', name: '24/25', isActive: true },
    ]);
    expect(mapCalendarSeasons([{ id: '2' }])).toEqual([{ id: '2', name: 'Sezona', isActive: false }]);
  });

  it('mapCalendarEditions sortira lige prvo pa po imenu', () => {
    const cal = {
      competitions: [
        { id: 'ed1', competition: { name: 'Kup', isLeague: false } },
        { id: 'ed2', competition: { name: 'Liga B', isLeague: true } },
        { id: 'ed3', competition: { name: 'Liga A', isLeague: true } },
        { id: '' },
      ],
    };
    const res = mapCalendarEditions(cal);
    expect(res.map((r) => r.id)).toEqual(['ed3', 'ed2', 'ed1']);
    expect(mapCalendarEditions(null)).toEqual([]);
    expect(mapCalendarEditions({})).toEqual([]);
  });

  it('pickDefaultEditionId vraća selected ako postoji inače liga pa prvi', () => {
    const editions = [
      { id: 'a', isLeague: false },
      { id: 'b', isLeague: true },
      { id: 'c', isLeague: false },
    ];
    expect(pickDefaultEditionId(editions, 'c')).toBe('c');
    expect(pickDefaultEditionId(editions, 'x')).toBe('b');
    expect(pickDefaultEditionId(editions)).toBe('b');
    expect(pickDefaultEditionId([{ id: 'x', isLeague: false }])).toBe('x');
    expect(pickDefaultEditionId([])).toBe('');
  });

  it('leagueEditionId delegira na map+pick', () => {
    const cal = { competitions: [{ id: 'ed1', competition: { name: 'Liga', isLeague: true } }] };
    expect(leagueEditionId(cal)).toBe('ed1');
    expect(leagueEditionId(null)).toBe('');
  });

  it('pickDefaultLeagueSeasonId bira aktivnu ili prvu', () => {
    const seasons = [
      { id: 's1', isActive: false },
      { id: 's2', isActive: true },
      { id: 's3', isActive: false },
    ];
    expect(pickDefaultLeagueSeasonId(seasons, 's3')).toBe('s3');
    expect(pickDefaultLeagueSeasonId(seasons, 'x')).toBe('s2');
    expect(pickDefaultLeagueSeasonId(seasons)).toBe('s2');
    expect(pickDefaultLeagueSeasonId([{ id: 'a', isActive: false }])).toBe('a');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
  });

  it('flattenSeasonEditions spaja kalendare i edicije', () => {
    const data = [
      { id: 'cal1', name: '2023/24', competitions: [{ id: 'ed1', competition: { name: 'Liga' } }] },
      { id: 'cal2', competitions: [{ id: 'ed2', competition: {} }] },
      { id: '' },
    ];
    const res = flattenSeasonEditions(data);
    expect(res).toEqual([
      { id: 'ed1', calendarId: 'cal1', calendarName: '2023/24', name: 'Liga · 2023/24' },
      { id: 'ed2', calendarId: 'cal2', calendarName: 'Sezona', name: 'Takmičenje · Sezona' },
    ]);
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });

  it('mediaUrl vraća null za prazno i prosleđuje http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.test/img.jpg')).toBe('https://cdn.test/img.jpg');
    expect(mediaUrl('http://cdn.test/img.jpg')).toBe('http://cdn.test/img.jpg');
  });

  it('mediaUrl normalizuje uploads i varijante', () => {
    const base = 'https://api.fkgracanica.ba101.top/api/v1';
    expect(mediaUrl('originals/foto.jpg', 'original')).toBe(`${base}/uploads/files/originals/foto.jpg`);
    expect(mediaUrl('originals/foto.jpg', 'thumb')).toBe(`${base}/uploads/files/thumbs/foto.webp`);
    expect(mediaUrl('originals/foto.png', 'medium')).toBe(`${base}/uploads/files/medium/foto.webp`);
    expect(mediaUrl('uploads/originals/foto.jpg', 'medium')).toBe(`${base}/uploads/files/medium/foto.webp`);
    expect(mediaUrl('./originals/foto.jpg', 'thumb')).toBe(`${base}/uploads/files/thumbs/foto.webp`);
    expect(mediaUrl('other/foto.jpg', 'thumb')).toBe(`${base}/uploads/files/other/foto.jpg`);
  });

  it('parseYouTubeId youtu.be i youtube.com v', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc123&list=PL')).toBe('abc123');
  });

  it('parseYouTubeId embed/live/shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('parseYouTubeId nevažeći host ili url vraća null', () => {
    expect(parseYouTubeId('https://vimeo.com/123')).toBeNull();
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('https://www.youtube.com/watch')).toBeNull();
    expect(parseYouTubeId('https://www.youtube.com/')).toBeNull();
  });
});
