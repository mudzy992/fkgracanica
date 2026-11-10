import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

describe('ClubCrest branch59 club?.name ?? ""', () => {
  it('club with crest and undefined name → alt "" fallback', async () => {
    const { ClubCrest } = await import('./ClubCrest');
    const { container } = render(<MemoryRouter><ClubCrest club={{ crestPath: 'c.png', name: undefined } as any} /></MemoryRouter>);
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('');
  });
  it('club with crest and name → alt name', async () => {
    const { ClubCrest } = await import('./ClubCrest');
    const { container } = render(<MemoryRouter><ClubCrest club={{ crestPath: 'c.png', name: 'FKG' } as any} /></MemoryRouter>);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('FKG');
  });
  it('club undefined no crest → fallback FK div', async () => {
    const { ClubCrest } = await import('./ClubCrest');
    const { container } = render(<MemoryRouter><ClubCrest club={undefined as any} /></MemoryRouter>);
    expect(container.textContent).toContain('FK');
  });
});

describe('LiveCenterShell branch59 match.events ?? []', () => {
  it('events undefined → fallback []', async () => {
    const { LiveCenterShell } = await import('../../live/LiveCenterShell');
    const match = { id: 'm1', status: 'LIVE', homeClub: { name: 'H' }, awayClub: { name: 'A' }, homeScore: 0, awayScore: 0, events: undefined, minute: 10 } as any;
    const { container } = render(<MemoryRouter><LiveCenterShell match={match} clock={null} /></MemoryRouter>);
    expect(container.textContent).toContain('Još nema događaja');
  });
  it('events with items → shows events', async () => {
    const { LiveCenterShell } = await import('../../live/LiveCenterShell');
    const match = { id: 'm1', status: 'LIVE', homeClub: { name: 'H' }, awayClub: { name: 'A' }, homeScore: 1, awayScore: 0, events: [{ id: 'e1', type: 'GOAL', minute: 5 }], minute: 10 } as any;
    const { container } = render(<MemoryRouter><LiveCenterShell match={match} clock={null} /></MemoryRouter>);
    expect(container.textContent).not.toContain('Još nema događaja');
  });
});

describe('MediaFolderPicker branch59 _count?.assets ?? 0', () => {
  it('folder without _count → 0', async () => {
    const { MediaFolderPicker } = await import('../../admin/MediaFolderPicker');
    const folders = [{ id: '1', name: 'F', parentId: null, _count: undefined } as any];
    const { container } = render(<MemoryRouter><MediaFolderPicker folders={folders} selectedId={undefined} onSelect={vi.fn()} /></MemoryRouter>);
    expect(container.textContent).toContain('0');
  });
});
