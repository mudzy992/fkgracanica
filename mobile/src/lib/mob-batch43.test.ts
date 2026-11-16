import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(), setItemAsync: vi.fn() }));
vi.mock('react-native', () => ({ Linking: { openURL: vi.fn() }, Platform: { OS: 'ios' } }));
vi.mock('./api', () => ({ api: { get: vi.fn(), post: vi.fn(async () => ({})) } }));
import * as SecureStore from 'expo-secure-store';
import { Linking, Platform } from 'react-native';
import { api } from './api';
import { trackMobileVisit } from './visitor';
import { openMaps } from './open-maps';
import { parseYouTubeId } from './youtube-id';
import { youtubeEmbedHtml, youtubeEmbedOrigin, youtubeEmbedSrc } from './youtube-embed';
describe('mob-batch43 — P-MOB43 visitor/maps/youtube', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('trackMobileVisit postojeći id', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue('abc123');
    await trackMobileVisit();
    expect(SecureStore.getItemAsync).toHaveBeenCalled(); expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ visitorId: 'abc123' }));
  });
  it('trackMobileVisit kreira novi', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null); vi.mocked(SecureStore.setItemAsync).mockResolvedValue();
    await trackMobileVisit(); expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });
  it('trackMobileVisit hvata grešku', async () => {
    vi.mocked(SecureStore.getItemAsync).mockRejectedValue(new Error('fail'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
  });
  it('openMaps prazno', async () => { await openMaps('   '); expect(Linking.openURL).not.toHaveBeenCalled(); });
  it('openMaps ios', async () => {
    (Platform as any).OS = 'ios'; vi.mocked(Linking.openURL).mockResolvedValue(true as never);
    await openMaps('Sarajevo'); expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('maps:'));
  });
  it('openMaps android', async () => {
    (Platform as any).OS = 'android'; vi.mocked(Linking.openURL).mockResolvedValue(true as never);
    await openMaps('Sarajevo'); expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('geo:'));
  });
  it('openMaps fallback try next', async () => {
    (Platform as any).OS = 'ios'; vi.mocked(Linking.openURL).mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(true as never);
    await openMaps('Test'); expect(Linking.openURL).toHaveBeenCalledTimes(2);
  });
  it('parseYouTubeId youtu.be', () => { expect(parseYouTubeId('https://youtu.be/abc123')).toBe('abc123'); });
  it('parseYouTubeId youtube.com v', () => { expect(parseYouTubeId('https://www.youtube.com/watch?v=xyz789&x=1')).toBe('xyz789'); });
  it('parseYouTubeId embed/live/shorts', () => {
    expect(parseYouTubeId('https://youtube.com/embed/aaa')).toBe('aaa');
    expect(parseYouTubeId('https://youtube.com/live/bbb')).toBe('bbb');
    expect(parseYouTubeId('https://youtube.com/shorts/ccc')).toBe('ccc');
    expect(parseYouTubeId('https://example.com/watch?v=zzz')).toBeNull(); expect(parseYouTubeId('not url')).toBeNull();
  });
  it('youtubeEmbedSrc/Html', () => {
    const src = youtubeEmbedSrc('vid1', true); expect(src).toContain('vid1'); expect(src).toContain('mute=1');
    expect(youtubeEmbedSrc('vid1', false)).toContain('mute=0'); expect(youtubeEmbedHtml('vid1')).toContain('vid1');
    expect(youtubeEmbedOrigin()).toContain('fkgracanica');
  });
});
