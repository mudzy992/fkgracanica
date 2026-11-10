import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (orig) => {
  const a: any = await orig();
  return { ...a, useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../../hooks/use-competition-admin', () => ({ useCreateClub: () => ({ mutateAsync: vi.fn(() => Promise.resolve({ id: 'new1' })), isPending: false }) }));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, onOpenChange, title, children }: any) => (
    <div>
      <span>{title}</span>
      <button onClick={() => onOpenChange(false)}>close</button>
      <button onClick={() => onOpenChange(true)}>open</button>
      {open ? children : null}
    </div>
  ),
}));
vi.mock('../../components/admin/MediaPicker', () => ({ MediaPicker: () => null }));
vi.mock('../../hooks/use-live-admin', () => ({ useAddMatchComment: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../hooks/use-live-report', () => ({ useAddReportComment: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../lib/action-errors', () => ({ runAction: (p: any) => p }));

describe('batch61-a 4 grane', () => {
  it('AnalyticsTeamPanel form empty → else branch [3,0]', async () => {
    const { AnalyticsTeamPanel } = await import('./analytics/AnalyticsTeamPanel');
    const data: any = { played: 10, wins: 5, draws: 2, losses: 3, goalsFor: 12, goalsAgainst: 8, winPercent: 50, form: [], recent: [] };
    const { container } = render(<AnalyticsTeamPanel data={data} />);
    expect(container.textContent).toContain('—');
  });
  it('AnalyticsTeamPanel form with data + unknown X → fallback [5,0]', async () => {
    const { AnalyticsTeamPanel } = await import('./analytics/AnalyticsTeamPanel');
    const data: any = { played: 10, wins: 5, draws: 2, losses: 3, goalsFor: 12, goalsAgainst: 8, winPercent: 50, form: ['W', 'L', 'X'], recent: [{ id: '1', home: 'A', away: 'B', status: 'FINISHED', homeScore: 2, awayScore: 1, scheduledAt: new Date().toISOString() }] };
    const { container } = render(<AnalyticsTeamPanel data={data} />);
    expect(container.textContent).toContain('W');
  });
  it('ClubsCreateSheet close vs open [2,0]', async () => {
    const { ClubsCreateSheet } = await import('./club-hub/ClubsCreateSheet');
    const onCreated = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter><ClubsCreateSheet open={true} onOpenChange={onOpenChange} onCreated={onCreated} /></MemoryRouter>
      </QueryClientProvider>
    );
    fireEvent.click(getByText('close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    fireEvent.click(getByText('open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
  it('HeroSectionForm config without buttons → fallback [26,0]', async () => {
    const { HeroSectionForm } = await import('./cms/forms/HeroSectionForm');
    const { container } = render(<HeroSectionForm config={{ title: 'T', buttons: undefined } as any} onChange={vi.fn()} />);
    expect(container.textContent).toContain('Dugme');
    const { container: c2 } = render(<HeroSectionForm config={{ title: 'T2', buttons: [{ label: 'B', href: '/x' }] } as any} onChange={vi.fn()} />);
    expect(c2.innerHTML).toContain('B');
  });
  it('CommentatorCommentPanel liveComments fallback [44,0]', async () => {
    const { CommentatorCommentPanel } = await import('./commentator/CommentatorCommentPanel');
    const matchWithoutComments: any = { id: 'm1', status: 'LIVE', liveComments: undefined };
    const { container: c1 } = render(<MemoryRouter><CommentatorCommentPanel match={matchWithoutComments} /></MemoryRouter>);
    expect(c1.textContent).toContain('admin.commentPanel.empty');
    const matchWithComments: any = { id: 'm2', status: 'LIVE', liveComments: [{ id: 'c1', message: 'hi', minute: 5 }] };
    const { container: c2 } = render(<MemoryRouter><CommentatorCommentPanel match={matchWithComments} /></MemoryRouter>);
    expect(c2.textContent).toContain('hi');
  });
  it('CmsSectionEditDialog section null → else [3,0] + onOpenChange both', async () => {
    const { CmsSectionEditDialog } = await import('./cms/CmsSectionEditDialog');
    const onOpenChange = vi.fn();
    const { container, getByText } = render(<CmsSectionEditDialog section={null} open={true} draftConfig={{}} dirty={false} onOpenChange={onOpenChange} onChange={vi.fn()} onSave={vi.fn()} />);
    expect(container.textContent).toContain('Uredi sekciju');
    fireEvent.click(getByText('close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    fireEvent.click(getByText('open'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  it('CmsSectionEditDialog dirty confirm', async () => {
    const { CmsSectionEditDialog } = await import('./cms/CmsSectionEditDialog');
    const orig = window.confirm;
    window.confirm = vi.fn(() => false);
    const onOpenChange = vi.fn();
    const section: any = { id: 's1', widgetType: 'hero', config: {} };
    const { getByText } = render(<CmsSectionEditDialog section={section} open={true} draftConfig={{}} dirty={true} onOpenChange={onOpenChange} onChange={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(getByText('Odustani'));
    expect(window.confirm).toHaveBeenCalled();
    window.confirm = orig;
  });
});
