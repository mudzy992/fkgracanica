import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { ImageRenditionService } from './image-rendition.service';

/**
 * BE-04/P-B04-2 (odobreno): upload validacija — slike-only (mime + ext
 * allowlist, bez SVG-a) zatvara stored XSS; odbijanja se dešavaju PRIJE
 * upisa na disk. (fileSize limit je na multer nivou u upload.controller —
 * Nest mapira LIMIT_FILE_SIZE → 413.)
 */
describe('UploadService — validacija (BE-04/P-B04-2)', () => {
  let service: UploadService;
  let uploadRoot: string;
  const renditionsMock = {
    generate: jest.fn().mockResolvedValue({
      thumbPath: 'thumbs/x.webp',
      mediumPath: 'medium/x.webp',
    }),
  };

  const file = (originalname: string, mimetype: string): Express.Multer.File =>
    ({
      originalname,
      mimetype,
      buffer: Buffer.from('fake-image-bytes'),
      size: 16,
    }) as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadRoot = await mkdtemp(join(tmpdir(), 'upload-spec-'));
    const module = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'UPLOAD_PATH' ? uploadRoot : undefined,
          },
        },
        { provide: ImageRenditionService, useValue: renditionsMock },
      ],
    }).compile();
    service = module.get(UploadService);
  });

  afterEach(async () => {
    await rm(uploadRoot, { recursive: true, force: true });
  });

  it('odbija missing fajl', async () => {
    await expect(
      service.saveFile(undefined as unknown as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('odbija .html (stored XSS — čak i sa image/png maskom)', async () => {
    await expect(
      service.saveFile(file('evil.html', 'image/png')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('odbija text/html mime', async () => {
    await expect(
      service.saveFile(file('page.html', 'text/html')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('odbija SVG (i mime i ext)', async () => {
    await expect(
      service.saveFile(file('img.svg', 'image/svg+xml')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('odbija bez ekstenzije (ranije: .bin fallback)', async () => {
    await expect(
      service.saveFile(file('datoteka', 'image/png')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prihvata validnu sliku → upis + rendicije + url', async () => {
    const result = await service.saveFile(file('FOTO.JPG', 'image/jpeg'));

    expect(result.filename).toMatch(/\.jpg$/);
    expect(result.path).toMatch(/^originals\//);
    expect(result.urlPath).toContain('/api/v1/uploads/files/');
    expect(renditionsMock.generate).toHaveBeenCalled();
  });
});
