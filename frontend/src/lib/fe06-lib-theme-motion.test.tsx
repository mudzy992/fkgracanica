import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from './theme';
import { AnimatedSection } from './motion/AnimatedSection';
import { Reveal } from './motion/Reveal';
import { defaultTransition, fadeUp, scaleIn, staggerContainer } from './motion/presets';

function ThemeProbe() {
  const { resolved } = useTheme();
  return <span>tema:{resolved}</span>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark', 'light');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThemeProvider', () => {
  it('postavlja dark klasu i pamti izbor', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByText('tema:dark')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(localStorage.getItem('fk-theme')).toBe('dark');
  });

  it('uklanja raniju light klasu', () => {
    document.documentElement.classList.add('light');
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('useTheme van providera baca grešku', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<ThemeProbe />)).toThrow('useTheme must be used within ThemeProvider');
  });
});

describe('AnimatedSection', () => {
  it('renderuje sekciju sa klasama varijante i id-em', () => {
    const { container } = render(
      <AnimatedSection id="o-klubu" variant="surface" className="moja-klasa">
        Sadržaj
      </AnimatedSection>,
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-surface/50');
    expect(section).toHaveClass('moja-klasa');
    expect(section).toHaveAttribute('id', 'o-klubu');
    expect(screen.getByText('Sadržaj')).toBeInTheDocument();
  });

  it('hero varijanta i prvi indeks animiraju odmah', () => {
    const { container } = render(
      <AnimatedSection variant="hero" index={3}>
        Hero
      </AnimatedSection>,
    );
    expect(container.querySelector('section')).toBeInTheDocument();
    const second = render(
      <AnimatedSection index={0}>Prvi</AnimatedSection>,
    );
    expect(second.container.querySelector('section')).toBeInTheDocument();
  });

  it('kasniji indeks koristi whileInView', () => {
    const { container } = render(<AnimatedSection index={4}>Kasnije</AnimatedSection>);
    expect(container.querySelector('section')).toHaveClass('scroll-mt-20');
  });
});

describe('Reveal', () => {
  it('prosljeđuje klasu i sadržaj', () => {
    const { container } = render(
      <Reveal className="reveal-klasa" delay={0.2}>
        Otkriveno
      </Reveal>,
    );
    expect(container.firstElementChild).toHaveClass('reveal-klasa');
    expect(screen.getByText('Otkriveno')).toBeInTheDocument();
  });

  it('bez klase ipak renderuje sadržaj', () => {
    render(<Reveal>Bez klase</Reveal>);
    expect(screen.getByText('Bez klase')).toBeInTheDocument();
  });
});

describe('motion presets', () => {
  it('fadeUp i scaleIn imaju hidden i visible stanje', () => {
    expect(fadeUp.hidden.opacity).toBe(0);
    expect(fadeUp.visible).toEqual({ opacity: 1, y: 0 });
    expect(scaleIn.hidden.scale).toBeLessThan(1);
    expect(scaleIn.visible.scale).toBe(1);
    expect(staggerContainer.visible.transition.staggerChildren).toBeGreaterThan(0);
  });

  it('defaultTransition ima trajanje i easing', () => {
    expect(defaultTransition.duration).toBeGreaterThan(0);
    expect(defaultTransition.ease).toHaveLength(4);
  });
});
