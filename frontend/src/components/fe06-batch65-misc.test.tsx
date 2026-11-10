import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { OnlinePaymentChoice } from './payments/OnlinePaymentChoice';
import { validateWidgetConfig } from '../cms/widgets/schemas';
import { statsByPlayerId, topScorers, formationLabel, spotlightPlayers } from './team/team-stats-utils';
import { normalizeHtmlForRender, stripHtml } from '../lib/html-content';
import { buildDocumentTitle, defaultShareImage, stripHtml as stripSeoHtml, truncateMeta } from '../lib/seo-meta';
import { MatchStatisticsSection } from './match/MatchStatisticsSection';

// FeaturedPlayersWidget needs hooks mocked — reuse pattern from existing test
const fpState = vi.hoisted(() => ({
  club: { data: { id: 'c1' } as unknown },
  players: { data: [] as unknown, isLoading: false },
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../hooks', () => ({
  useOwnClub: () => fpState.club,
  usePlayers: () => fpState.players,
}));
vi.mock('./ui/skeleton', () => ({ Skeleton: () => <div data-testid="skeleton" /> }));

import { FeaturedPlayersWidget } from '../cms/widgets/FeaturedPlayersWidget';

describe('batch65 misc - ?? fallbackovi', () => {
  it('validateWidgetConfig pokriva config ?? {} i nepoznat tip', () => {
    const r1 = validateWidgetConfig('hero', undefined);
    expect(r1.ok).toBe(false); // hero requires title min1, {} fails -> error
    const r2 = validateWidgetConfig('hero', null);
    expect(r2.ok).toBe(false);
    const r3 = validateWidgetConfig('hero', { title: 'Naslov' });
    expect(r3.ok).toBe(true);
    const r4 = validateWidgetConfig('nepostojeci', {});
    expect(r4.ok).toBe(false);
    expect(r4.error).toContain('Nepoznat');
  });

  it('team-stats-utils pokriva stats?.players ?? [] i sort ?? 0', () => {
    expect(statsByPlayerId(undefined).size).toBe(0);
    expect(statsByPlayerId(null as never).size).toBe(0);
    expect(statsByPlayerId({ players: [] } as never).size).toBe(0);
    expect(topScorers(undefined).length).toBe(0);
    expect(topScorers(null as never).length).toBe(0);
    // sort comparator ?? 0 — treba igrače sa stats = null/undefined ili goals = undefined
    const statsWithMissing = {
      players: [
        { id: 'p1', stats: null },
        { id: 'p2', stats: { goals: undefined } },
        { id: 'p3', stats: { goals: 2 } },
        { id: 'p4', stats: { goals: 0 } },
      ],
    } as never;
    const sorted = topScorers(statsWithMissing, 10);
    // p3 (2 gola) bi trebao biti prvi, ostali sa 0 ne prolaze filter >0
    expect(sorted.length).toBe(1);
    expect(sorted[0].id).toBe('p3');
    // statsByPlayerId sa stats null
    const map = statsByPlayerId({ players: [{ id: 'p1', stats: { goals: 1 } }, { id: 'p2', stats: null }] } as never);
    expect(map.size).toBe(1);
    expect(map.get('p1')).toBeDefined();
    expect(formationLabel(null)).toBeNull();
    expect(formationLabel(undefined)).toBeNull();
    expect(formationLabel({ def: 4, mid: 3, fwd: 3 })).toBe('4-3-3');
    expect(spotlightPlayers(undefined, [])).toEqual([]);
    expect(spotlightPlayers(null, [{ id: 'p1' } as never])).toEqual([]);
  });

  it('OnlinePaymentChoice pokriva vise provajdera (else grana)', () => {
    const onSelect = vi.fn();
    const { container } = render(<OnlinePaymentChoice providers={['stripe', 'paypal']} onSelect={onSelect} />);
    // treba 2 dugmeta sa aria-label
    const btns = container.querySelectorAll('button[aria-label]');
    expect(btns.length).toBe(2);
    expect(btns[0].getAttribute('aria-label')).toContain('Stripe');
    // fullWidth varijanta
    const { container: c2 } = render(<OnlinePaymentChoice providers={['stripe', 'monri']} fullWidth onSelect={onSelect} />);
    expect(c2.querySelectorAll('button').length).toBe(2);
    // single provider loading false vec pokriven u batch64, ali provjeri disabled
    const { container: c3 } = render(<OnlinePaymentChoice providers={['stripe']} disabled onSelect={onSelect} />);
    expect(c3.querySelector('button')?.hasAttribute('disabled')).toBe(true);
  });

  it('FeaturedPlayersWidget pokriva viewAllUrl ?? /tim i number ?? ?', () => {
    fpState.club = { data: { id: 'c1' } } as never;
    fpState.players = { data: [], isLoading: false } as never;
    const { container } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 2 } as never} />
      </MemoryRouter>,
    );
    // fallback /tim
    const link = container.querySelector('a[href="/tim"]');
    expect(link).not.toBeNull();
    // sa custom viewAllUrl
    const { container: c2 } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 2, viewAllUrl: '/custom' } as never} />
      </MemoryRouter>,
    );
    expect(c2.querySelector('a[href="/custom"]')).not.toBeNull();
    // number ?? '?' — igrac bez broja i bez slike
    fpState.players = {
      data: [{ id: 'p9', firstName: 'Test', lastName: 'Igrač', number: null, position: 'Vezni', photoPath: null }],
      isLoading: false,
    } as never;
    const { container: c3 } = render(
      <MemoryRouter>
        <FeaturedPlayersWidget config={{ limit: 4 } as never} />
      </MemoryRouter>,
    );
    expect(c3.textContent).toContain('?');
  });

  it('MatchStatisticsSection pokriva possession ?? fallback', () => {
    const match = {
      status: 'FINISHED',
      homeClub: { name: 'Domaći TK' },
      awayClub: { name: 'Gosti TK' },
    } as never;
    const statsOneSideNull = {
      team: {
        home: { goals: 1, shots: 5, shotsOn: 2, corners: 3, fouls: 4, offsides: 1, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
        away: { goals: 0, shots: 3, shotsOn: 1, corners: 2, fouls: 2, offsides: 0, yellowCards: 1, redCards: 0, saves: 2, penaltiesScored: 0, penaltiesMissed: 0, possession: 60 },
      },
      players: { home: [], away: [] },
    } as never;
    const { container } = render(<MatchStatisticsSection match={match} stats={statsOneSideNull} loading={false} />);
    // home possession null => 100-60=40, away 60
    expect(container.textContent).toContain('Posjed');
    // obrnuto: home 60, away null
    const statsOtherNull = {
      team: {
        home: { goals: 1, shots: 5, shotsOn: 2, corners: 3, fouls: 4, offsides: 1, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: 60 },
        away: { goals: 0, shots: 3, shotsOn: 1, corners: 2, fouls: 2, offsides: 0, yellowCards: 1, redCards: 0, saves: 2, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
      },
      players: { home: [], away: [] },
    } as never;
    const { container: c2 } = render(<MatchStatisticsSection match={match} stats={statsOtherNull} loading={false} />);
    expect(c2.textContent).toContain('Posjed');
    // oba null => nema Posjed (guard ne renderuje)
    const statsBothNull = {
      team: {
        home: { goals: 1, shots: 5, shotsOn: 2, corners: 3, fouls: 4, offsides: 1, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
        away: { goals: 0, shots: 3, shotsOn: 1, corners: 2, fouls: 2, offsides: 0, yellowCards: 1, redCards: 0, saves: 2, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
      },
      players: { home: [], away: [] },
    } as never;
    const { container: c3 } = render(<MatchStatisticsSection match={match} stats={statsBothNull} loading={false} />);
    expect(c3.textContent).not.toContain('Posjed');
    // oba definirana => 60-40
    const statsBothDef = {
      team: {
        home: { goals: 1, shots: 5, shotsOn: 2, corners: 3, fouls: 4, offsides: 1, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: 55 },
        away: { goals: 0, shots: 3, shotsOn: 1, corners: 2, fouls: 2, offsides: 0, yellowCards: 1, redCards: 0, saves: 2, penaltiesScored: 0, penaltiesMissed: 0, possession: 45 },
      },
      players: { home: [], away: [] },
    } as never;
    const { container: c4 } = render(<MatchStatisticsSection match={match} stats={statsBothDef} loading={false} />);
    expect(c4.textContent).toContain('Posjed');
  });

  it('html-content i seo-meta pokrivaju fallbackove', () => {
    // html-content: iframe sa praznim textContent -> ?? ''
    const empty = normalizeHtmlForRender('');
    expect(empty).toBe('');
    const simple = normalizeHtmlForRender('<p>Zdravo</p>');
    expect(simple).toContain('Zdravo');
    // dvostruko escapovan
    const esc = normalizeHtmlForRender('&lt;p&gt;Test&lt;/p&gt;');
    expect(esc).toContain('Test');
    // stripHtml
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<div> A  B </div>')).toBe('A B');
    // sa iframe - stripHtml treba ukloniti iframe tag ali zadrzati textContent
    const withIframe = stripHtml('<div><iframe src="x">unutra</iframe>hello</div>');
    expect(withIframe).not.toContain('iframe');
    expect(withIframe).toContain('unutra');
    expect(withIframe).toContain('hello');
    // iframe bez texta -> ?? '' fallback
    const iframeEmpty = stripHtml('<div><iframe src="x"></iframe>hello</div>');
    expect(iframeEmpty).toContain('hello');
    expect(iframeEmpty).not.toContain('iframe');
    // seo-meta
    expect(buildDocumentTitle(undefined, 'FK Gračanica')).toBe('FK Gračanica');
    expect(buildDocumentTitle('   ', 'FK Gračanica')).toBe('FK Gračanica');
    expect(buildDocumentTitle('FK Gračanica', 'FK Gračanica')).toBe('FK Gračanica');
    expect(buildDocumentTitle('Naslov', 'FK Gračanica')).toBe('Naslov | FK Gračanica');
    expect(defaultShareImage(null)).toBeUndefined();
    expect(defaultShareImage(undefined)).toBeUndefined();
    expect(defaultShareImage('originals/crest.png')).toBeDefined();
    expect(stripSeoHtml('<b>Test</b>')).toBe('Test');
    expect(stripSeoHtml(null)).toBe('');
    expect(truncateMeta('a'.repeat(200), 10).endsWith('…')).toBe(true);
    expect(truncateMeta('kratko').length).toBeLessThanOrEqual(160);
  });
});
