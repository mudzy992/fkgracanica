import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import {
  apkTmpFilename,
  hashFile,
  moveFile,
  removeFileQuietly,
} from './apk-storage.util';

describe('apk-storage.util (BE-08 / P-B08-3)', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'apk-storage-spec-'));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('hashFile vraća sha256 sadržaja (strim, bez buffer-a)', async () => {
    const file = path.join(dir, 'a.apk');
    await fs.writeFile(file, 'apk-sadrzaj');
    // sha256('apk-sadrzaj')
    await expect(hashFile(file)).resolves.toMatch(/^[0-9a-f]{64}$/);
    const again = await hashFile(file);
    expect(again).toBe(await hashFile(file));
  });

  it('hashFile odbija nepostojeći fajl', async () => {
    await expect(hashFile(path.join(dir, 'nema.apk'))).rejects.toThrow();
  });

  it('moveFile prebaci fajl i napravi direktorij', async () => {
    const from = path.join(dir, 'tmp.apk');
    const to = path.join(dir, 'uploads', '2026', '11', 'app.apk');
    await fs.writeFile(from, 'x');
    await moveFile(from, to);
    await expect(fs.readFile(to, 'utf8')).resolves.toBe('x');
    await expect(fs.stat(from)).rejects.toThrow();
  });

  it('removeFileQuietly ne baca za nepostojeći fajl', async () => {
    await expect(
      removeFileQuietly(path.join(dir, 'nema.apk')),
    ).resolves.toBeUndefined();
    await expect(removeFileQuietly(undefined)).resolves.toBeUndefined();
  });

  it('apkTmpFilename ima .apk ekstenziju samo za .apk', () => {
    expect(apkTmpFilename('release.APK')).toMatch(/\.apk$/);
    expect(apkTmpFilename('release.exe')).toMatch(/\.tmp$/);
    expect(apkTmpFilename('a.apk')).toMatch(/^apk-/);
  });
});
