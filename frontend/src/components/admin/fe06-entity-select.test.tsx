import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntitySelect } from './EntitySelect';

const state = vi.hoisted(() => ({
  response: undefined as unknown,
  loading: false,
  get: vi.fn(),
  queries: [] as Array<Record<string, unknown>>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/api', () => ({ api: { get: state.get } }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: Record<string, unknown>) => {
    state.queries.push(options);
    return { data: state.response, isLoading: state.loading };
  },
}));

/** Generička komponenta se u testu koristi kao obična funkcija sa proizvoljnim propsima. */
const StaticSelect = EntitySelect as unknown as (props: Record<string, unknown>) => React.ReactElement;
const AsyncSelect = EntitySelect as unknown as (props: Record<string, unknown>) => React.ReactElement;

const staticProps = (over: Record<string, unknown> = {}) => ({
  options: [
    { id: 'a', label: 'Prva' },
    { id: 'b', label: 'Druga' },
  ],
  value: '',
  onChange: vi.fn(),
  ...over,
});

const asyncProps = (over: Record<string, unknown> = {}) => ({
  endpoint: '/clubs',
  labelKey: 'name',
  valueKey: 'id',
  value: '',
  onChange: vi.fn(),
  ...over,
});

beforeEach(() => {
  state.response = undefined;
  state.loading = false;
  state.get.mockReset();
  state.get.mockResolvedValue({ data: [] });
  state.queries = [];
});

describe('EntitySelect — statične opcije', () => {
  it('prikazuje labelu, placeholder i opcije', () => {
    render(<StaticSelect {...staticProps({ label: 'Klub' })} />);
    expect(screen.getByText('Klub')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'admin.common.select' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Prva' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Druga' })).toBeInTheDocument();
  });

  it('bez labele nema naslova i koristi dati placeholder', () => {
    render(<StaticSelect {...staticProps({ placeholder: 'Izaberi…' })} />);
    expect(screen.queryByText('Klub')).toBeNull();
    expect(screen.getByRole('option', { name: 'Izaberi…' })).toBeInTheDocument();
  });

  it('izbor opcije zove onChange sa id-em', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StaticSelect {...staticProps({ onChange })} />);
    await user.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('prikazuje izabranu vrijednost', () => {
    render(<StaticSelect {...staticProps({ value: 'a' })} />);
    expect(screen.getByRole('combobox')).toHaveValue('a');
  });
});

describe('EntitySelect — asinhroni izvor', () => {
  it('dok traje učitavanje prikazuje poruku', () => {
    state.loading = true;
    render(<AsyncSelect {...asyncProps()} />);
    expect(screen.getByText('admin.common.loading')).toBeInTheDocument();
  });

  it('traži podatke sa endpointom i parametrima', () => {
    render(<AsyncSelect {...asyncProps({ params: { seasonId: 's1' } })} />);
    expect(state.queries[0]).toMatchObject({
      queryKey: ['entity-select', '/clubs', { seasonId: 's1' }],
    });
  });

  it('prazan izvor prikazuje placeholder tekst', () => {
    state.response = [];
    render(<AsyncSelect {...asyncProps({ placeholder: 'Nema klubova' })} />);
    expect(screen.getByText('Nema klubova')).toBeInTheDocument();
  });

  it('prikazuje stavke iz omotača data i formatLabel', () => {
    state.response = { data: [{ id: 'c1', name: 'FK Gračanica' }, { id: 'c2', name: 'NK Zenica' }] };
    render(
      <AsyncSelect
        {...asyncProps({ formatLabel: (item: { name: string }) => `klub:${item.name}` })}
      />,
    );
    expect(screen.getByRole('button', { name: 'klub:FK Gračanica' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'klub:NK Zenica' })).toBeInTheDocument();
  });

  it('bez formatLabel koristi labelKey iz stavke', () => {
    state.response = [{ id: 'c1', name: 'FK Gračanica' }];
    render(<AsyncSelect {...asyncProps()} />);
    expect(screen.getByRole('button', { name: 'FK Gračanica' })).toBeInTheDocument();
  });

  it('jednostruki izbor zamjenjuje vrijednost', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    state.response = [{ id: 'c1', name: 'A' }, { id: 'c2', name: 'B' }];
    render(<AsyncSelect {...asyncProps({ onChange, value: 'c1' })} />);
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('c2');
  });

  it('višestruki izbor dodaje i uklanja id, uz aktivno stanje', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    state.response = [{ id: 'c1', name: 'A' }, { id: 'c2', name: 'B' }];
    const { rerender } = render(
      <AsyncSelect {...asyncProps({ multiple: true, onChange, value: ['c1'] })} />,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'B' })).not.toHaveClass('bg-primary');
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenLastCalledWith(['c1', 'c2']);
    rerender(<AsyncSelect {...asyncProps({ multiple: true, onChange, value: ['c1', 'c2'] })} />);
    await user.click(screen.getByRole('button', { name: 'A' }));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(['c2']));
  });

  it('višestruki izbor sa string vrijednošću kreće od prazne liste', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    state.response = [{ id: 'c9', name: 'Solo' }];
    render(<AsyncSelect {...asyncProps({ multiple: true, onChange, value: 'c9' })} />);
    expect(screen.getByRole('button', { name: 'Solo' })).not.toHaveClass('bg-primary');
    await user.click(screen.getByRole('button', { name: 'Solo' }));
    expect(onChange).toHaveBeenCalledWith(['c9']);
  });
});
