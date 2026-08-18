import { createReadStream } from 'fs';
import * as path from 'path';
import type { Response } from 'express';

export function apkDownloadFilename(version: string): string {
  const safe = version.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'latest';
  return `fk-gracanica-${safe}.apk`;
}

export function resolveApkAbsPath(uploadRoot: string, apkPath: string): string | null {
  if (!apkPath || apkPath.includes('\0')) return null;
  const root = path.resolve(uploadRoot);
  const abs = path.resolve(root, apkPath);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (!abs.startsWith(prefix) || !abs.toLowerCase().endsWith('.apk')) return null;
  return abs;
}

export function streamApkFile(res: Response, absPath: string, filename: string, size: number): void {
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', String(size));
  const stream = createReadStream(absPath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ statusCode: 404, message: 'APK fajl nije pronađen.' });
      return;
    }
    res.destroy();
  });
  stream.pipe(res);
}
