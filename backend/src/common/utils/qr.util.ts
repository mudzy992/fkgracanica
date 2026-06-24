import { randomBytes } from 'crypto';

export function generateQrCode(prefix: string): string {
  return `${prefix}_${randomBytes(16).toString('hex')}`;
}
