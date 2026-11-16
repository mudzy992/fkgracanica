import { describe, expect, it, vi, beforeEach } from 'vitest';

(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' as const },
  Vibration: { vibrate: vi.fn() },
  Linking: { openURL: vi.fn(async () => {}) },
  Alert: { alert: vi.fn() },
}));

vi.mock('expo-application', () => ({
  nativeBuildVersion: '10',
}));

vi.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  getInfoAsync: vi.fn(async () => ({ exists: true, size: 0 })),
  readAsStringAsync: vi.fn(async () => ''),
  createDownloadResumable: vi.fn(() => ({ downloadAsync: vi.fn(async () => ({ uri: 'file:///cache/app.apk' })) })),
  getContentUriAsync: vi.fn(async () => 'content://apk'),
  deleteAsync: vi.fn(async () => {}),
  EncodingType: { Base64: 'base64' },
}));

vi.mock('expo-intent-launcher', () => ({
  startActivityAsync: vi.fn(async () => {}),
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { Sha256, base64ToBytes } from '../features/app-update/sha256';
import { decideUpdate, getLocalVersionCode, isAndroid, resolveApkAbsoluteUrl } from '../features/app-update/apk-update';

describe('mob-batch22 — P-MOB22 app-update/sha256', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Platform as unknown as { OS: string }).OS = 'ios';
    (Application as unknown as { nativeBuildVersion: string }).nativeBuildVersion = '10';
  });

  it('Sha256 prazan hash', () => {
    const h = new Sha256();
    expect(h.hex()).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('Sha256 abc vektori', () => {
    const h = new Sha256();
    h.update(new TextEncoder().encode('abc'));
    expect(h.hex()).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('Sha256 split update daje isti hash', () => {
    const a = new Sha256();
    a.update(new TextEncoder().encode('ab'));
    a.update(new TextEncoder().encode('c'));
    const b = new Sha256();
    b.update(new TextEncoder().encode('abc'));
    expect(a.hex()).toBe(b.hex());
  });

  it('base64ToBytes decodira', () => {
    const bytes = base64ToBytes('aGVsbG8=');
    expect(Array.from(bytes)).toEqual([104, 101, 108, 108, 111]);
    expect(base64ToBytes('').length).toBe(0);
  });

  it('isAndroid vraća true samo za android', () => {
    (Platform as unknown as { OS: string }).OS = 'android';
    expect(isAndroid()).toBe(true);
    (Platform as unknown as { OS: string }).OS = 'ios';
    expect(isAndroid()).toBe(false);
  });

  it('getLocalVersionCode parsira nativeBuildVersion', () => {
    (Application as unknown as { nativeBuildVersion: string }).nativeBuildVersion = '42';
    expect(getLocalVersionCode()).toBe(42);
    (Application as unknown as { nativeBuildVersion: string }).nativeBuildVersion = 'abc';
    expect(getLocalVersionCode()).toBe(0);
    (Application as unknown as { nativeBuildVersion: unknown }).nativeBuildVersion = undefined;
    expect(getLocalVersionCode()).toBe(0);
  });

  it('resolveApkAbsoluteUrl apsolutni prolaz', () => {
    expect(resolveApkAbsoluteUrl('https://cdn.test/app.apk')).toBe('https://cdn.test/app.apk');
    expect(resolveApkAbsoluteUrl('http://cdn.test/app.apk')).toBe('http://cdn.test/app.apk');
  });

  it('resolveApkAbsoluteUrl relativni sa i bez /', () => {
    expect(resolveApkAbsoluteUrl('/apk/app.apk')).toBe('https://api.fkgracanica.ba101.top/apk/app.apk');
    expect(resolveApkAbsoluteUrl('apk/app.apk')).toBe('https://api.fkgracanica.ba101.top/apk/app.apk');
  });

  it('decideUpdate none kad verzija <= local', () => {
    const rel = { versionCode: 10, minSupportedVersionCode: 5, forceUpdate: false } as never;
    expect(decideUpdate(10, rel).kind).toBe('none');
    expect(decideUpdate(11, rel).kind).toBe('none');
  });

  it('decideUpdate soft kad novija ali ne force', () => {
    const rel = { versionCode: 11, minSupportedVersionCode: 5, forceUpdate: false } as never;
    expect(decideUpdate(10, rel)).toEqual({ kind: 'soft', release: rel });
  });

  it('decideUpdate force kad forceUpdate ili ispod minSupported', () => {
    const relForce = { versionCode: 11, minSupportedVersionCode: 5, forceUpdate: true } as never;
    expect(decideUpdate(10, relForce).kind).toBe('force');
    const relMin = { versionCode: 11, minSupportedVersionCode: 12, forceUpdate: false } as never;
    expect(decideUpdate(10, relMin).kind).toBe('force');
  });
});
