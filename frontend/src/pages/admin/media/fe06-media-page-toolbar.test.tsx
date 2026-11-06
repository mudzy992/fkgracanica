import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaPageToolbar } from './MediaPageToolbar';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./MediaUploadProgress', () => ({
  MediaUploadProgress: ({ progress }: { progress: { total: number } }) => (
    <div data-testid="upload-progress">total:{progress.total}</div>
  ),
}));

type ToolbarProps = Parameters<typeof MediaPageToolbar>[0];

const base: ToolbarProps = {
  search: '',
  onSearchChange: vi.fn(),
  globalSearch: false,
  debouncedSearch: '',
  totalResults: 0,
  folderId: undefined as string | undefined,
  selectedFolderName: undefined as string | undefined,
  selectionMode: false,
  selectedCount: 0,
  visibleCount: 0,
  onToggleSelectionMode: vi.fn(),
  onSelectAllVisible: vi.fn(),
  onUploadClick: vi.fn(),
  uploadDisabled: false,
};

const props = (over: Partial<ToolbarProps> = {}): ToolbarProps => ({ ...base, ...over });

describe('MediaPageToolbar', () => {
  it('prikazuje polje pretrage i upload dugme', () => {
    render(<MediaPageToolbar {...props()} />);
    expect(screen.getByPlaceholderText('admin.mediaToolbar.searchPlaceholder')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeTruthy();
  });

  it('unos u pretragu prosljeđuje vrijednost', async () => {
    const onSearchChange = vi.fn();
    render(<MediaPageToolbar {...props({ onSearchChange })} />);
    await userEvent.type(screen.getByPlaceholderText('admin.mediaToolbar.searchPlaceholder'), 'grb');
    expect(onSearchChange).toHaveBeenCalledWith('g');
  });

  it('dugme za čišćenje postoji samo kad ima pretrage', async () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(<MediaPageToolbar {...props({ onSearchChange })} />);
    expect(screen.queryByRole('button', { name: 'admin.mediaToolbar.clearSearch' })).toBeNull();
    rerender(<MediaPageToolbar {...props({ search: 'grb', onSearchChange })} />);
    await userEvent.click(screen.getByRole('button', { name: 'admin.mediaToolbar.clearSearch' }));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('napomena zavisi od režima: globalna pretraga', () => {
    render(
      <MediaPageToolbar
        {...props({ globalSearch: true, debouncedSearch: 'grb', totalResults: 7 })}
      />,
    );
    expect(screen.getByText('7 pronađenih medija za „grb". Upload ide u odabranu mapu.')).toBeTruthy();
  });

  it('napomena za odabranu mapu', () => {
    render(<MediaPageToolbar {...props({ folderId: 'f1', selectedFolderName: 'Grbovi' })} />);
    expect(screen.getByText('Prikaz mape „Grbovi". Upload ide u ovu mapu.')).toBeTruthy();
  });

  it('napomena za mapu bez naziva koristi crticu', () => {
    render(<MediaPageToolbar {...props({ folderId: 'f1' })} />);
    expect(screen.getByText('Prikaz mape „—". Upload ide u ovu mapu.')).toBeTruthy();
  });

  it('podrazumijevana napomena traži odabir mape', () => {
    render(<MediaPageToolbar {...props()} />);
    expect(screen.getByText(/Odaberite mapu za upload/)).toBeTruthy();
  });

  it('globalna pretraga bez rezultata prikazuje nulu', () => {
    render(<MediaPageToolbar {...props({ globalSearch: true, debouncedSearch: 'x' })} />);
    expect(screen.getByText(/0 pronađenih medija/)).toBeTruthy();
  });

  it('mapa dugme je vidljivo samo uz onFolderChipClick', async () => {
    const onFolderChipClick = vi.fn();
    const { rerender } = render(<MediaPageToolbar {...props()} />);
    expect(screen.queryByRole('button', { name: /Mapa:/ })).toBeNull();
    rerender(<MediaPageToolbar {...props({ onFolderChipClick })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mapa: Svi mediji' }));
    expect(onFolderChipClick).toHaveBeenCalled();
  });

  it('mapa dugme prikazuje naziv odabrane mape', () => {
    render(
      <MediaPageToolbar
        {...props({ onFolderChipClick: vi.fn(), folderId: 'f1', selectedFolderName: 'Grbovi' })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Mapa: Grbovi' })).toBeTruthy();
  });

  it('režim odabira prikazuje broj odabranih i dugme Odaberi sve', async () => {
    const onSelectAllVisible = vi.fn();
    const onToggleSelectionMode = vi.fn();
    render(
      <MediaPageToolbar
        {...props({
          selectionMode: true,
          selectedCount: 3,
          visibleCount: 9,
          onSelectAllVisible,
          onToggleSelectionMode,
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Odabrano (3)' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Odaberi sve (9)' }));
    expect(onSelectAllVisible).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Odabrano (3)' }));
    expect(onToggleSelectionMode).toHaveBeenCalled();
  });

  it('u režimu odabira bez vidljivih stavki nema Odaberi sve', () => {
    render(<MediaPageToolbar {...props({ selectionMode: true, visibleCount: 0 })} />);
    expect(screen.queryByRole('button', { name: /Odaberi sve/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Odabrano (0)' })).toBeTruthy();
  });

  it('bez canManage nema dugmeta za odabir', () => {
    render(<MediaPageToolbar {...props({ canManage: false })} />);
    expect(screen.queryByRole('button', { name: 'Odaberi' })).toBeNull();
  });

  it('bez canUpload nema upload dugmeta', () => {
    render(<MediaPageToolbar {...props({ canUpload: false })} />);
    expect(screen.queryByRole('button', { name: 'Upload' })).toBeNull();
  });

  it('upload dugme prikazuje naziv mape i prima title/disabled', () => {
    render(
      <MediaPageToolbar
        {...props({
          selectedFolderName: 'Grbovi',
          uploadDisabled: true,
          uploadTitle: 'Odaberite mapu',
        })}
      />,
    );
    const button = screen.getByRole('button', { name: 'Upload u „Grbovi"' });
    expect(button).toHaveProperty('disabled', true);
    expect(button.getAttribute('title')).toBe('Odaberite mapu');
  });

  it('progres uploada se prikazuje samo kad postoji', () => {
    const { rerender } = render(<MediaPageToolbar {...props()} />);
    expect(screen.queryByTestId('upload-progress')).toBeNull();
    rerender(<MediaPageToolbar {...props({ uploadProgress: { total: 4 } as never }) } />);
    expect(screen.getByTestId('upload-progress').textContent).toBe('total:4');
  });
});
