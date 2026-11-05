import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubStadiumTab } from './ClubStadiumTab';

const state = vi.hoisted(() => ({
  stadium: { data: undefined as unknown, isLoading: false },
  calls: [] as string[],
  save: vi.fn(),
  pending: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../hooks/use-club-hub', () => ({
  useClubStadium: (clubId: string) => {
    state.calls.push(clubId);
    return state.stadium;
  },
  useUpsertClubStadium: (clubId: string) => {
    state.calls.push(`upsert:${clubId}`);
    return { mutateAsync: state.save, isPending: state.pending };
  },
}));
vi.mock('../../../../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../../../../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));

const input = (placeholder: string) => screen.getByPlaceholderText(placeholder) as HTMLInputElement;

beforeEach(() => {
  state.stadium = {
    data: {
      name: 'Stadion Luke',
      address: 'Luke 1',
      city: 'Gračanica',
      capacity: 8000,
      description: 'Glavni stadion',
      imagePath: 'mediji/stadion.jpg',
    },
    isLoading: false,
  };
  state.calls = [];
  state.save.mockReset();
  state.save.mockResolvedValue({});
  state.pending = false;
});

describe('ClubStadiumTab — učitavanje', () => {
  it('dok stadion nije učitan prikazuje skeleton', () => {
    state.stadium = { data: undefined, isLoading: true };
    const { container } = render(<ClubStadiumTab clubId="c1" />);
    expect(container.querySelector('.h-48')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.stadium.save' })).toBeNull();
  });

  it('koristi klub iz propsa za oba hooka', () => {
    render(<ClubStadiumTab clubId="c1" />);
    expect([...new Set(state.calls)]).toEqual(['c1', 'upsert:c1']);
  });

  it('prefill-a sva polja i sliku stadiona', () => {
    render(<ClubStadiumTab clubId="c1" />);
    expect(input('admin.stadium.nameRequired')).toHaveValue('Stadion Luke');
    expect(input('admin.stadium.address')).toHaveValue('Luke 1');
    expect(input('admin.club.city')).toHaveValue('Gračanica');
    expect(input('admin.stadium.capacity')).toHaveValue(8000);
    expect(screen.getByPlaceholderText('admin.stadium.description')).toHaveValue('Glavni stadion');
    expect(screen.getByText('media:admin.stadium.image:mediji/stadion.jpg')).toBeInTheDocument();
  });

  it('bez podataka polja su prazna, uključujući kapacitet', () => {
    state.stadium = { data: undefined, isLoading: false };
    render(<ClubStadiumTab clubId="c1" />);
    expect(input('admin.stadium.nameRequired')).toHaveValue('');
    expect(input('admin.stadium.capacity')).toHaveValue(null);
    expect(screen.getByText('media:admin.stadium.image:-')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.stadium.save' })).toBeDisabled();
  });
});

describe('ClubStadiumTab — spremanje', () => {
  it('šalje popunjena polja i broj za kapacitet', async () => {
    const user = userEvent.setup();
    render(<ClubStadiumTab clubId="c1" />);
    await user.click(screen.getByRole('button', { name: 'admin.stadium.save' }));
    expect(state.save).toHaveBeenCalledWith({
      name: 'Stadion Luke',
      address: 'Luke 1',
      city: 'Gračanica',
      capacity: 8000,
      description: 'Glavni stadion',
      imagePath: 'mediji/stadion.jpg',
    });
  });

  it('prazan naziv se zamjenjuje sa "Stadion", ostala prazna polja su undefined', async () => {
    const user = userEvent.setup();
    state.stadium = { data: { name: '', capacity: null }, isLoading: false };
    render(<ClubStadiumTab clubId="c1" />);
    const name = input('admin.stadium.nameRequired');
    await user.type(name, 'Stadion podno');
    await user.clear(name);
    await user.type(name, 'Stadion podno');
    expect(screen.getByRole('button', { name: 'admin.stadium.save' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'admin.stadium.save' }));
    expect(state.save).toHaveBeenCalledWith({
      name: 'Stadion podno',
      address: undefined,
      city: undefined,
      capacity: undefined,
      description: undefined,
      imagePath: undefined,
    });
  });

  it('izmjena kapaciteta, grada i slike ide u zahtjev', async () => {
    const user = userEvent.setup();
    render(<ClubStadiumTab clubId="c1" />);
    const capacity = input('admin.stadium.capacity');
    await user.clear(capacity);
    await user.type(capacity, '9500');
    const city = input('admin.club.city');
    await user.clear(city);
    await user.type(city, 'Tuzla');
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    await user.click(screen.getByRole('button', { name: 'admin.stadium.save' }));
    expect(state.save).toHaveBeenCalledWith(
      expect.objectContaining({ capacity: 9500, city: 'Tuzla', imagePath: 'media/novo.jpg' }),
    );
  });

  it('spremanje u toku onemogućava dugme', () => {
    state.pending = true;
    render(<ClubStadiumTab clubId="c1" />);
    expect(screen.getByRole('button', { name: 'admin.stadium.save' })).toBeDisabled();
  });

  it('novi podaci resetuju formu', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ClubStadiumTab clubId="c1" />);
    const name = input('admin.stadium.nameRequired');
    await user.clear(name);
    await user.type(name, 'Privremeno');
    state.stadium = {
      data: { name: 'Stadion Podno', capacity: 1500, city: 'Visoko' },
      isLoading: false,
    };
    rerender(<ClubStadiumTab clubId="c1" />);
    await waitFor(() => expect(input('admin.stadium.nameRequired')).toHaveValue('Stadion Podno'));
    expect(input('admin.stadium.capacity')).toHaveValue(1500);
    expect(input('admin.stadium.address')).toHaveValue('');
  });
});
