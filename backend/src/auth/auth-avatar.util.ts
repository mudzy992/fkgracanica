import { BadRequestException } from '@nestjs/common';
import { stat } from 'fs/promises';
import { resolve, sep } from 'path';
import { deleteStoredFiles } from '../media/media-storage.util';
import { variantPath } from '../upload/upload.util';

export function resolveStoredAvatarPath(
  uploadRoot: string,
  relativePath: string,
): string | null {
  if (!relativePath || relativePath.includes('\0')) return null;
  const normalized = relativePath.replace(/\\/g, '/');
  if (!normalized.startsWith('originals/')) return null;
  const root = resolve(uploadRoot);
  const abs = resolve(root, normalized);
  const prefix = root.endsWith(sep) ? root : root + sep;
  if (!abs.startsWith(prefix)) return null;
  return abs;
}

export async function assertStoredAvatarPath(
  uploadRoot: string,
  relativePath: string,
): Promise<void> {
  const absPath = resolveStoredAvatarPath(uploadRoot, relativePath);
  if (!absPath) {
    throw new BadRequestException('Neispravan avatar path.');
  }
  try {
    await stat(absPath);
  } catch {
    throw new BadRequestException('Avatar fajl nije pronađen u storage-u.');
  }
}

export async function removeAvatarFiles(
  uploadRoot: string,
  relativePath: string,
): Promise<void> {
  await deleteStoredFiles(uploadRoot, [
    relativePath,
    variantPath(relativePath, 'thumb'),
    variantPath(relativePath, 'medium'),
  ]);
}
