import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HeroSection } from './HeroSection';

const mediaState = vi.hoisted(() => ({ calls: [] as string[], mode: 'both' as 'both' | 'thumbOnly' | 'none' }));

vi.mock('../../../lib/media', () => ({
  mediaUrl: (path: string | undefined, variant: string) => {
    mediaState.calls.push(`${variant}:${path}`);
    if (mediaState.mode === 'none') return undefined;
    if (mediaState.mode === 'thumbOnly' && variant === 'medium') return undefined;
    if (!path) return undefined;
    return `${variant}:${path}`;
  },
}));
vi.mock('../../../lib/motion/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../frames/DeviceCluster', () => ({ DeviceCluster: () => <div data-testid="cluster" /> }));
vi.mock('../fx/HeroBackdrop', () => ({ HeroBackdrop: () => <div /> }));

const club = (over: Record<string, unknown> = {}) => ({
  name: 'FK Gračanica',
  crestUrl: 'crest.png',
  tagline: 'Naša priča',
  launchNote: 'Uskoro',
  ...over,
});

describe('HeroSection — grane (batch 35)', () => {
  it('sa grbom prikazuje sliku i oba teksta', () => {
    mediaState.mode = 'both';
    render(<HeroSection club={club() as never} percent={42} />);
    expect(document.querySelector('img')).not.toBeNull();
    expect(screen.getByText('Naša priča')).toBeInTheDocument();
    expect(screen.getByText('Uskoro')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('bez grba ne prikazuje sliku (medium i thumb vraćaju undefined)', () => {
    mediaState.mode = 'none';
    const { container } = render(<HeroSection club={club({ crestUrl: null }) as never} percent={10} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('kada medium fali koristi thumb kao fallback', () => {
    mediaState.mode = 'thumbOnly';
    render(<HeroSection club={club() as never} percent={50} />);
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('thumb:crest.png');
  });

  it('bez tagline i launchNote ne prikazuje te elemente', () => {
    mediaState.mode = 'both';
    render(<HeroSection club={club({ tagline: null, launchNote: null }) as never} percent={0} />);
    expect(screen.queryByText('Naša priča')).toBeNull();
    expect(screen.queryByText('Uskoro')).toBeNull();
  });
});
