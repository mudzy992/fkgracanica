import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaPicker } from './MediaPicker';

const state = vi.hoisted(() => ({
  dialog: [] as { open: boolean; mode?: string; title?: string; selected?: string[] }[],
  confirmPaths: ['odabrano.jpg'],
  openChanges: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./MediaPickerDialog', () => ({
  MediaPickerDialog: ({ open, onOpenChange, mode, title, selectedPaths, onConfirm }: {
    open: boolean; onOpenChange: (o: boolean) => void; mode?: string; title?: string;
    selectedPaths?: string[]; onConfirm: (p: string[]) => void;
  }) => {
    state.dialog.push({ open, mode, title, selected: selectedPaths });
    if (!open) return null;
    return (
      <div>
        <p>dialog:{mode}:{title}</p>
        <button
          onClick={() => {
            onConfirm(state.confirmPaths);
            onOpenChange(false);
            state.openChanges.push(false);
          }}
        >
          potvrdi
        </button>
      </div>
    );
  },
}));

describe('MediaPicker', () => {
  beforeEach(() => {
    state.dialog = [];
    state.openChanges = [];
    state.confirmPaths = ['odabrano.jpg'];
  });

  it('bez vrijednosti prikazuje dugme „Odaberi“ i nema sliku', () => {
    render(<MediaPicker />);
    expect(screen.getByRole('button', { name: 'Odaberi' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ukloni' })).toBeNull();
    expect(document.querySelector('img')).toBeNull();
  });

  it('sa vrijednošću prikazuje sliku, „Promijeni“ i „Ukloni“', () => {
    render(<MediaPicker value="foto.jpg" label="Naslovna" />);
    expect(screen.getByText('Naslovna')).toBeTruthy();
    expect(document.querySelector('img')?.getAttribute('src')).toContain('foto.jpg');
    expect(screen.getByRole('button', { name: 'Promijeni' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ukloni' })).toBeTruthy();
  });

  it('readOnly skriva sve akcije ali zadržava sliku i labelu', () => {
    render(<MediaPicker value="foto.jpg" readOnly />);
    expect(document.querySelector('img')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('klik otvara dijalog u single režimu sa trenutnim izborom', async () => {
    render(<MediaPicker value="foto.jpg" />);
    expect(state.dialog[0]).toMatchObject({ open: false });
    await userEvent.click(screen.getByRole('button', { name: 'Promijeni' }));
    expect(state.dialog[1]).toMatchObject({ open: true, mode: 'single', selected: ['foto.jpg'] });
    expect(screen.getByText('dialog:single:admin.mediaPicker.pick')).toBeTruthy();
  });

  it('potvrda dijaloga zove onSelect sa odabranom putanjom', async () => {
    const onSelect = vi.fn();
    render(<MediaPicker onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Odaberi' }));
    await userEvent.click(screen.getByRole('button', { name: 'potvrdi' }));
    expect(onSelect).toHaveBeenCalledWith('odabrano.jpg');
  });

  it('bez onSelect koristi onChange', async () => {
    const onChange = vi.fn();
    render(<MediaPicker onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Odaberi' }));
    await userEvent.click(screen.getByRole('button', { name: 'potvrdi' }));
    expect(onChange).toHaveBeenCalledWith('odabrano.jpg');
  });

  it('onSelect ima prednost nad onChange', async () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    render(<MediaPicker onSelect={onSelect} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Odaberi' }));
    await userEvent.click(screen.getByRole('button', { name: 'potvrdi' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prazna potvrda dijaloga emituje praznu putanju', async () => {
    state.confirmPaths = [];
    const onSelect = vi.fn();
    render(<MediaPicker onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Odaberi' }));
    await userEvent.click(screen.getByRole('button', { name: 'potvrdi' }));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('„Ukloni“ emituje praznu putanju', async () => {
    const onSelect = vi.fn();
    render(<MediaPicker value="foto.jpg" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ukloni' }));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('bez ijednog handlera „Ukloni“ ne pada', async () => {
    render(<MediaPicker value="foto.jpg" />);
    await userEvent.click(screen.getByRole('button', { name: 'Ukloni' }));
    expect(screen.getByRole('button', { name: 'Promijeni' })).toBeTruthy();
  });
});
