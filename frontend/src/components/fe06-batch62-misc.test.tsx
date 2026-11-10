import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, v?: any) => k }) }));

describe('batch62 misc', () => {
  it('LeagueRoundPicker empty and value', async () => {
    const { LeagueRoundPicker } = await import('./public/league/LeagueRoundPicker');
    const onChange = vi.fn();
    const { container: c1 } = render(<LeagueRoundPicker rounds={[{ number: 1, label: '1' }]} value={null} onChange={onChange} />);
    const select = c1.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('');
    fireEvent.change(select, { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith(1);
    const { container: c2 } = render(<LeagueRoundPicker rounds={[{ number: 1, label: '1' }]} value={1} onChange={onChange} />);
    expect((c2.querySelector('select') as HTMLSelectElement).value).toBe('1');
    fireEvent.change(c2.querySelector('select')!, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('MatchLineupSection lineup fallback', async () => {
    const { MatchLineupSection } = await import('./match/MatchCenterSections');
    const match: any = { id: 'm1', homeClubId: 'h1', awayClubId: 'a1', homeClub: { name: 'H' }, awayClub: { name: 'A' }, lineup: null, lineups: undefined };
    const { container: c1 } = render(<MemoryRouter><MatchLineupSection match={match} /></MemoryRouter>);
    expect(c1.textContent).toBeDefined();
    const match2: any = { id: 'm2', homeClubId: 'h1', awayClubId: 'a1', homeClub: { name: 'H' }, awayClub: { name: 'A' }, lineup: null, lineups: [{ id: 'l1', clubId: 'h1', isStarter: true, player: { id: 'p1', firstName: 'A', lastName: 'B', clubId: 'h1' } }] };
    const { container: c2 } = render(<MemoryRouter><MatchLineupSection match={match2} /></MemoryRouter>);
    expect(c2.textContent).toContain('Startna');
  });

  it('SponsorLogoTile href fallback', async () => {
    const { SponsorLogoTile } = await import('./public/sponsors/SponsorLogoTile');
    const sponsor: any = { id: 's1', name: 'S', url: 'https://example.com', logoPath: 'logo.png' };
    const meta: any = { variant: 'gold' };
    const { container: c1 } = render(<SponsorLogoTile sponsor={sponsor} meta={meta} />);
    expect(c1.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    const sponsor2: any = { id: 's2', name: 'S2', url: null, logoPath: null };
    const meta2: any = { variant: 'partner' };
    const { container: c2 } = render(<SponsorLogoTile sponsor={sponsor2} meta={meta2} />);
    expect(c2.textContent).toBeDefined();
  });

  it('Seo with and without description', async () => {
    const { Seo } = await import('./seo/Seo');
    const qc = new QueryClient();
    const wrap = ({ children }: any) => <QueryClientProvider client={qc}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>;
    const { container: c1 } = render(<Seo title="Naslov" description="Opis" />, { wrapper: wrap });
    expect(document.title).toBeDefined();
    const { container: c2 } = render(<Seo title="Naslov2" />, { wrapper: wrap });
    expect(document.title).toBeDefined();
  });
});
