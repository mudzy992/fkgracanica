import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { SponsorsTierSection } from './sponsors/SponsorsTierSection';
import { SponsorLogoTile } from './sponsors/SponsorLogoTile';
import { SponsorHeroCard } from './sponsors/SponsorHeroCard';
import { SponsorsCinematicHero } from './sponsors/SponsorsCinematicHero';
import { TrophyCard } from './trophies/TrophyCard';
import { TrophyFeaturedShowcase } from './trophies/TrophyFeaturedShowcase';
import { TrophiesCinematicHero } from './trophies/TrophiesCinematicHero';
import { SPONSOR_TIER_META } from '../../lib/sponsor-tiers';

vi.mock('./RichContent', () => ({
  RichContent: ({ html }: { html: string }) => <div data-testid="rich">{html}</div>,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const sponsor = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  name: 'BH Telecom',
  logoPath: null,
  url: null,
  tier: 'GOLD',
  ...over,
});

const trophy = (over: Record<string, unknown> = {}) => ({
  id: 't1',
  year: 2024,
  name: 'Kup BiH',
  competition: 'Kup',
  imagePath: null,
  description: null,
  ...over,
});

beforeAll(() => installDialogPolyfill());

describe('SponsorsTierSection', () => {
  it('jedan glavni sponzor ide u hero karticu', () => {
    wrap(<SponsorsTierSection tier="GENERAL" sponsors={[sponsor({ logoPath: 's/1.png' })] as never} />);
    expect(screen.getByText(SPONSOR_TIER_META.GENERAL.label)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'BH Telecom' })).toBeInTheDocument();
  });

  it('više glavnih sponzora ide u mrežu sa naslovom', () => {
    wrap(
      <SponsorsTierSection
        tier="GENERAL"
        sponsors={[sponsor({ id: 'a', name: 'A' }), sponsor({ id: 'b', name: 'B' })] as never}
      />,
    );
    expect(screen.getByText('Glavni sponzor')).toBeInTheDocument();
    expect(screen.getByText('Strateški partner kluba')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('zlatni nivo prikazuje naslov i pločice', () => {
    wrap(<SponsorsTierSection tier="GOLD" sponsors={[sponsor()] as never} />);
    expect(screen.getByText('Zlatni sponzori')).toBeInTheDocument();
    expect(screen.getByText('Premium partneri')).toBeInTheDocument();
    expect(screen.getByText('BH Telecom')).toBeInTheDocument();
  });
});

describe('SponsorLogoTile', () => {
  it('bez logotipa prikazuje samo ime', () => {
    wrap(<SponsorLogoTile sponsor={sponsor() as never} meta={SPONSOR_TIER_META.SILVER} />);
    expect(screen.getByText('BH Telecom')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('sa logotipom prikazuje sliku i ime', () => {
    wrap(
      <SponsorLogoTile
        sponsor={sponsor({ logoPath: 's/1.png' }) as never}
        meta={SPONSOR_TIER_META.BRONZE}
      />,
    );
    expect(screen.getByRole('img', { name: 'BH Telecom' })).toBeInTheDocument();
    expect(screen.getByText('BH Telecom')).toBeInTheDocument();
  });

  it('partner nivo i dalje prikazuje ime uz logo', () => {
    wrap(
      <SponsorLogoTile
        sponsor={sponsor({ logoPath: 's/1.png' }) as never}
        meta={SPONSOR_TIER_META.PARTNER}
      />,
    );
    expect(screen.getByText('BH Telecom')).toBeInTheDocument();
  });

  it('sa URL-om postaje vanjski link', () => {
    wrap(
      <SponsorLogoTile
        sponsor={sponsor({ url: 'https://bh.ba' }) as never}
        meta={SPONSOR_TIER_META.GOLD}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://bh.ba');
    expect(link).toHaveAttribute('title', 'BH Telecom');
  });
});

describe('SponsorHeroCard', () => {
  it('sa URL-om je link i prikazuje ime bez logotipa', () => {
    wrap(<SponsorHeroCard sponsor={sponsor({ url: 'https://bh.ba', logoPath: 's/1.png' }) as never} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://bh.ba');
    expect(screen.getByRole('heading', { name: 'BH Telecom' })).toBeInTheDocument();
  });

  it('bez URL-a nije link i prikazuje veliko ime', () => {
    wrap(<SponsorHeroCard sponsor={sponsor() as never} className="moja" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('BH Telecom')).toBeInTheDocument();
    expect(document.body.querySelector('.moja')).not.toBeNull();
  });
});

describe('SponsorsCinematicHero', () => {
  it('bez sponzora nema KPI pločica', () => {
    wrap(<SponsorsCinematicHero totalCount={0} premiumCount={0} partnerCount={0} />);
    expect(screen.queryByText('Ukupno')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Naši sponzori' })).toBeInTheDocument();
  });

  it('prikazuje tri KPI pločice', () => {
    wrap(<SponsorsCinematicHero totalCount={9} premiumCount={4} partnerCount={5} />);
    expect(screen.getByText('Ukupno')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Partneri')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});

describe('TrophyCard', () => {
  it('bez slike prikazuje godinu u krugu', () => {
    const { container } = wrap(<TrophyCard trophy={trophy() as never} />);
    expect(screen.getAllByText('2024').length).toBeGreaterThan(0);
    expect(container.querySelector('img')).toBeNull();
  });

  it('sa slikom i takmičenjem prikazuje sve podatke', () => {
    const { container } = wrap(
      <TrophyCard trophy={trophy({ imagePath: 'tr/1.png', competition: 'Kup RS' }) as never} />,
    );
    expect(container.querySelector('img')).not.toBeNull();
    expect(screen.getByText('Kup RS')).toBeInTheDocument();
  });
});

describe('TrophyFeaturedShowcase', () => {
  it('bez slike prikazuje godinu i opis kroz RichContent', () => {
    wrap(
      <TrophyFeaturedShowcase
        trophy={trophy({ description: '<p>Opis</p>', competition: 'Premijer liga' }) as never}
      />,
    );
    expect(screen.getByText('Najveći uspjeh')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kup BiH' })).toBeInTheDocument();
    expect(screen.getByTestId('rich')).toHaveTextContent('<p>Opis</p>');
    expect(screen.getByText('Premijer liga')).toBeInTheDocument();
  });

  it('compact režim sa slikom nema opisa', () => {
    const { container } = wrap(
      <TrophyFeaturedShowcase trophy={trophy({ imagePath: 'tr/1.png' }) as never} compact />,
    );
    expect(container.querySelector('img')).not.toBeNull();
    expect(screen.queryByTestId('rich')).toBeNull();
    expect(screen.queryByText('Premijer liga')).toBeNull();
  });
});

describe('TrophiesCinematicHero', () => {
  it('bez trofeja nema KPI pločica', () => {
    wrap(<TrophiesCinematicHero totalCount={0} competitionCount={0} />);
    expect(screen.queryByText('Trofeja')).toBeNull();
  });

  it('prikazuje KPI pločice sa godinom', () => {
    wrap(<TrophiesCinematicHero totalCount={12} featuredYear={2024} competitionCount={3} />);
    expect(screen.getByText('Trofeja')).toBeInTheDocument();
    expect(screen.getByText('Vrhunac')).toBeInTheDocument();
    expect(screen.getByText('Takmičenja')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });
});
