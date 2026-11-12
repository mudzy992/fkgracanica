import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HeroMobileCrest } from './HeroMobileCrest';

const state = vi.hoisted(() => ({
  settings: {} as Record<string, string | undefined>,
  reduce: false,
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => state.reduce };
});
vi.mock('../../../hooks', () => ({
  usePublicSettings: () => ({ data: state.settings }),
}));
vi.mock('../../../lib/media', () => ({
  mediaUrl: (url: string) => `media:${url}`,
}));

describe('HeroMobileCrest — varijante (3 grane)', () => {
  beforeEach(() => {
    state.settings = { 'club.crestUrl': 'crest.png', 'club.name': 'FK Test' };
    state.reduce = false;
  });

  it('bez crestUrl ne renderuje ništa', () => {
    state.settings = {};
    const { container } = render(<HeroMobileCrest />);
    expect(container.innerHTML).toBe('');
  });

  it('compact true daje manje dimenzije', () => {
    render(<HeroMobileCrest compact />);
    const img = screen.getByAltText('FK Test') as HTMLImageElement;
    expect(img.className).toContain('max-h-[55%]');
    expect(img.src).toContain('media:crest.png');
  });

  it('compact false daje veće dimenzije i koristi fallback ime', () => {
    state.settings = { 'club.crestUrl': 'crest2.png' }; // bez club.name
    render(<HeroMobileCrest compact={false} />);
    const img = screen.getByAltText('FK Gračanica') as HTMLImageElement;
    expect(img.className).toContain('max-h-[70%]');
  });

  it('reduce true daje false initial', () => {
    state.reduce = true;
    render(<HeroMobileCrest />);
    expect(screen.getByAltText('FK Test')).toBeInTheDocument();
  });
});
