import { describe, expect, it } from 'vitest';
import { mediaUrl } from './media';
import { htmlToParagraphs, stripHtml } from './html-text';
import { matchMetaLine, matchStatusKey } from './match-status';
describe('mob-batch44 — P-MOB44 media/html/match', () => {
  it('mediaUrl null/prazno', () => { expect(mediaUrl(null)).toBeNull(); expect(mediaUrl('')).toBeNull(); });
  it('mediaUrl http passthrough', () => { expect(mediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg'); });
  it('mediaUrl variant original/thumbs/medium', () => {
    expect(mediaUrl('originals/a.jpg', 'original')).toContain('originals/a.jpg');
    expect(mediaUrl('originals/a.png', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('originals/a.jpeg', 'medium')).toContain('medium/a.webp');
    expect(mediaUrl('uploads/b.jpg')).toContain('/uploads/files/b.jpg');
  });
  it('mediaUrl bez originals', () => { expect(mediaUrl('other/a.jpg')).toContain('other/a.jpg'); });
  it('stripHtml br/p/entity', () => {
    expect(stripHtml('<p>Hello<br/>World</p>')).toBe('Hello\nWorld');
    expect(stripHtml('a &amp; b')).toBe('a & b'); expect(stripHtml('&#65;')).toBe('A'); expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&unknown;')).toBe('');
  });
  it('stripHtml prazno i više newline', () => { expect(stripHtml('')).toBe(''); expect(stripHtml('<p>a</p><p>b</p><p>c</p>')).toContain('a'); });
  it('htmlToParagraphs', () => { expect(htmlToParagraphs('<p>one</p><p>two</p>')).toEqual(['one', 'two']); expect(htmlToParagraphs('')).toEqual([]); });
  it('matchStatusKey', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive'); expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished'); expect(matchStatusKey('unknown')).toBe('matchScheduled');
  });
  it('matchMetaLine competition i round', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Liga' } }, roundRel: { number: 5 } }, (n) => `${n}. kolo`)).toBe('Liga · 5. kolo');
    expect(matchMetaLine({ roundRel: { name: 'Finale', number: 0 } } as any, () => 'x')).toBe('Finale');
    expect(matchMetaLine({}, () => 'x')).toBe('');
  });
  it('matchMetaLine samo competition', () => { expect(matchMetaLine({ season: { competition: { name: 'Kup' } } }, () => 'r')).toBe('Kup'); });
  it('stripHtml nbsp', () => { expect(stripHtml('a&nbsp;b')).toBe('a b'); });
});
