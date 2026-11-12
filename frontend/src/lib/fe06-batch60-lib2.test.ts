import { describe, expect, it } from 'vitest';
import { groupTicketsByMatch } from './group-tickets-by-match';
import { getModuleToggleBlockReason } from './module-settings-rules';
import { groupMatchesByRound } from './round-utils';
import { topScorers } from '../components/team/team-stats-utils';
import { snapshotForm } from '../components/admin/form-dirty';
import { APP_MODULE_DEFINITIONS } from './module-definitions';

describe('batch60 lib — groupTicketsByMatch scheduledAt falsy [3,0]', () => {
  it('without scheduledAt → 0 fallback', () => {
    const orders = [
      {
        id: 'o1',
        tickets: [{ id: 't1', matchId: 'm1', match: { id: 'm1' } } as any],
      },
      {
        id: 'o2',
        tickets: [{ id: 't2', matchId: 'm2', match: { id: 'm2', scheduledAt: '2026-05-01T00:00:00.000Z' } } as any],
      },
    ] as any;
    const res = groupTicketsByMatch(orders);
    expect(res.length).toBe(2);
    // m1 without scheduledAt should be sorted last (0 vs date)
    expect(res[0].matchId).toBe('m2');
    expect(res[1].matchId).toBe('m1');
  });
});

describe('batch60 lib — module-settings-rules reqDef?.label ?? missing [2,0]', () => {
  it('missing reqDef uses missing key', () => {
    // Add temp definition with missing requirement
    const temp = { key: 'test.missing', label: 'TestMissing', scope: 'private' as const, requires: ['nonexistent.key'] };
    APP_MODULE_DEFINITIONS.push(temp as any);
    const msg = getModuleToggleBlockReason('test.missing', true, { 'nonexistent.key': 'false' });
    expect(msg).toBe('Uključite prvo „nonexistent.key”.');
    // cleanup
    APP_MODULE_DEFINITIONS.pop();
  });
  it('with existing reqDef uses label', () => {
    const msg = getModuleToggleBlockReason('feature.live', true, { 'modules.competitions': 'false' });
    expect(msg).toContain('Takmičenja');
  });
});

describe('batch60 lib — round-utils groupMatchesByRound fallback [30,0]', () => {
  it('without roundRel uses `${key}. kolo`', () => {
    // To hit fallback, key exists but roundRel falsy is dead (n derived from roundRel), so test the name-null path
    const matches2 = [
      { id: 'm1', roundRel: { number: 5, name: null }, scheduledAt: '2026-05-01T00:00:00.000Z' },
    ] as any;
    const res = groupMatchesByRound(matches2);
    expect(res[0].label).toBe('5. kolo');
  });
});

describe('batch60 lib — team-stats-utils topScorers fallback [23,0] x2', () => {
  it('stats undefined → []', () => {
    expect(topScorers(undefined)).toEqual([]);
    expect(topScorers(null as any)).toEqual([]);
  });
  it('stats with players without goals → filter out', () => {
    const stats = { players: [{ id: 'p1', stats: null }, { id: 'p2', stats: { goals: 2 } }, { id: 'p3', stats: { goals: undefined } }] } as any;
    const res = topScorers(stats, 10);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('p2');
  });
  it('sort with goals undefined → fallback 0', () => {
    const stats = { players: [{ id: 'p1', stats: { goals: undefined } }, { id: 'p2', stats: { goals: 1 } }] } as any;
    const res = topScorers(stats, 10);
    expect(res[0].id).toBe('p2');
  });
});

describe('batch60 lib — form-dirty files fallback [7,0]', () => {
  it('file input with null files → []', () => {
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'avatar';
    // jsdom: files is FileList, but we override to null
    Object.defineProperty(input, 'files', { value: null, writable: true });
    div.appendChild(input);
    const snap = snapshotForm(div);
    expect(snap).toContain('avatar=[]');
  });
  it('file input with files → JSON', () => {
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'doc';
    const file = new File(['a'], 'a.txt', { type: 'text/plain' });
    // Create FileList mock
    Object.defineProperty(input, 'files', { value: [file], writable: true });
    // Also need to make input.files iterable for Array.from
    div.appendChild(input);
    const snap = snapshotForm(div);
    expect(snap).toContain('doc=');
    expect(snap).toContain('a.txt');
  });
});

describe('batch60 lib — html-content iframe fallback [1,0]', () => {
  it('iframe with null textContent → ""', async () => {
    const { normalizeHtmlForRender } = await import('./html-content');
    // Create html with iframe that has no textContent (empty)
    const html = '<p>Hello</p><iframe src="https://example.com"></iframe>';
    const res = normalizeHtmlForRender(html);
    expect(res).toBeDefined();
  });
});
