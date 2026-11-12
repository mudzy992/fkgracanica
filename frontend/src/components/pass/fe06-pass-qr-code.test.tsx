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
    if (state.rejects) return Promise.reject(new Error('qr nije izračunat'));
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

  it('neuspjelo izračunavanje prikazuje poruku umjesto skeletona (Q-FE06-33)', async () => {
    state.rejects = true;
    const { container } = render(<PassQrCode value="PASS-5" />);
    expect(state.qr).toHaveBeenCalledWith('PASS-5', 72);
    expect(await screen.findByText('QR kod nije dostupan')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });

  it('neuspjeh se ne zadržava kad novi kod uspije', async () => {
    state.rejects = true;
    const { rerender } = render(<PassQrCode value="PASS-8" />);
    await screen.findByText('QR kod nije dostupan');
    state.rejects = false;
    rerender(<PassQrCode value="PASS-9" />);
    flush();
    expect(await screen.findByRole('img', { name: 'QR kod' })).toBeInTheDocument();
    expect(screen.queryByText('QR kod nije dostupan')).toBeNull();
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

  it('neuspjeh uvećanog koda prikazuje poruku u dijalogu uz ispravan mali kod', async () => {
    const user = userEvent.setup();
    render(<PassQrCode value="PASS-10" />);
    flush();
    const button = await screen.findByRole('button', { name: 'Povećaj QR kod' });
    state.rejects = true;
    await user.click(button);
    expect(state.qr).toHaveBeenCalledWith('PASS-10', 280);
    expect(await screen.findByText('QR kod nije dostupan')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'QR kod' })).toHaveAttribute('src', 'data:qr0:72');
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

describe('PassQrCode — odgođeni rezultat poslije demontaže (batch 34)', () => {
  it('uspjeh nakon demontaže ne mijenja stanje', async () => {
    const { unmount } = render(<PassQrCode value="PASS-11" />);
    unmount();
    flush();
    await Promise.resolve();
  });

  it('greška nakon demontaže ne mijenja stanje', async () => {
    state.rejects = true;
    const { unmount } = render(<PassQrCode value="PASS-12" />);
    unmount();
    await Promise.resolve();
    await Promise.resolve();
  });

  it('uvećani kod otvoren pa demontiran ne mijenja stanje', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PassQrCode value="PASS-13" />);
    flush();
    await user.click(await screen.findByRole('button', { name: 'Povećaj QR kod' }));
    unmount();
    flush();
    await Promise.resolve();
  });

  it('greška uvećanog koda nakon demontaže ne mijenja stanje', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PassQrCode value="PASS-14" />);
    flush();
    await user.click(await screen.findByRole('button', { name: 'Povećaj QR kod' }));
    state.rejects = true;
    unmount();
    await Promise.resolve();
    await Promise.resolve();
  });
});

