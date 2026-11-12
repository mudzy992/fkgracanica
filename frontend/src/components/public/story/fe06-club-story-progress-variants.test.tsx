import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ClubStoryProgress } from './ClubStoryProgress';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

const events = [
  { id: 'e1', year: 1922, title: 'Osnivanje' },
  { id: 'e2', year: 1974, title: 'Titula' },
] as never;

describe('ClubStoryProgress — varijante reduce true (3 grane)', () => {
  it('reduce true koristi auto ponašanje (instant ? auto)', async () => {
    const chapter = document.createElement('div');
    chapter.id = 'story-chapter-e1';
    chapter.scrollIntoView = vi.fn();
    document.body.appendChild(chapter);
    const onSelect = vi.fn();
    render(<ClubStoryProgress events={events} activeId="e2" onSelect={onSelect} />);
    const btn = document.body.querySelectorAll('button')[0] as HTMLButtonElement;
    await userEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('e1');
    expect(chapter.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    chapter.remove();
  });

  it('reduce true skriva motion initial/exit (false/undefined)', () => {
    const { container } = render(<ClubStoryProgress events={events} activeId="e1" onSelect={vi.fn()} />);
    // still renders navigations, year visible
    expect(container.querySelectorAll('nav')).toHaveLength(2);
  });
});
