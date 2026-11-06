import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubsCreateSheet } from './ClubsCreateSheet';

vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, actions, children }: {
    title: string; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isError && (
        <div>
          <p>greška-učitavanja</p>
          <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>
        </div>
      )}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  ),
  AdminDataTable: ({ rows, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) => (
    <div>
      {rows.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((column) => (
            <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const state = vi.hoisted(() => ({
  clubs: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  remove: { mutateAsync: vi.fn(async () => ({})) },
  create: { mutateAsync: vi.fn(async () => ({ id: 'c-new' })), isPending: false },
  navigate: vi.fn(),
  confirm: vi.fn(async () => true),
  permissions: ['clubs.manage', 'gallery.manage'] as string[],
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../../hooks/use-club-hub', () => ({ useClubsWithCounts: () => state.clubs }));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useDeleteClub: () => state.remove,
  useCreateClub: () => state.create,
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: React.ReactNode }) =>
    open ? <section aria-label={title}>{children}</section> : null,
}));
vi.mock('../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <button aria-label={label} onClick={() => onChange('media/crest.png')}>
      vrijednost:{value}
    </button>
  ),
}));

describe('ClubsCreateSheet', () => {
  beforeEach(() => {
    state.create = { mutateAsync: vi.fn(async () => ({ id: 'c-new' })), isPending: false };
  });

  const renderSheet = (onCreated = vi.fn(), onOpenChange = vi.fn()) =>
    render(<ClubsCreateSheet open onOpenChange={onOpenChange} onCreated={onCreated} />);

  it('zatvoren sheet ne prikazuje formu', () => {
    render(<ClubsCreateSheet open={false} onOpenChange={() => {}} onCreated={() => {}} />);
    expect(screen.queryByLabelText('admin.clubForm.create')).toBeNull();
  });

  it('dugme je onemogućeno dok nema naziva', async () => {
    renderSheet();
    const button = screen.getByRole('button', { name: 'Kreiraj i otvori hub' });
    expect(button).toHaveProperty('disabled', true);
    await userEvent.type(screen.getByPlaceholderText('admin.clubForm.name'), 'FK Test');
    expect(button).toHaveProperty('disabled', false);
  });

  it('kreira klub sa gradom i grbom, zatvara sheet i otvara hub', async () => {
    const onCreated = vi.fn();
    const onOpenChange = vi.fn();
    renderSheet(onCreated, onOpenChange);
    await userEvent.type(screen.getByPlaceholderText('admin.clubForm.name'), 'FK Test');
    await userEvent.type(screen.getByPlaceholderText('admin.club.city'), 'Sarajevo');
    await userEvent.click(screen.getByRole('button', { name: 'admin.club.crest' }));
    await userEvent.click(screen.getByRole('button', { name: 'Kreiraj i otvori hub' }));

    expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'FK Test',
      city: 'Sarajevo',
      crestPath: 'media/crest.png',
      isOwnClub: false,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onCreated).toHaveBeenCalledWith('c-new');
  });

  it('prazni grad i grb se ne šalju', async () => {
    renderSheet();
    await userEvent.type(screen.getByPlaceholderText('admin.clubForm.name'), 'FK Test');
    await userEvent.click(screen.getByRole('button', { name: 'Kreiraj i otvori hub' }));
    expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'FK Test',
      city: undefined,
      crestPath: undefined,
      isOwnClub: false,
    });
  });

  it('nakon kreiranja polja su ponovo prazna', async () => {
    const { rerender } = renderSheet();
    await userEvent.type(screen.getByPlaceholderText('admin.clubForm.name'), 'FK Test');
    await userEvent.click(screen.getByRole('button', { name: 'Kreiraj i otvori hub' }));
    rerender(<ClubsCreateSheet open onOpenChange={() => {}} onCreated={() => {}} />);
    expect((screen.getByPlaceholderText('admin.clubForm.name') as HTMLInputElement).value).toBe('');
  });

  it('tokom kreiranja dugme je onemogućeno', async () => {
    state.create = { mutateAsync: vi.fn(async () => ({ id: 'x' })), isPending: true };
    renderSheet();
    await userEvent.type(screen.getByPlaceholderText('admin.clubForm.name'), 'FK Test');
    expect(screen.getByRole('button', { name: 'Kreiraj i otvori hub' })).toHaveProperty('disabled', true);
  });
});
