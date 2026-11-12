import { createHash } from 'crypto';
import * as pathMod from 'path';
import { createReadStream } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';

/**
 * APK upload na disk (BE-08 / P-B08-3).
 *
 * Prije: `memoryStorage()` + limit 200 MB → svaki upload je držao cijeli fajl
 * u heap-u (nekoliko paralelnih = OOM). Sada multer piše u sistemski temp
 * direktorij, a servis strimuje fajl (sha256), pa ga prebaci u `uploads/`.
 */
export const MAX_APK_SIZE = 200 * 1024 * 1024;

export function apkTmpDir(): string {
  return path.join(tmpdir(), 'fkg-apk');
}

export function apkTmpFilename(originalName: string): string {
  const ext = originalName.toLowerCase().endsWith('.apk') ? '.apk' : '.tmp';
  return `apk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
}

export function hashFile(absPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(absPath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/** Prebaci temp fajl na cilj (rename; copy+unlink ako je drugi FS). */
export async function moveFile(from: string, to: string): Promise<void> {
  await fs.mkdir(path.dirname(to), { recursive: true });
  try {
    await fs.rename(from, to);
  } catch (error) {
    if ((error as { code?: string }).code !== 'EXDEV') throw error;
    await fs.copyFile(from, to);
    await fs.unlink(from).catch(() => undefined);
  }
}

export async function removeFileQuietly(absPath?: string): Promise<void> {
  if (!absPath) return;
  await fs.unlink(absPath).catch(() => undefined);
}

export interface StoredApk {
  apkPath: string;
  apkSha256: string;
  apkSizeBytes: number;
}

/**
 * Upis APK-a u `uploads/app-releases/<godina>/<mjesec>/` (relativna putanja).
 * Multer (diskStorage) daje `file.path` → strim hash + move; `file.buffer`
 * ostaje podržan za testove/interne pozive.
 */
export async function storeApk(
  uploadRoot: string,
  file: Express.Multer.File,
): Promise<StoredApk> {
  const now = new Date();
  const relDir = pathMod.join(
    'app-releases',
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
  );
  const relPath = pathMod
    .join(relDir, `app-${Date.now()}.apk`)
    .replace(/\\/g, '/');
  const absPath = pathMod.join(uploadRoot, relPath);

  if (file.path) {
    try {
      const apkSha256 = await hashFile(file.path);
      await moveFile(file.path, absPath);
      return { apkPath: relPath, apkSha256, apkSizeBytes: file.size };
    } finally {
      await removeFileQuietly(file.path);
    }
  }

  await fs.mkdir(pathMod.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, file.buffer);
  return {
    apkPath: relPath,
    apkSha256: createHash('sha256').update(file.buffer).digest('hex'),
    apkSizeBytes: file.size,
  };
}
