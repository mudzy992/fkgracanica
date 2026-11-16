import { describe, expect, it } from 'vitest';
import { emptyWriterArticle, mapWriterArticle, writerWritePayload } from '../components/writer/writer-article';
import { commonBs, commonEn } from '../i18n/common';
import { homeBs, homeEn } from '../i18n/home';
import { heritageBs, heritageEn } from '../i18n/heritage';
describe('mob-batch50 — P-MOB50 writer-article/i18n', () => {
  it('emptyWriterArticle', () => { const a=emptyWriterArticle(); expect(a.status).toBe('DRAFT'); expect(a.relatedPlayers).toEqual([]); });
  it('mapWriterArticle', () => {
    const raw={id:'1',title:'T',slug:'s',tags:[{name:'a'}],galleryId:'g1',gallery:{title:'Gal'},relatedPlayers:[{player:{id:'p1',firstName:'E',lastName:'M'}}],relatedMatches:[{match:{id:'m1',homeClub:{name:'A'},awayClub:{name:'B'},scheduledAt:'2026-01-01T10:00:00Z'}}]};
    const a=mapWriterArticle(raw); expect(a.tagsCsv).toBe('a'); expect(a.gallery?.id).toBe('g1'); expect(a.relatedPlayers[0].label).toBe('E M'); expect(a.relatedMatches[0].label).toContain('A vs B');
  });
  it('writerWritePayload trims', () => {
    const a={...emptyWriterArticle(),title:'  T  ',content:' <p>hi</p> ',tagsCsv:'a, b',relatedPlayers:[{id:'p1',label:'E'}],relatedMatches:[]} as any;
    const p=writerWritePayload(a); expect(p.title).toBe('T'); expect(p.tags).toEqual(['a','b']);
  });
  it('commonBs keys', () => { expect(commonBs.appName).toBe('FK Gračanica'); expect(commonBs.login).toBe('Prijava'); });
  it('commonEn mirrors', () => { expect(commonEn.login).toBe('Login'); expect(Object.keys(commonEn)).toEqual(Object.keys(commonBs)); });
  it('homeBs', () => { expect(homeBs.liveNow).toBe('UŽIVO'); expect(homeBs.joinClub).toBeTruthy(); });
  it('homeEn mirrors', () => { expect(homeEn.liveNow).toBe('LIVE'); expect(Object.keys(homeEn)).toEqual(Object.keys(homeBs)); });
  it('heritageBs', () => { expect(heritageBs.legends).toBe('Legende'); expect(heritageBs.museumEmpty).toContain('Nema'); });
  it('heritageEn mirrors', () => { expect(heritageEn.legends).toBe('Legends'); expect(Object.keys(heritageEn)).toEqual(Object.keys(heritageBs)); });
  it('mapWriterArticle empty', () => { const a=mapWriterArticle({}); expect(a.id).toBe(''); expect(a.status).toBe('DRAFT'); });
  it('writerWritePayload empty tags', () => { const a=emptyWriterArticle(); expect(writerWritePayload(a).tags).toEqual([]); });
});
