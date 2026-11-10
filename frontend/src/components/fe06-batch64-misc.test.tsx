import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { OnlinePaymentChoice } from './payments/OnlinePaymentChoice';
import { LeagueResultsRound } from './public/league/LeagueResultsRound';
import { Seo } from './seo/Seo';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../hooks', () => ({
  usePublicSettings: () => ({
    data: {
      'club.name': 'FK Test',
      'seo.description': 'Opis',
      'club.crestUrl': null,
      'seo.robotsIndex': 'true',
    },
  }),
}));

describe('batch64 misc', () => {
  it('OnlinePaymentChoice loading true s jednim providerom', () => {
    const { container } = render(<OnlinePaymentChoice providers={['stripe']} loading onSelect={vi.fn()} />);
    expect(container.textContent).toContain('Preusmjeravanje');
    const { container: c2 } = render(<OnlinePaymentChoice providers={['stripe']} onSelect={vi.fn()} />);
    expect(c2.textContent).toContain('Plati online');
    const { container: c3 } = render(<OnlinePaymentChoice providers={[]} onSelect={vi.fn()} />);
    expect(c3.innerHTML).toBe('');
  });

  it('LeagueResultsRound loading i prazno', () => {
    const { container } = render(
      <MemoryRouter>
        <LeagueResultsRound matches={[]} loading />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('Rezultati');
    const { container: c2 } = render(
      <MemoryRouter>
        <LeagueResultsRound matches={[]} loading={false} />
      </MemoryRouter>,
    );
    expect(c2.textContent).toContain('Nema završenih');
    const match: any = { id: 'm1', status: 'FINISHED', scheduledAt: new Date().toISOString(), homeClub: { name: 'A', slug: 'a' }, awayClub: { name: 'B' }, homeScore: 1, awayScore: 0, roundRel: { number: 1, name: '1. kolo' } };
    const { container: c3 } = render(
      <MemoryRouter>
        <LeagueResultsRound matches={[match]} loading={false} />
      </MemoryRouter>,
    );
    expect(c3.textContent).toContain('1. kolo');
  });

  it('Seo ne renderuje nista ali ne baca', () => {
    const { container } = render(
      <MemoryRouter>
        <Seo title="Naslov" description="Opis" />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe('');
    render(
      <MemoryRouter>
        <Seo title="Naslov2" />
      </MemoryRouter>,
    );
    expect(document.title).toBeDefined();
  });
});
