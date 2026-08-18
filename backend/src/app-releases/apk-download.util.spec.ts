import * as path from 'path';
import { apkDownloadFilename, resolveApkAbsPath } from './apk-download.util';

describe('apk-download.util', () => {
  it('sanitizes version in filename', () => {
    expect(apkDownloadFilename('1.2.3')).toBe('fk-gracanica-1.2.3.apk');
    expect(apkDownloadFilename('../evil')).toBe('fk-gracanica-..-evil.apk');
  });

  it('resolves apk under upload root', () => {
    const root = path.resolve('/var/uploads');
    const abs = resolveApkAbsPath(root, 'app-releases/2026/08/app-1.apk');
    expect(abs).toBe(path.join(root, 'app-releases/2026/08/app-1.apk'));
  });

  it('rejects path traversal', () => {
    const root = path.resolve('/var/uploads');
    expect(resolveApkAbsPath(root, '../secret.apk')).toBeNull();
    expect(resolveApkAbsPath(root, 'app-releases/x.txt')).toBeNull();
  });
});
