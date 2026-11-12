import type { Request } from 'express';
import { getClientIp } from './client-ip.util';

/**
 * BE-05/B-05-02: getClientIp MORA vjerovati req.ip (trust proxy=1 iz
 * BE-01/Q-11), a NE raw XFF (klijentski spoofable → lažna geo statistika).
 */
describe('getClientIp (BE-05)', () => {
  it('koristi req.ip čak i kad klijent šalje spoofed X-Forwarded-For', () => {
    const req = {
      headers: { 'x-forwarded-for': '6.6.6.6' },
      ip: '203.0.113.7',
    } as unknown as Request;

    expect(getClientIp(req)).toBe('203.0.113.7');
  });

  it('req.ip bez XFF → req.ip', () => {
    const req = { headers: {}, ip: '10.0.0.1' } as unknown as Request;
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('bez ip-ja → undefined', () => {
    const req = { headers: {} } as unknown as Request;
    expect(getClientIp(req)).toBeUndefined();
  });
});
