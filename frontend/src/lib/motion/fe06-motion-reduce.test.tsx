import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnimatedSection } from './AnimatedSection';
import { Reveal } from './Reveal';

vi.mock('framer-motion', () => ({
  useReducedMotion: () => true,
  motion: new Proxy({}, { get: () => () => null }),
}));

describe('motion komponente uz smanjeno kretanje', () => {
  it('AnimatedSection vraća statičnu sekciju sa id-jem', () => {
    render(<AnimatedSection id="o-klubu" variant="hero" index={3}>Sadržaj</AnimatedSection>);
    const section = screen.getByText('Sadržaj').closest('section');
    expect(section).toHaveAttribute('id', 'o-klubu');
    expect(section?.className).toContain('scroll-mt-20');
  });

  it('Reveal vraća običan div bez animacije', () => {
    render(<Reveal className="blok">Tekst</Reveal>);
    const div = screen.getByText('Tekst');
    expect(div.tagName).toBe('DIV');
    expect(div).toHaveClass('blok');
  });
});
