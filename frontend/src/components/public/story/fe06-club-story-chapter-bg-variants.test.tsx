import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClubStoryChapterBg } from './ClubStoryChapterBg';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    useScroll: vi.fn(() => ({ scrollYProgress: { get: () => 0 } as never })),
    useTransform: vi.fn((_, __, v) => v as never),
  };
});
import { useReducedMotion } from 'framer-motion';

describe('ClubStoryChapterBg — varijante (2 grane)', () => {
  it('bez slike prikazuje gradient', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(<ClubStoryChapterBg imageUrl={undefined} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('sa slikom i reduce true koristi 0% parallax', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(<ClubStoryChapterBg imageUrl="https://example.com/a.jpg" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://example.com/a.jpg');
  });
});
