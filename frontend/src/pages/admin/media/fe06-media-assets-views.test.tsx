import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaAssetsGrid } from './MediaAssetsGrid';

vi.mock('../../../components/admin/AdminPageShell', () => ({
  AdminDataTable: ({ rows, empty, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    empty?: string;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) =>
    rows.length === 0 ? (
      <p>{empty}</p>
    ) : (
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

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const asset = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  filename: `slika-${id}.jpg`,
  originalPath: `media/original/${id}.jpg`,
  thumbPath: `media/thumb/${id}.jpg`,
  size: 2048,
  ...over,
});

const gridProps = (over: Record<string, unknown> = {}) => ({
  assets: [asset('a1'), asset('a2')] as never,
  empty: 'Nema fajlova',
  copied: null as string | null,
  selectionMode: false,
  isSelected: () => false,
  onToggleSelect: vi.fn(),
  onCopy: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  ...over,
});

describe('MediaAssetsGrid', () => {
  it('bez fajlova prikazuje prazno stanje', () => {
    render(<MediaAssetsGrid {...gridProps({ assets: [] })} />);
    expect(screen.getByText('Nema fajlova')).toBeTruthy();
  });

  it('prikazuje sličice, skraćen naziv i veličinu u KB', () => {
    render(<MediaAssetsGrid {...gridProps()} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('slika-a1.jpg')).toBeTruthy();
    expect(screen.getAllByText('2 KB')).toHaveLength(2);
  });

  it('dugačak naziv se skraćuje, a puni je u title atributu', () => {
    const long = 'veoma-dugačak-naziv-fajla-za-galeriju-2026.jpg';
    render(<MediaAssetsGrid {...gridProps({ assets: [asset('a1', { filename: long })] })} />);
    const label = screen.getByTitle(long);
    expect(label.textContent).toContain('…');
    expect(label.textContent!.endsWith('.jpg')).toBe(true);
    expect(label.textContent!.length).toBeLessThan(long.length);
  });

  it('naziv dozvoljene dužine se ne skraćuje', () => {
    render(<MediaAssetsGrid {...gridProps({ assets: [asset('a1', { filename: 'kratko.jpg' })] })} />);
    expect(screen.getByTitle('kratko.jpg').textContent).toBe('kratko.jpg');
  });

  it('u običnom režimu klik na sličicu otvara uređivanje', async () => {
    const onEdit = vi.fn();
    render(<MediaAssetsGrid {...gridProps({ onEdit })} />);
    await userEvent.click(screen.getAllByRole('img')[0].closest('button') as HTMLElement);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });

  it('u režimu odabira klik na sličicu mijenja odabir i nema akcija', async () => {
    const onToggleSelect = vi.fn();
    const onEdit = vi.fn();
    render(<MediaAssetsGrid {...gridProps({ selectionMode: true, onToggleSelect, onEdit })} />);
    await userEvent.click(screen.getAllByRole('img')[1].closest('button') as HTMLElement);
    expect(onToggleSelect).toHaveBeenCalledWith('a2');
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'admin.mediaGrid.copyUrl' })).toBeNull();
  });

  it('kopiranje koristi originalnu putanju i prikazuje potvrdu', async () => {
    const onCopy = vi.fn();
    render(<MediaAssetsGrid {...gridProps({ onCopy })} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'admin.mediaGrid.copyUrl' })[0]);
    expect(onCopy).toHaveBeenCalledWith('media/original/a1.jpg');
  });

  it('kopirani fajl ima skrivenu oznaku Kopirano', () => {
    render(<MediaAssetsGrid {...gridProps({ copied: 'media/original/a2.jpg' })} />);
    expect(screen.getByText('admin.mediaGrid.copied')).toBeTruthy();
  });

  it('brisanje prosljeđuje ID i naziv fajla', async () => {
    const onDelete = vi.fn();
    render(<MediaAssetsGrid {...gridProps({ onDelete })} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.delete' })[1]);
    expect(onDelete).toHaveBeenCalledWith('a2', 'slika-a2.jpg');
  });

  it('bez onEdit/onDelete nema tih dugmadi', () => {
    render(<MediaAssetsGrid {...gridProps({ onEdit: undefined, onDelete: undefined })} />);
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
  });

  it('bez thumbPath koristi se originalna putanja', () => {
    render(<MediaAssetsGrid {...gridProps({ assets: [asset('a1', { thumbPath: null })] })} />);
    expect(screen.getByRole('img').getAttribute('src')).toContain('original/a1.jpg');
  });
});

describe('MediaAssetsGrid — akcija uređivanja', () => {
  it('dugme Uredi zove onEdit sa fajlom', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<MediaAssetsGrid {...gridProps({ onEdit })} />);
    await user.click(screen.getAllByRole('button', { name: 'actions.edit' })[0]!);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });
});
