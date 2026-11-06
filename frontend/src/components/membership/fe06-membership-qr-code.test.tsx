import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipQrCode } from './MembershipQrCode';

const qr = vi.hoisted(() => ({ toDataURL: vi.fn() }));

vi.mock('qrcode', () => ({ default: { toDataURL: (...args: unknown[]) => qr.toDataURL(...args) } }));

beforeEach(() => {
  qr.toDataURL = vi.fn().mockResolvedValue('data:image/png;base64,AAA');
});

describe('MembershipQrCode', () => {
  it('dok se QR kod ne izradi prikazuje skeleton', () => {
    const { container } = render(<MembershipQrCode value="FK-123" />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('izrađuje QR kod sa zadatim parametrima i prikazuje sliku', async () => {
    render(<MembershipQrCode value="FK-123" size={240} />);
    const img = await screen.findByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,AAA');
    expect(img).toHaveAttribute('alt', 'QR kod članstva');
    expect(img).toHaveAttribute('width', '240');
    expect(img).toHaveAttribute('height', '240');
    expect(img.className).toContain('rounded-xl');
    const options = qr.toDataURL.mock.calls[0][1] as {
      width: number;
      margin: number;
      color: { dark: string; light: string };
    };
    expect(options).toMatchObject({ width: 240, margin: 2 });
    expect(options.color.dark).toMatch(/^#[0-9a-f]{6}$/i);
    expect(options.color.light).toMatch(/^#[0-9a-f]{6}$/i);
    expect(options.color.light).not.toBe(options.color.dark);
  });

  it('podrazumijevana veličina je 180', async () => {
    render(<MembershipQrCode value="FK-1" />);
    await screen.findByRole('img');
    expect(qr.toDataURL).toHaveBeenCalledWith('FK-1', expect.objectContaining({ width: 180 }));
  });

  it('poštuje dodatnu klasu', async () => {
    render(<MembershipQrCode value="FK-1" className="moja-klasa" />);
    const img = await screen.findByRole('img');
    expect(img).toHaveClass('moja-klasa');
  });

  it('ponovno izrađuje kod kad se vrijednost promijeni', async () => {
    const { rerender } = render(<MembershipQrCode value="FK-1" />);
    await screen.findByRole('img');
    qr.toDataURL.mockResolvedValue('data:image/png;base64,BBB');
    rerender(<MembershipQrCode value="FK-2" />);
    await waitFor(() => expect(qr.toDataURL).toHaveBeenCalledWith('FK-2', expect.anything()));
  });

  it('ne mijenja sliku ako je komponenta uklonjena prije odgovora', async () => {
    let resolve: (v: string) => void = () => undefined;
    qr.toDataURL.mockImplementation(
      () => new Promise<string>((r) => {
        resolve = r;
      }),
    );
    const { unmount } = render(<MembershipQrCode value="FK-1" />);
    unmount();
    resolve('data:image/png;base64,CCC');
    await Promise.resolve();
    expect(qr.toDataURL).toHaveBeenCalledTimes(1);
  });
});
