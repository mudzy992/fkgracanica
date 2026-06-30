import QRCode from 'qrcode';

export async function qrDataUrl(value: string, size: number): Promise<string> {
  return QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
}
