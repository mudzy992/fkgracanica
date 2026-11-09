import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../hooks/use-club-hub', () => ({
  useClubSquad: vi.fn(),
  useUpdateClubFormation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAssignClubSquad: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../../../hooks', () => ({ usePlayers: () => ({ data: [] }) }));
vi.mock('../../../../components/ui/skeleton', () => ({ Skeleton: () => <div>Skeleton</div> }));
vi.mock('../../../../components/admin/formation/FormationEditablePitch', () => ({ ResponsiveFormationEditablePitch: () => <div>Pitch</div> }));
vi.mock('../../../../components/admin/formation/FormationInputs', () => ({ FormationInputs: () => <div>Inputs</div> }));
vi.mock('../../../../components/admin/formation/FormationPlayerPool', () => ({ FormationPlayerPool: () => <div>Pool</div> }));
vi.mock('../../../../components/admin/formation/FormationSlotPanel', () => ({ FormationSlotPanel: () => <div>SlotPanel</div> }));
vi.mock('../../../../components/admin/formation/BenchDropRow', () => ({ BenchDropRow: () => <div>BenchRow</div> }));
vi.mock('@dnd-kit/core', () => ({ DndContext: ({ children }: any) => <div>{children}</div>, DragOverlay: ({ children }: any) => <div>{children}</div>, PointerSensor: vi.fn(), useSensor: vi.fn(), useSensors: vi.fn(() => []) }));

import { useClubSquad } from '../../../../hooks/use-club-hub';
import { ClubFormationTab } from './ClubFormationTab';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}
describe('fe06 ClubFormationTab branch54', () => {
  it('isLoading || !data → Skeleton', () => {
    (useClubSquad as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    render(wrap(<ClubFormationTab clubId="c1" />));
    expect(screen.getByText('Skeleton')).toBeInTheDocument();
  });
  it('data with slots → bench ?? [] fallback', () => {
    (useClubSquad as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { formation: { def: 4, mid: 3, fwd: 3 }, slots: [] }, isLoading: false });
    render(wrap(<ClubFormationTab clubId="c1" />));
    expect(screen.getByText('Inputs')).toBeInTheDocument();
  });
  it('activeSlot null → pickPosition branch', () => {
    (useClubSquad as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: { formation: { def: 4, mid: 3, fwd: 3 }, slots: [] }, isLoading: false });
    render(wrap(<ClubFormationTab clubId="c1" />));
    expect(screen.getByText('admin.formation.pickPosition')).toBeInTheDocument();
  });
});
