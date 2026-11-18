import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompetitionsAdminFormSheet } from './CompetitionsAdminFormSheet';

const state = vi.hoisted(() => ({
  createComp: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateComp: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  createSeason: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  updateSeason: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, opts?: Record<string, unknown>) => (opts?.defaultValue as string) ?? k }) }));
vi.mock('../../hooks/use-competition-admin', () => ({
  useCreateCompetition: () => state.createComp,
  useUpdateCompetition: () => state.updateComp,
}));
vi.mock('../../hooks/use-season-admin', () => ({
  useCreateSeason: () => state.createSeason,
  useUpdateSeason: () => state.updateSeason,
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ title, children }: { title: string; children: React.ReactNode }) => <div><h2>{title}</h2>{children}</div>,
}));
vi.mock('../../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => (
    <button role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)}>switch</button>
  ),
}));

beforeEach(() => {
  state.createComp = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateComp = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.createSeason = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.updateSeason = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
});

function renderSheet(props: Partial<Parameters<typeof CompetitionsAdminFormSheet>[0]> = {}) {
  return render(
    <CompetitionsAdminFormSheet open onOpenChange={state.onOpenChange} mode="season" editCompetition={null} editSeason={null} {...props} />,
  );
}

describe('B02 form — validacije i disabled', () => {
  it('whitespace name disabled (trim)', async () => {
    renderSheet({ mode: 'competition', editCompetition: null });
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('admin.competitionForm.nameRequired');
    await user.type(input, '   ');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
    await user.clear(input);
    await user.type(input, 'Kup');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).not.toBeDisabled();
  });

  it('yearStart > yearEnd pokazuje alert i disableuje dugme', async () => {
    renderSheet({ mode: 'season' });
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), '2026/27');
    await user.clear(screen.getByPlaceholderText('admin.competitionForm.yearStart'));
    await user.type(screen.getByPlaceholderText('admin.competitionForm.yearStart'), '2027');
    await user.clear(screen.getByPlaceholderText('admin.competitionForm.yearEnd'));
    await user.type(screen.getByPlaceholderText('admin.competitionForm.yearEnd'), '2026');
    expect(screen.getByRole('alert')).toHaveTextContent('Početna godina');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
    // ispravi godine -> alert nestaje i dugme enabled
    await user.clear(screen.getByPlaceholderText('admin.competitionForm.yearStart'));
    await user.type(screen.getByPlaceholderText('admin.competitionForm.yearStart'), '2026');
    expect(screen.queryByText('Početna godina')).toBeNull();
    expect(screen.getByRole('button', { name: 'Kreiraj' })).not.toBeDisabled();
  });

  it('update pending disableuje dugme i za season i za competition', () => {
    state.updateComp = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderSheet({ mode: 'competition', editCompetition: { id: 'c1', name: 'Old', slug: 'old' } as never });
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });

  it('createSeason pending disableuje', () => {
    state.createSeason = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderSheet({ mode: 'season' });
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
  });

  it('updateSeason pending disableuje', () => {
    state.updateSeason = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderSheet({ mode: 'season', editSeason: { id: 's1', name: '2025/26', yearStart: 2025, yearEnd: 2026 } as never });
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });

  it('error ima role=alert', async () => {
    state.createComp = { mutateAsync: vi.fn(async () => { throw new Error('Naziv postoji'); }), isPending: false };
    renderSheet({ mode: 'competition' });
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('admin.competitionForm.nameRequired'), 'Kup');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Naziv postoji');
  });
});
