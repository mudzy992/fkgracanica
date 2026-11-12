import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaAssetsTable } from '../MediaAssetsTable';

vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminDataTable: ({ rows, empty, columns, rowClassName }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    empty?: string;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
    rowClassName?: (row: Record<string, unknown> & { id: string }) => string | undefined;
  }) =>
    rows.length === 0 ? (
      <p>{empty}</p>
    ) : (
      <div>
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${row.id}`} className={rowClassName?.(row)}>
            {columns.map((column) => (
              <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
            ))}
          </div>
        ))}
      </div>
    ),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const asset = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  filename: `slika-${id}.jpg`,
  originalPath: `media/original/${id}.jpg`,
  thumbPath: `media/thumb/${id}.jpg`,
  size: 2048,
  ...over,
});

const noop = () => {};

const tableProps = (over: Record<string, unknown> = {}) => ({
  assets: [asset('a1'), asset('a2')] as never,
  empty: 'Nema fajlova',
  copied: null as string | null,
  selectionMode: false,
  isSelected: () => false,
  onToggleSelect: vi.fn(),
  onCopy: vi.fn(),
  onReplace: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  ...over,
});

describe('MediaAssetsTable', () => {
  it('bez fajlova prikazuje prazno stanje', () => {
    render(<MediaAssetsTable {...tableProps({ assets: [] })} />);
    expect(screen.getByText('Nema fajlova')).toBeTruthy();
  });

  it('prikazuje naziv i veličinu', () => {
    render(<MediaAssetsTable {...tableProps()} />);
    const row = screen.getByTestId('row-a1');
    expect(within(row).getByText('slika-a1.jpg')).toBeTruthy();
    expect(within(row).getByText('2 KB')).toBeTruthy();
  });

  it('dugmad akcija: uredi, URL, zamijeni, obriši', async () => {
    const onEdit = vi.fn();
    const onReplace = vi.fn();
    const onDelete = vi.fn();
    const onCopy = vi.fn();
    render(<MediaAssetsTable {...tableProps({ onEdit, onReplace, onDelete, onCopy })} />);
    const row = screen.getByTestId('row-a1');
    await userEvent.click(within(row).getByRole('button', { name: 'Uredi' }));
    await userEvent.click(within(row).getByRole('button', { name: /URL/ }));
    await userEvent.click(within(row).getByRole('button', { name: 'Zamijeni' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Obriši' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
    expect(onCopy).toHaveBeenCalledWith('media/original/a1.jpg');
    expect(onReplace).toHaveBeenCalledWith('a1');
    expect(onDelete).toHaveBeenCalledWith('a1', 'slika-a1.jpg');
  });

  it('kopirani fajl piše Kopirano umjesto URL', () => {
    render(<MediaAssetsTable {...tableProps({ copied: 'media/original/a1.jpg' })} />);
    expect(within(screen.getByTestId('row-a1')).getByRole('button', { name: 'Kopirano' })).toBeTruthy();
    expect(within(screen.getByTestId('row-a2')).getByRole('button', { name: /URL/ })).toBeTruthy();
  });

  it('bez opcionih akcija prikazuje samo URL', () => {
    render(
      <MediaAssetsTable
        {...tableProps({ onEdit: undefined, onReplace: undefined, onDelete: undefined })}
      />,
    );
    const row = screen.getByTestId('row-a1');
    expect(within(row).queryByRole('button', { name: 'Uredi' })).toBeNull();
    expect(within(row).queryByRole('button', { name: 'Zamijeni' })).toBeNull();
    expect(within(row).queryByRole('button', { name: 'Obriši' })).toBeNull();
    expect(within(row).getByRole('button', { name: /URL/ })).toBeTruthy();
  });

  it('u režimu odabira kolona akcija nestaje, a odabir radi', async () => {
    const onToggleSelect = vi.fn();
    render(
      <MediaAssetsTable
        {...tableProps({ selectionMode: true, onToggleSelect, isSelected: (id: string) => id === 'a2' })}
      />,
    );
    const row = screen.getByTestId('row-a2');
    expect(within(row).queryByRole('button', { name: 'Uredi' })).toBeNull();
    await userEvent.click(within(row).getByRole('button', { name: 'Poništi odabir' }));
    expect(onToggleSelect).toHaveBeenCalledWith('a2');
    expect(
      within(screen.getByTestId('row-a1')).getByRole('button', { name: 'Odaberi' }),
    ).toBeTruthy();
  });

  it('tabela je sakrivena na malim ekranima', () => {
    const { container } = render(<MediaAssetsTable {...tableProps()} />);
    expect(container.firstElementChild?.className).toContain('hidden');
    expect(container.firstElementChild?.className).toContain('lg:block');
  });

  void noop;
});

describe('MediaAssetsTable — označeni red', () => {
  it('odabrani red dobija istaknutu klasu', () => {
    render(<MediaAssetsTable {...tableProps({ selectionMode: true, onToggleSelect: noop, isSelected: (id: string) => id === 'a2' })} />);
    expect(screen.getByTestId('row-a2').className).toBe('bg-primary/5');
    expect(screen.getByTestId('row-a1').className).toBe('');
  });
});
