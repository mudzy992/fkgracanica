import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' as const },
  Linking: { openURL: vi.fn(async () => {}) },
}));

import * as SecureStore from 'expo-secure-store';
import { Platform, Linking } from 'react-native';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from './api';
import { openMaps } from './open-maps';

describe('mob-batch06 — P-MOB06 lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Platform as unknown as { OS: string }).OS = 'ios';
  });

  it('getAccessToken čita fk_access_token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('tok123');
    await expect(getAccessToken()).resolves.toBe('tok123');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('fk_access_token');
  });

  it('getRefreshToken čita fk_refresh_token', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('ref456');
    await expect(getRefreshToken()).resolves.toBe('ref456');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('fk_refresh_token');
  });

  it('setTokens pohranjuje oba tokena', async () => {
    await setTokens('a1', 'r1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_access_token', 'a1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_refresh_token', 'r1');
  });

  it('clearTokens briše sva tri ključa', async () => {
    await clearTokens();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_access_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_refresh_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('fk_user');
  });

  it('setStoredUser serializira korisnika', async () => {
    const user = { id: 'u1', email: 'a@b.c' } as never;
    await setStoredUser(user);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('fk_user', JSON.stringify(user));
  });

  it('getStoredUser vraća parsiran objekt', async () => {
    const user = { id: 'u2', email: 'x@y.z' };
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(JSON.stringify(user));
    await expect(getStoredUser()).resolves.toEqual(user);
  });

  it('getStoredUser vraća null kad nema vrijednosti', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await expect(getStoredUser()).resolves.toBeNull();
  });

  it('getStoredUser vraća null za neispravan JSON', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('not-json{');
    await expect(getStoredUser()).resolves.toBeNull();
  });

  it('openMaps iOS koristi maps: pa apple', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('  Kneza Domagoja 12  ');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Kneza%20Domagoja%2012');
  });

  it('openMaps Android koristi geo: pa google', async () => {
    (Platform as unknown as { OS: string }).OS = 'android';
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('Sarajevo Baščaršija');
    expect(open).toHaveBeenCalledWith('geo:0,0?q=Sarajevo%20Ba%C5%A1%C4%8Dar%C5%A1ija');
  });

  it('openMaps prazan address ne poziva Linking', async () => {
    const open = vi.mocked(Linking.openURL);
    await openMaps('   ');
    await openMaps('');
    expect(open).not.toHaveBeenCalled();
  });

  it('openMaps fallback na drugi URL kad prvi baci', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);
    await openMaps('Mostar');
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenNthCalledWith(1, 'maps:0,0?q=Mostar');
    expect(open).toHaveBeenNthCalledWith(2, 'https://maps.apple.com/?q=Mostar');
  });
});
