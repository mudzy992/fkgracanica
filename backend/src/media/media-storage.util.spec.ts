import { mkdir, mkdtemp, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import { deleteStoredFiles } from './media-storage.util';

/**
 * BE-09b/P-B09b-12: brisanje fajlova ne smije tiho gutati greške niti raditi
 * van `uploadRoot` (prije: `join(uploadRoot, relative)` bez provjere +
 * `.catch(() => undefined)`).
 */
describe('deleteStoredFiles (BE-09b / P-B09b-12)', () => {
  let root = '';
  const logger = { warn: jest.fn() };

  const exists = async (path: string) => {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    root = await mkdtemp(join(tmpdir(), 'media-storage-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('briše postojeći fajl ispod uploadRoot-a', async () => {
    await writeFile(join(root, 'a.webp'), 'x');

    await deleteStoredFiles(root, ['a.webp'], logger);

    expect(await exists(join(root, 'a.webp'))).toBe(false);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('odbija traversal van uploadRoot-a i loguje', async () => {
    await deleteStoredFiles(root, ['../van.webp'], logger);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('../van.webp') as unknown,
    );
  });

  it('aposlutna putanja van roota se odbija', async () => {
    await deleteStoredFiles(root, ['/etc/hosts'], logger);

    expect(logger.warn).toHaveBeenCalled();
  });

  it('neuspjelo brisanje (npr. direktorij) se loguje, ne guta', async () => {
    await mkdir(join(root, 'folder'));

    await deleteStoredFiles(root, ['folder'], logger);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('folder') as unknown,
    );
  });

  it('ne postoji fajl → tiho (ENOENT nije greška)', async () => {
    await deleteStoredFiles(root, ['nema.webp'], logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('null/undefined putanje se preskaču', async () => {
    await deleteStoredFiles(root, [null, undefined, ''], logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('default logger ne baca', async () => {
    const spy = jest.spyOn(new Logger('MediaStorage'), 'warn');
    await expect(
      deleteStoredFiles(root, ['../x'], logger),
    ).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
