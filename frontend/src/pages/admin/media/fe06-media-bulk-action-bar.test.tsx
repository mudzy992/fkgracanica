import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaBulkActionBar } from './MediaBulkActionBar';

const state = vi.hoisted(() => ({
  remove: vi.fn(),
  update: vi.fn(),
  cleared: 0,
  done: 0,
  confirmed: [] as number[],
  confirmResult: true,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-media-admin', () => ({
  useDeleteMedia: () => ({ mutateAsync: state.remove }),
  useUpdateMediaAsset: () => ({ mutateAsync: state.update }),
}));

const folders = [
  { id: 'f1', name: 'Utakmice' },
  { id: 'f2', name: 'Trening' },
];

const renderBar = (over: Record<string, unknown> = {}) =>
  render(
    <MediaBulkActionBar
      selectedIds={new Set(['a1', 'a2'])}
      folders={folders}
      onClear={() => { state.cleared += 1; }}
      onDone={() => { state.done += 1; }}
      onConfirmDelete={async (count) => {
        state.confirmed.push(count);
        return state.confirmResult;
      }}
      {...over}
    />,
  );

beforeEach(() => {
  state.remove.mockReset();
  state.remove.mockResolvedValue({});
  state.update.mockReset();
  state.update.mockResolvedValue({});
  state.cleared = 0;
  state.done = 0;
  state.confirmed = [];
  state.confirmResult = true;
});

describe('MediaBulkActionBar — prikaz', () => {
  it('bez selekcije se ne renderuje', () => {
    const { container } = renderBar({ selectedIds: new Set() });
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje broj odabranih i sve foldere', () => {
    renderBar();
    expect(screen.getByText('2 odabrano')).toBeInTheDocument();
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['admin.mediaBulk.moveTo', 'Utakmice', 'Trening']);
  });

  it('podnosi neočekivan oblik foldera bez pada', () => {
    renderBar({ folders: { data: [{ id: 'f9', name: 'Iz API-ja' }] } });
    expect(screen.getByRole('option', { name: 'Iz API-ja' })).toBeInTheDocument();
  });
});

describe('MediaBulkActionBar — premještanje', () => {
  it('Primijeni je onemogućen dok nije izabran folder', async () => {
    const user = userEvent.setup();
    renderBar();
    const apply = screen.getByRole('button', { name: 'Primijeni' });
    expect(apply).toBeDisabled();
    await user.selectOptions(screen.getByRole('combobox'), 'f2');
    expect(apply).toBeEnabled();
  });

  it('premješta svaki odabrani zapis pa javlja završetak', async () => {
    const user = userEvent.setup();
    renderBar();
    await user.selectOptions(screen.getByRole('combobox'), 'f1');
    await user.click(screen.getByRole('button', { name: 'Primijeni' }));
    await waitFor(() => expect(state.done).toBe(1));
    expect(state.update.mock.calls).toEqual([
      [{ id: 'a1', folderId: 'f1' }],
      [{ id: 'a2', folderId: 'f1' }],
    ]);
    expect(state.remove).not.toHaveBeenCalled();
  });
});

describe('MediaBulkActionBar — brisanje', () => {
  it('briše tek nakon potvrde i šalje tačan broj', async () => {
    const user = userEvent.setup();
    renderBar();
    await user.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.done).toBe(1));
    expect(state.confirmed).toEqual([2]);
    expect(state.remove.mock.calls).toEqual([['a1'], ['a2']]);
  });

  it('odbijena potvrda ne briše ništa', async () => {
    const user = userEvent.setup();
    state.confirmResult = false;
    renderBar();
    await user.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.confirmed).toEqual([2]));
    expect(state.remove).not.toHaveBeenCalled();
    expect(state.done).toBe(0);
  });
});

describe('MediaBulkActionBar — poništi i zauzetost', () => {
  it('Poništi zove onClear bez brisanja', async () => {
    const user = userEvent.setup();
    renderBar();
    await user.click(screen.getByRole('button', { name: 'Poništi' }));
    expect(state.cleared).toBe(1);
    expect(state.remove).not.toHaveBeenCalled();
    expect(state.update).not.toHaveBeenCalled();
  });

  it('tokom premještanja su sve kontrole onemogućene', async () => {
    const user = userEvent.setup();
    let resolveFirst: (value: unknown) => void = () => {};
    // samo prvi zapis visi; ostali koriste već postavljeni resolved mock
    state.update.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFirst = resolve; }),
    );
    renderBar();
    await user.selectOptions(screen.getByRole('combobox'), 'f1');
    await user.click(screen.getByRole('button', { name: 'Primijeni' }));
    await waitFor(() => expect(screen.getByRole('combobox')).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Primijeni' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Obriši' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Poništi' })).toBeDisabled();
    resolveFirst({});
    await waitFor(() => expect(state.done).toBe(1));
    expect(state.update).toHaveBeenCalledTimes(2);
  });
});
