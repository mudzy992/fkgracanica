import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PassQrCode } from './PassQrCode';

const state = vi.hoisted(() => ({
  qr: vi.fn(),
  resolve: [] as Array<(url: string) => void>,
  rejects: false,
  dialogOpen: false,
}));

vi.mock('../../lib/pass-qr', () => ({
  qrDataUrl: (value: string, size: number) => {
    state.qr(value, size);
    if (state.rejects) return new Promise<string>(() => {});
    return new Promise<string>((resolve) => {
      state.resolve.push((url) => resolve(`${url}:${size}`));
    });
  },
}));
vi.mock('../../lib/utils', () => ({ cn: (...values: Array<string | undefined>) => values.filter(Boolean).join(' ') }));
vi.mock('../ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => {
    state.dialogOpen = open;
    return open ? <div data-testid="dialog">{children}</div> : null;
  },
  DialogHeader: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <header>
      <h2>{children}</h2>
      <button type="button" onClick={onClose} aria-label="zatvori-dijalog">x</button>
    </header>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const flush = () => state.resolve.splice(0).forEach((resolve, i) => resolve(`data:qr${i}`));

beforeEach(() => {
  state.qr.mockReset();
  state.resolve = [];
  state.rejects = false;
  state.dialogOpen = false;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PassQrCode — učitavanje koda', () => {
  it('dok se kod ne izračuna prikazuje pulsirajući okvir veličine zadate', () => {
    const { container } = render(<PassQrCode value="PASS-1" size={96} className="moja" />);
    const placeholder = container.firstElementChild as HTMLElement;
    expect(placeholder.className).toContain('animate-pulse');
    expect(placeholder.className).toContain('moja');
    expect(placeholder.style.width).toBe('96px');
    expect(state.qr).toHaveBeenCalledWith('PASS-1', 96);
  });

  it('podrazumijevana veličina je 72', () => {
    render(<PassQrCode value="PASS-2" />);
    expect(state.qr).toHaveBeenCalledWith('PASS-2', 72);
  });

  it('nakon izračunavanja prikazuje sliku sa podrazumijevanim labelom', async () => {
    render(<PassQrCode value="PASS-3" />);
    flush();
    const img = await screen.findByRole('img', { name: 'QR kod' });
    expect(img).toHaveAttribute('src', 'data:qr0:72');
    expect(img).toHaveAttribute('width', '72');
    expect(screen.getByRole('button', { name: 'Povećaj QR kod' })).toBeInTheDocument();
  });

  it('koristi proslijeđeni label i klasu', async () => {
    render(<PassQrCode value="PASS-4" label="Ulaznica" className="border" />);
    flush();
    const button = await screen.findByRole('button', { name: 'Povećaj Ulaznica' });
    expect(button.className).toContain('border');
    expect(screen.getByRole('img', { name: 'Ulaznica' })).toBeInTheDocument();
  });

  it('neuspjelo izračunavanje ostavlja skeleton', async () => {
    state.rejects = true;
    const { container } = render(<PassQrCode value="PASS-5" />);
    expect(state.qr).toHaveBeenCalledWith('PASS-5', 72);
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('PassQrCode — uvećani prikaz', () => {
  it('otvara dijalog i učitava uvećani kod', async () => {
    const user = userEvent.setup();
    render(<PassQrCode value="PASS-6" enlargeSize={200} />);
    flush();
    await user.click(await screen.findByRole('button', { name: 'Povećaj QR kod' }));
    expect(state.dialogOpen).toBe(true);
    expect(state.qr).toHaveBeenCalledWith('PASS-6', 200);
    expect(screen.getByText('Pokažite ovaj kod na ulazu ili blagajni')).toBeInTheDocument();
    flush();
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(2));
    const expanded = screen
      .getAllByRole('img')
      .find((img) => img.getAttribute('width') === '200');
    expect(expanded).toHaveAttribute('src', 'data:qr0:200');
  });

  it('zatvaranje dijaloga uklanja uvećani sadržaj', async () => {
    const user = userEvent.setup();
    render(<PassQrCode value="PASS-7" />);
    flush();
    await user.click(await screen.findByRole('button', { name: 'Povećaj QR kod' }));
    expect(screen.getByText(/Pokažite ovaj kod/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'zatvori-dijalog' }));
    expect(state.dialogOpen).toBe(false);
    expect(screen.queryByText(/Pokažite ovaj kod/)).toBeNull();
  });
});
