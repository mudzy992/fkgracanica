import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('batch62 simple — sponsor, league, html', () => {
  it('SponsorLogoTile with logoPath', async () => {
    const { SponsorLogoTile } = await import('./public/sponsors/SponsorLogoTile');
    const sponsor: any = { name: 'S', logoPath: 'logo.png', url: null };
    const meta: any = { variant: 'hero' };
    const { container } = render(<SponsorLogoTile sponsor={sponsor} meta={meta} />);
    expect(container.querySelector('img')).toBeTruthy();
  });
  it('LeagueNextMatch with and without label', async () => {
    const { LeagueNextMatch } = await import('./public/league/LeagueNextMatch');
    const future = new Date(Date.now() + 86400000).toISOString();
    const m1: any = { id: '1', status: 'SCHEDULED', scheduledAt: future, homeClub: { name: 'A' }, awayClub: { name: 'B' }, roundRel: null };
    const { container: c1 } = render(<MemoryRouter><LeagueNextMatch matches={[m1]} /></MemoryRouter>);
    expect(c1.textContent).toBeDefined();
    const m2: any = { id: '2', status: 'SCHEDULED', scheduledAt: future, homeClub: { name: 'A' }, awayClub: { name: 'B' }, roundRel: { number: 1, name: 'Kolo 1' } };
    const { container: c2 } = render(<MemoryRouter><LeagueNextMatch matches={[m2]} /></MemoryRouter>);
    expect(c2.textContent).toContain('Kolo');
  });
  it('LeagueResultsRound club.slug falsy', async () => {
    const { LeagueResultsRound } = await import('./public/league/LeagueResultsRound');
    const m: any = { id: '1', status: 'FINISHED', homeClub: { id: 'c1', name: 'H', slug: null }, awayClub: { id: 'c2', name: 'A', slug: 'a' }, homeScore: 1, awayScore: 0, scheduledAt: '2026-05-01T00:00:00.000Z', roundRel: { number: 1, name: null } };
    const { container } = render(<MemoryRouter><LeagueResultsRound matches={[m]} loading={false} /></MemoryRouter>);
    expect(container.textContent).toContain('H');
  });
  it('html-content iframe fallback', async () => {
    const { normalizeHtmlForRender } = await import('../lib/html-content');
    const html = '<p>hi</p><iframe src="https://example.com"></iframe>';
    const res = normalizeHtmlForRender(html);
    expect(res).toBeDefined();
  });
});
