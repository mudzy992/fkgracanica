import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const state = vi.hoisted(() => ({
  match: null as unknown,
  rounds: [] as unknown[],
  isDragging: false,
}));

vi.mock('../hooks', () => ({
  useMatch: () => ({ data: state.match }),
  useMatches: () => ({ data: [], isLoading: false }),
}));

vi.mock('../hooks/use-match-highlights', () => ({
  useCreateMatchHighlight: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteMatchHighlight: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-rounds', () => ({
  useRounds: () => ({ data: state.rounds, isLoading: false }),
  useDeleteRound: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: async () => true, dialog: null }),
}));

vi.mock('../hooks/use-competition-admin', () => ({
  useCreateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-season-admin', () => ({
  useCreateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@dnd-kit/sortable', async () => {
  const actual: Record<string, unknown> = await vi.importActual('@dnd-kit/sortable');
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    sortableKeyboardCoordinates: vi.fn(),
    verticalListSortingStrategy: {},
    useSortable: () => ({
      attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, transition: null, isDragging: state.isDragging,
    }),
  };
});
vi.mock('@dnd-kit/core', async () => {
  const actual: Record<string, unknown> = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    closestCenter: vi.fn(),
    KeyboardSensor: vi.fn(),
    PointerSensor: vi.fn(),
    useSensor: () => ({}),
    useSensors: () => [],
  };
});

vi.mock('../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => <div><h2>{title}</h2>{children}</div>,
}));
vi.mock('../components/ui/switch', () => ({
  Switch: () => <button>switch</button>,
}));
vi.mock('../pages/admin/competition-hub/RoundFormSheet', () => ({
  RoundFormSheet: () => <div>round-form</div>,
}));
vi.mock('../pages/admin/competition-hub/RoundCascadeDeleteDialog', () => ({
  RoundCascadeDeleteDialog: () => <div>round-cascade</div>,
}));

import { CommentatorLiveHero } from '../pages/admin/homes/CommentatorLiveHero';
import { HeroSectionForm } from '../pages/admin/cms/forms/HeroSectionForm';
import { MatchHighlightsEditor } from '../pages/admin/competition-hub/MatchHighlightsEditor';
import { SeasonRoundsPanel } from '../pages/admin/competition-hub/SeasonRoundsPanel';
import { CmsMenuSortableList } from '../pages/admin/cms/CmsMenuSortableList';
import { CompetitionsAdminFormSheet } from '../pages/admin/CompetitionsAdminFormSheet';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={qc}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>
);

describe('fe06-batch69h preostalih 20 grana dio 1', () => {
  beforeEach(() => {
    state.match = null;
    state.rounds = [];
    state.isDragging = false;
  });

  it('CommentatorLiveHero live false pokriva : undefined', () => {
    render(wrap(<CommentatorLiveHero match={{ status: 'SCHEDULED', homeClub: { name: 'A' }, awayClub: { name: 'B' }, homeScore: 0, awayScore: 0 } as never} />));
    expect(document.body.textContent).toBeTruthy();
  });

  it('HeroSectionForm hero.buttons ?? [] pokriva []', () => {
    const onChange = vi.fn();
    render(wrap(<HeroSectionForm config={{ buttons: undefined }} onChange={onChange} />));
    expect(screen.getByText('+ Dugme')).toBeInTheDocument();
  });

  it('MatchHighlightsEditor match?.highlights ?? [] pokriva []', () => {
    state.match = { id: 'm1' } as never;
    render(wrap(<MatchHighlightsEditor matchId="m1" />));
    expect(screen.getByText('match.highlights')).toBeInTheDocument();
  });

  it('SeasonRoundsPanel round._count?.matches ?? 0 pokriva 0', () => {
    state.rounds = [{ id: 'r1', name: 'Kolo 1' } as never];
    render(wrap(<SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage={false} />));
    expect(screen.getByText('Kolo 1')).toBeInTheDocument();
  });

  it('CmsMenuSortableList isDragging && shadow-md pokriva true', () => {
    state.isDragging = true;
    render(wrap(<CmsMenuSortableList items={[{ id: '1', label: 'A', path: '/a', enabled: true } as never]} pages={[]} onChange={vi.fn()} />));
    expect(document.body.innerHTML).toContain('shadow-md');
  });

  it('CompetitionsAdminFormSheet mode null pokriva else-if false', () => {
    render(wrap(<CompetitionsAdminFormSheet open onOpenChange={vi.fn()} mode={null} editCompetition={null} editSeason={null} />));
    expect(screen.getByText('admin.competitionForm.newSeason')).toBeInTheDocument();
  });
});
