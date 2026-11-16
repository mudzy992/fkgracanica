import { describe, expect, it } from 'vitest';
import { kpiLabel } from './dashboard-kpi-labels';
import { flattenSeasonEditions } from './flatten-editions';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
describe('mob-batch42 — P-MOB42 dashboard helpers', () => {
  it('kpiLabel fallback', () => { expect(kpiLabel('users')).toBe('Korisnici'); expect(kpiLabel('unknown')).toBe('unknown'); });
  it('flattenSeasonEditions flatMap', () => {
    const r = flattenSeasonEditions([{ id: 'c1', name: '2023', competitions: [{ id: 'e1', competition: { name: 'Liga' } }, { competition: {} }] }]);
    expect(r.length).toBe(1); expect(r[0].id).toBe('e1'); expect(r[0].calendarName).toBe('2023'); expect(r[0].name).toContain('Liga');
  });
  it('flattenSeasonEditions prazno', () => { expect(flattenSeasonEditions([])).toEqual([]); expect(flattenSeasonEditions([{ id: 'c1', competitions: [] }] as any)).toEqual([]); });
  it('flattenSeasonEditions default Sezona', () => {
    const r = flattenSeasonEditions([{ id: 'c1', competitions: [{ id: 'e1', competition: {} }] }] as any);
    expect(r[0].calendarName).toBe('Sezona'); expect(r[0].name).toContain('Takmičenje');
  });
  it('deskCounts live/scheduled/reports', () => {
    expect(deskCounts([{ status: 'LIVE' }, { status: 'HALFTIME' }, { status: 'SCHEDULED' }, { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }, { status: 'FINISHED' }])).toEqual({ live: 2, scheduled: 1, reports: 1 });
  });
  it('deskCounts prazno', () => { expect(deskCounts([])).toEqual({ live: 0, scheduled: 0, reports: 0 }); });
  it('filterCommentatorDesk live/today/report', () => {
    const now = new Date(); const todayStr = now.toISOString();
    const items = [{ status: 'LIVE' }, { status: 'SCHEDULED', scheduledAt: todayStr }, { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' }, { status: 'SCHEDULED', scheduledAt: '2000-01-01' }, { status: 'FINISHED' }] as any;
    const r = filterCommentatorDesk(items);
    expect(r.length).toBe(3);
  });
  it('filterCommentatorDesk danas false za jučer', () => {
    const y = new Date(Date.now() - 86400000).toISOString();
    expect(filterCommentatorDesk([{ status: 'SCHEDULED', scheduledAt: y } as any])).toEqual([]);
  });
  it('kpiLabel sve ključeve', () => { expect(kpiLabel('uniqueVisitorsTotal30d')).toContain('Ukupni'); });
  it('flattenSeasonEditions više kalendara', () => {
    const r = flattenSeasonEditions([{ id: 'c1', name: 'A', competitions: [{ id: 'e1', competition: { name: 'X' } }] }, { id: 'c2', name: 'B', competitions: [{ id: 'e2', competition: { name: 'Y' } }] }] as any);
    expect(r.map((x) => x.id)).toEqual(['e1', 'e2']);
  });
  it('deskCounts HALFTIME broji kao live', () => { expect(deskCounts([{ status: 'HALFTIME' }]).live).toBe(1); });
});
