import { BadRequestException } from '@nestjs/common';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { ImageRenditionService } from './image-rendition.service';

/**
 * BE-09b/P-B09b-10: pad `sharp`-a (oštećena slika) ne smije ostaviti polu-
 * zapisane varijante; klijent dobija 400 umjesto 500.
 */
describe('ImageRenditionService (BE-09b / P-B09b-10)', () => {
  const service = new ImageRenditionService();
  let root = '';

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'renditions-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  const makePng = async () =>
    sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        background: { r: 10, g: 100, b: 20 },
      },
    })
      .png()
      .toBuffer();

  it('generiše thumb i medium za validnu sliku', async () => {
    const result = await service.generate(
      await makePng(),
      'originals/a.png',
      root,
    );

    expect(result.thumbPath).toBe('thumbs/a.webp');
    expect(result.mediumPath).toBe('medium/a.webp');
    expect(await readdir(join(root, 'thumbs'))).toEqual(['a.webp']);
    expect(await readdir(join(root, 'medium'))).toEqual(['a.webp']);
  });

  it('oštećena slika → 400 (prije 500)', async () => {
    await expect(
      service.generate(Buffer.from('nije-slika'), 'originals/bad.png', root),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('pri padu ne ostavlja polu-zapisane varijante', async () => {
    await expect(
      service.generate(Buffer.from('nije-slika'), 'originals/bad.png', root),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(await readdir(join(root, 'thumbs'))).toEqual([]);
    expect(await readdir(join(root, 'medium'))).toEqual([]);
  });

  it('ne mijenja orijentaciju/veličinu originala na disku (samo rendicije)', async () => {
    const buffer = await makePng();
    await service.generate(buffer, 'originals/c.png', root);

    const meta = await sharp(join(root, 'medium', 'c.webp')).metadata();
    expect(meta.width).toBe(800);
    expect(meta.format).toBe('webp');
  });
});
