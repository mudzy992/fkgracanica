import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubBasicTab } from './ClubBasicTab';
import type { Club } from '../../../../types';

const state = vi.hoisted(() => ({
  perms: [] as string[],
  update: vi.fn(),
  pending: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../hooks/use-competition-admin', () => ({
  useUpdateClub: () => ({ mutateAsync: state.update, isPending: state.pending }),
}));
vi.mock('../../../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../../../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../../../../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));
vi.mock('../../../../components/ui/switch', async () => ({
  Switch: (await import('../../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

const club = (over: Partial<Club> = {}): Club =>
  ({
    id: 'c1',
    name: 'FK Gračanica',
    shortName: 'FKG',
    city: 'Gračanica',
    description: 'Klub iz Gračanice',
    crestPath: 'mediji/grb.png',
    isOwnClub: true,
    ...over,
  }) as Club;

const input = (placeholder: string) => screen.getByPlaceholderText(placeholder) as HTMLInputElement;

beforeEach(() => {
  state.perms = ['clubs.manage'];
  state.update.mockReset();
  state.update.mockResolvedValue({});
  state.pending = false;
});

describe('ClubBasicTab — prikaz bez dozvole', () => {
  it('bez clubs.manage prikazuje samo čitanje bez forme', () => {
    state.perms = [];
    render(<ClubBasicTab club={club()} />);
    expect(screen.getByText('FKG')).toBeInTheDocument();
    expect(screen.getByText('Gračanica')).toBeInTheDocument();
    expect(screen.getByText('Klub iz Gračanice')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'actions.save' })).toBeNull();
  });

  it('prazna polja u prikazu čitanja daju crticu', () => {
    state.perms = [];
    render(<ClubBasicTab club={club({ shortName: null, city: null, description: null })} />);
    expect(screen.getAllByText('—')).toHaveLength(3);
  });
});

describe('ClubBasicTab — forma', () => {
  it('prefill-a vrijednosti kluba uključujući grb', () => {
    render(<ClubBasicTab club={club()} />);
    expect(input('admin.club.nameRequired')).toHaveValue('FK Gračanica');
    expect(input('admin.club.shortNameHint')).toHaveValue('FKG');
    expect(input('admin.club.city')).toHaveValue('Gračanica');
    expect(screen.getByPlaceholderText('admin.club.descriptionPlaceholder')).toHaveValue(
      'Klub iz Gračanice',
    );
    expect(screen.getByText('media:admin.club.crest:mediji/grb.png')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('fallback na logoPath kad nema crestPath i prazna polja bez vrijednosti', () => {
    render(<ClubBasicTab club={club({ crestPath: null, logoPath: 'mediji/logo.png' })} />);
    expect(screen.getByText('media:admin.club.crest:mediji/logo.png')).toBeInTheDocument();
    render(<ClubBasicTab club={club({ shortName: null, city: null, description: null })} />);
    expect(screen.getAllByPlaceholderText('admin.club.shortNameHint')[1]).toHaveValue('');
  });

  it('spremanje šalje očišćena polja i null za prazan kratki naziv', async () => {
    const user = userEvent.setup();
    render(<ClubBasicTab club={club()} />);
    await user.clear(input('admin.club.shortNameHint'));
    await user.type(input('admin.club.city'), ' novi grad ');
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    expect(state.update).toHaveBeenCalledWith({
      id: 'c1',
      name: 'FK Gračanica',
      shortName: null,
      city: 'Gračanica novi grad ',
      description: 'Klub iz Gračanice',
      crestPath: 'mediji/grb.png',
      isOwnClub: false,
    });
  });

  it('izbor medija mijenja grb u zahtjevu', async () => {
    const user = userEvent.setup();
    render(<ClubBasicTab club={club()} />);
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    expect(screen.getByText('media:admin.club.crest:media/novo.jpg')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    expect(state.update.mock.calls[0][0]).toMatchObject({ crestPath: 'media/novo.jpg' });
  });

  it('prazan naziv i spremanje u toku onemogućavaju dugme', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ClubBasicTab club={club()} />);
    await user.clear(input('admin.club.nameRequired'));
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeDisabled();
    rerender(<ClubBasicTab club={club()} />);
    state.pending = true;
    rerender(<ClubBasicTab club={club()} />);
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeDisabled();
  });

  it('novi objekat kluba resetuje formu', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ClubBasicTab club={club()} />);
    await user.clear(input('admin.club.city'));
    await user.type(input('admin.club.city'), 'Tuzla');
    expect(input('admin.club.city')).toHaveValue('Tuzla');
    rerender(<ClubBasicTab club={club({ id: 'c2', city: 'Zenica', name: 'NK Zenica' })} />);
    await waitFor(() => expect(input('admin.club.city')).toHaveValue('Zenica'));
    expect(input('admin.club.nameRequired')).toHaveValue('NK Zenica');
  });
});

describe('ClubBasicTab — izmjena opisa', () => {
  it('unos u opis mijenja stanje forme', async () => {
    render(<ClubBasicTab club={club()} />);
    const description = screen.getByPlaceholderText('admin.club.descriptionPlaceholder');
    await userEvent.clear(description);
    await userEvent.type(description, 'Novi opis');
    expect(description).toHaveValue('Novi opis');
  });
});

describe('ClubBasicTab — fallback vrijednosti (batch 34)', () => {
  it('klub bez grba, logotipa i zastavice počinje prazan i sa isključenim prekidačem', () => {
    render(
      <ClubBasicTab
        club={club({ crestPath: null, logoPath: null, isOwnClub: undefined })}
      />,
    );
    expect(screen.getByText('media:admin.club.crest:-')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('novi objekat bez grba resetuje izbor medija na prazno', () => {
    const { rerender } = render(<ClubBasicTab club={club()} />);
    expect(screen.getByText('media:admin.club.crest:mediji/grb.png')).toBeInTheDocument();
    rerender(
      <ClubBasicTab
        club={club({ id: 'c3', crestPath: null, logoPath: null, isOwnClub: undefined })}
      />,
    );
    expect(screen.getByText('media:admin.club.crest:-')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('prazni grad, opis i grb šalju se kao undefined', async () => {
    const user = userEvent.setup();
    render(<ClubBasicTab club={club({ crestPath: null, logoPath: null })} />);
    await user.clear(input('admin.club.city'));
    await user.clear(input('admin.club.shortNameHint'));
    await user.clear(screen.getByPlaceholderText('admin.club.descriptionPlaceholder'));
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    expect(state.update).toHaveBeenCalledWith({
      id: 'c1',
      name: 'FK Gračanica',
      shortName: null,
      city: undefined,
      description: undefined,
      crestPath: undefined,
      isOwnClub: true,
    });
  });
});

