import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SponsorsMarquee, SponsorMarqueeItem } from './SponsorsMarquee';

const sponsor = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  name: 'BH Telecom',
  logoPath: null,
  url: null,
  ...over,
});

describe('SponsorMarqueeItem', () => {
  it('bez logotipa prikazuje ime', () => {
    const { container } = render(<SponsorMarqueeItem sponsor={sponsor() as never} />);
    expect(screen.getByText('BH Telecom')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });

  it('sa logotipom prikazuje sliku sa alt tekstom', () => {
    render(<SponsorMarqueeItem sponsor={sponsor({ logoPath: 'sp/logo.png' }) as never} />);
    const img = screen.getByRole('img', { name: 'BH Telecom' });
    expect(img.getAttribute('src')).toContain('logo');
  });

  it('sa URL-om prikazuje vanjski link sa title i rel', () => {
    render(
      <SponsorMarqueeItem
        sponsor={sponsor({ url: 'https://sponzor.ba' }) as never}
        className="moja"
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://sponzor.ba');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveAttribute('title', 'BH Telecom');
    expect(link.querySelector('.moja')).not.toBeNull();
  });
});

describe('SponsorsMarquee', () => {
  it('bez sponzora ne renderira ništa', () => {
    const { container } = render(<SponsorsMarquee sponsors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('duplira listu za beskonačnu traku', () => {
    const { container } = render(
      <SponsorsMarquee sponsors={[sponsor(), sponsor({ id: 's2', name: 'Mtel' })] as never} />,
    );
    expect(screen.getAllByText('BH Telecom')).toHaveLength(2);
    expect(screen.getAllByText('Mtel')).toHaveLength(2);
    expect(container.querySelector('.sponsors-marquee-track')).not.toBeNull();
  });

  it('reverse dodaje klasu obrnutog smjera', () => {
    const { container } = render(<SponsorsMarquee sponsors={[sponsor()] as never} reverse />);
    expect(container.querySelector('.sponsors-marquee-track')).toHaveClass(
      'sponsors-marquee-reverse',
    );
  });

  it('bez reverse nema klase obrnutog smjera', () => {
    const { container } = render(<SponsorsMarquee sponsors={[sponsor()] as never} />);
    expect(container.querySelector('.sponsors-marquee-track')).not.toHaveClass(
      'sponsors-marquee-reverse',
    );
  });
});
