import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketingSettingsTab } from './TicketingSettingsTab';

const state = vi.hoisted(() => ({
  config: undefined as unknown,
  isLoading: false,
  save: vi.fn(),
  saving: false,
  categories: [] as unknown[],
  background: {} as Record<string, unknown>,
  categoryChange: null as null | ((next: unknown[]) => void),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-ticketing-admin', () => ({
  useTicketingAdminConfig: () => ({ data: state.config, isLoading: state.isLoading }),
  useUpdateTicketingAdminConfig: () => ({ mutateAsync: state.save, isPending: state.saving }),
}));
vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));
vi.mock('./TicketingCategoriesEditor', () => ({
  TicketingCategoriesEditor: ({ categories, onChange }: {
    categories: unknown[]; onChange: (next: unknown[]) => void;
  }) => {
    state.categories = categories;
    state.categoryChange = onChange as (next: unknown[]) => void;
    return (
      <div>
        kategorije:{categories.length}
        <button onClick={() => onChange([...(categories as object[]), { code: 'VIP' }])}>dodaj-kategoriju</button>
      </div>
    );
  },
}));
vi.mock('./TicketingCardBackgroundField', () => ({
  TicketingCardBackgroundField: ({ value, onChange }: {
    value: string; onChange: (next: string) => void;
  }) => {
    state.background = { value };
    return (
      <div>
        pozadina:{value || '-'}
        <button onClick={() => onChange('mediji/karta.jpg')}>odaberi-pozadinu</button>
      </div>
    );
  },
}));

const config = (settings: Record<string, string> = {}) => ({
  settings,
  categories: [{ code: 'STANDARD', name: 'Standard' }],
});

const renderTab = () => render(<TicketingSettingsTab />);

const inputByLabel = (label: string) =>
  screen.getByText(label).parentElement?.querySelector('input') as HTMLInputElement;

beforeEach(() => {
  state.config = config({
    'ticketing.stadiumCapacity': '8000',
    'ticketing.memberDiscountPercent': '15',
    'ticketing.maxBoxOfficeTicketsPerUser': '2',
    'ticketing.seasonPassPrice': '120',
    'ticketing.seasonPassLabel': 'Sezona 25/26',
    'ticketing.boxOfficeEnabled': 'false',
    'ticketing.ticketCardBackground': 'mediji/stara.jpg',
  });
  state.isLoading = false;
  state.save.mockReset();
  state.save.mockResolvedValue({});
  state.saving = false;
  state.categories = [];
  state.background = {};
  state.categoryChange = null;
});

describe('TicketingSettingsTab — učitavanje', () => {
  it('dok traje učitavanje prikazuje poruku bez forme', () => {
    state.isLoading = true;
    renderTab();
    expect(screen.getByText('admin.common.loading')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'admin.ticketingForm.save' })).toBeNull();
  });

  it('bez konfiguracije koristi sigurne podrazumijevane vrijednosti', () => {
    state.config = undefined;
    renderTab();
    expect(inputByLabel('admin.ticketingForm.capacity')).toHaveValue('5000');
    expect(inputByLabel('admin.ticketingForm.memberDiscount')).toHaveValue('10');
    expect(inputByLabel('admin.ticketingForm.maxPerUser')).toHaveValue('4');
    expect(inputByLabel('admin.ticketingForm.seasonPrice')).toHaveValue('0');
    expect(inputByLabel('admin.ticketingForm.seasonLabel')).toHaveValue('Sezonska karta');
    expect(screen.getByText('kategorije:0')).toBeInTheDocument();
  });

  it('preuzima vrijednosti iz postavki i prekidač blagajne iz "false"', () => {
    renderTab();
    expect(inputByLabel('admin.ticketingForm.capacity')).toHaveValue('8000');
    expect(inputByLabel('admin.ticketingForm.memberDiscount')).toHaveValue('15');
    expect(inputByLabel('admin.ticketingForm.maxPerUser')).toHaveValue('2');
    expect(inputByLabel('admin.ticketingForm.seasonPrice')).toHaveValue('120');
    expect(inputByLabel('admin.ticketingForm.seasonLabel')).toHaveValue('Sezona 25/26');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('kategorije:1')).toBeInTheDocument();
    expect(screen.getByText('pozadina:mediji/stara.jpg')).toBeInTheDocument();
  });
});

describe('TicketingSettingsTab — čuvanje', () => {
  it('šalje sva polja, uključujući kategorije kao JSON', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'dodaj-kategoriju' }));
    await user.click(screen.getByRole('button', { name: 'odaberi-pozadinu' }));
    await user.click(screen.getByRole('button', { name: 'admin.ticketingForm.save' }));
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(state.save.mock.calls[0][0]).toEqual({
      'ticketing.stadiumCapacity': '8000',
      'ticketing.memberDiscountPercent': '15',
      'ticketing.maxBoxOfficeTicketsPerUser': '2',
      'ticketing.seasonPassPrice': '120',
      'ticketing.seasonPassLabel': 'Sezona 25/26',
      'ticketing.boxOfficeEnabled': 'true',
      'ticketing.ticketCardBackground': 'mediji/karta.jpg',
      'ticketing.categories': JSON.stringify([
        { code: 'STANDARD', name: 'Standard' },
        { code: 'VIP' },
      ]),
    });
  });

  it('izmjena brojeva u poljima ulazi u zahtjev kao stringovi', async () => {
    const user = userEvent.setup();
    renderTab();
    const capacity = inputByLabel('admin.ticketingForm.capacity');
    await user.clear(capacity);
    await user.type(capacity, '9500');
    await user.click(screen.getByRole('button', { name: 'admin.ticketingForm.save' }));
    expect(state.save.mock.calls[0][0]).toMatchObject({ 'ticketing.stadiumCapacity': '9500' });
  });

  it('izmjena popusta, limita, cijene i oznake sezone ulazi u zahtjev', async () => {
    const user = userEvent.setup();
    renderTab();
    const fields: Array<[string, string]> = [
      ['admin.ticketingForm.memberDiscount', '25'],
      ['admin.ticketingForm.maxPerUser', '6'],
      ['admin.ticketingForm.seasonPrice', '150'],
      ['admin.ticketingForm.seasonLabel', 'Sezona 26/27'],
    ];
    for (const [label, value] of fields) {
      const input = inputByLabel(label);
      await user.clear(input);
      await user.type(input, value);
    }
    await user.click(screen.getByRole('button', { name: 'admin.ticketingForm.save' }));
    expect(state.save.mock.calls[0][0]).toMatchObject({
      'ticketing.memberDiscountPercent': '25',
      'ticketing.maxBoxOfficeTicketsPerUser': '6',
      'ticketing.seasonPassPrice': '150',
      'ticketing.seasonPassLabel': 'Sezona 26/27',
    });
  });

  it('dok je spremanje u toku dugme je onemogućeno sa drugim tekstom', () => {
    state.saving = true;
    renderTab();
    expect(screen.getByRole('button', { name: 'admin.common.saving' })).toBeDisabled();
  });
});
