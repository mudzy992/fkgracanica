import { HttpException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import {
  DAILY_UPLOAD_LIMIT,
  assertUploadQuota,
  uploadQuotaKey,
} from './upload-quota.util';

/**
 * BE-09/P-B09-3 (odobreno): `POST /upload` dobija throttle (10/min, na ruti) i
 * dnevnu kvotu po korisniku (20/dan, Redis INCR).
 */
describe('upload kvota (BE-09 / P-B09-3)', () => {
  const file = {
    originalname: 'a.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('x'),
    size: 1,
  } as Express.Multer.File;

  const build = (cache?: { incr: jest.Mock }) => {
    const renditions = {
      generate: jest
        .fn()
        .mockResolvedValue({ thumbPath: 'thumbs/a.webp', mediumPath: null }),
    };
    const config = { get: () => '/tmp/uploads' };
    return new UploadService(
      config as unknown as ConfigService,
      renditions,
      cache as never,
    );
  };

  it('ključ je po korisniku i po danu', () => {
    const day = new Date('2026-11-03T23:59:00.000Z');
    expect(uploadQuotaKey('u1', day)).toBe('upload:quota:u1:2026-11-03');
  });

  it('prelazak dnevne kvote → 429', () => {
    expect(() => assertUploadQuota(DAILY_UPLOAD_LIMIT)).not.toThrow();
    expect(() => assertUploadQuota(DAILY_UPLOAD_LIMIT + 1)).toThrow(
      HttpException,
    );
  });

  it('bez Redisa (count null) kvota se preskače', () => {
    expect(() => assertUploadQuota(null)).not.toThrow();
  });

  it('uspješan upload troši kvotu (INCR sa 24h TTL)', async () => {
    const incr = jest.fn().mockResolvedValue(1);
    const service = build({ incr });

    await service.saveFile(file, 'u1');

    expect(incr).toHaveBeenCalledWith(
      'upload:quota:u1:' + new Date().toISOString().slice(0, 10),
      86_400,
    );
  });

  it('21. upload u danu → 429 i fajl se ne prihvata', async () => {
    const incr = jest.fn().mockResolvedValue(DAILY_UPLOAD_LIMIT + 1);
    const service = build({ incr });

    await expect(service.saveFile(file, 'u1')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('anonimni poziv (bez userId) ne dira kvotu', async () => {
    const incr = jest.fn().mockResolvedValue(1);
    const service = build({ incr });

    await service.saveFile(file);

    expect(incr).not.toHaveBeenCalled();
  });
});
