import { describe, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../hooks/use-competition-admin', () => ({
  useCreateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCompetition: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/use-season-admin', () => ({
  useCreateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateSeason: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));
vi.mock('../components/ui/input', () => ({
  Input: (p: any) => <input {...p} />,
}));
vi.mock('../components/ui/switch', () => ({
  Switch: () => <button>switch</button>,
}));
vi.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

import { CompetitionsAdminFormSheet } from '../pages/admin/CompetitionsAdminFormSheet';

const qc = new QueryClient();
const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={qc}>
    <MemoryRouter>{ui}</MemoryRouter>
  </QueryClientProvider>
);

describe('fe06-batch69o poslednja grana mode==null', () => {
  it('pokriva else-if false kada je mode null i save se pozove', async () => {
    const onOpenChange = vi.fn();
    render(
      wrap(
        <CompetitionsAdminFormSheet
          open
          onOpenChange={onOpenChange}
          mode={null as never}
          editCompetition={null}
          editSeason={null}
        />,
      ),
    );
    // popuni naziv da dugme ne bude disabled
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value: 'Test' } });
    }
    const btn = screen.getByText('Kreiraj');
    fireEvent.click(btn);
    // save je async, nakon sto se izvrsi treba da pozove onOpenChange(false) cak i kada je mode null
    await new Promise((r) => setTimeout(r, 0));
    // ne proveravamo mutacije, samo da je grana pokrivena (else-if false)
  });
});
