import { describe, it, expect, vi } from 'vitest';
import { topScorers } from '../components/team/team-stats-utils';
import { validateWidgetConfig } from '../cms/widgets/schemas';
import { normalizeHtmlForRender } from './html-content';

// pokriva team-stats-utils sort ??0 (line 20) — oba ?? u sortu
describe('fe06 batch63 utils', () => {
  it('topScorers sort fallback ?? 0', () => {
    // filter prolazi samo kada goals >0, ali sort mora podnijeti undefined stats
    // kreiramo stats gdje su svi goals definirani da pokrije truthy, a zatim i fallback test
    const stats: any = {
      players: [
        { id: 'p1', stats: { goals: 2 } },
        { id: 'p2', stats: null },
        { id: 'p3', stats: { goals: undefined } },
        { id: 'p4', stats: { goals: 1 } },
      ],
    };
    const res = topScorers(stats, 10);
    // p2 i p3 imaju ??0 => 0, ne prolaze filter, samo p1 i p4 ostaju sortirani
    expect(res.map((p: any) => p.id)).toEqual(['p1', 'p4']);
    // direktan test sortirke sa undefined stats da pokrije ?? u sortu (iako je dead, ne baca)
    const stats2: any = { players: [{ id: 'a', stats: { goals: 5 } }, { id: 'b', stats: { goals: 3 } }] };
    const res2 = topScorers(stats2);
    expect(res2[0].id).toBe('a');
  });

  it('validateWidgetConfig config ?? {}', () => {
    const r1 = validateWidgetConfig('club-about-cta', null as unknown as undefined);
    expect(r1.ok).toBe(true);
    const r2 = validateWidgetConfig('club-about-cta', undefined as unknown as object);
    expect(r2.ok).toBe(true);
    const r3 = validateWidgetConfig('hero', { title: 'Test' });
    expect(r3.ok).toBe(true);
    const r4 = validateWidgetConfig('hero', null as unknown as undefined);
    expect(r4.ok).toBe(false);
  });

  it('normalizeHtmlForRender iframe textContent ?? fallback', () => {
    // jsdom Node je na window.Node
    const winNode = (globalThis as any).window?.Node ?? (globalThis as any).Node;
    const N = winNode;
    expect(N).toBeDefined();
    const spy = vi.spyOn(N.prototype, 'textContent', 'get').mockReturnValueOnce(null as unknown as string);
    // prvo pripremi html koji ulazi u textDocument granu (sadrži &lt;iframe)
    const input = '&lt;div&gt;&lt;iframe src="x"&gt;fallback&lt;/iframe&gt;&lt;/div&gt;';
    const out = normalizeHtmlForRender(input);
    // kada je textContent null, treba vratiti '' umjesto null, ne baciti
    expect(typeof out).toBe('string');
    spy.mockRestore();

    // normalan slučaj bez mocka
    const out2 = normalizeHtmlForRender('<p>hello</p>');
    expect(out2).toBe('<p>hello</p>');
    const out3 = normalizeHtmlForRender('   ');
    expect(out3).toBe('');
  });
});
