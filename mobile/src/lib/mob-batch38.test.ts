import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { api } from './api';
import { normalizeSponsorTier } from '../components/heritage/sponsor-tiers';
import { ticketStatusKey } from '../components/ticket-status';
import { filterEntityHits, loadEntityHits } from '../components/writer/entity-search';
const get = vi.mocked(api.get);
describe('mob-batch38 — P-MOB38 sponsor/entity/ticket', () => {
  beforeEach(() => { vi.clearAllMocks(); get.mockReset(); });
  it('normalizeSponsorTier fallback PARTNER', () => {
    expect(normalizeSponsorTier('GOLD')).toBe('GOLD'); expect(normalizeSponsorTier('GENERAL')).toBe('GENERAL');
    expect(normalizeSponsorTier('bad')).toBe('PARTNER'); expect(normalizeSponsorTier(undefined)).toBe('PARTNER');
  });
  it('ticketStatusKey mapping', () => {
    expect(ticketStatusKey('paid')).toBe('ticketStatusPaid'); expect(ticketStatusKey('PAID_AT_BOX_OFFICE')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('RESERVED')).toBe('ticketStatusReserved'); expect(ticketStatusKey('USED')).toBe('ticketStatusUsed');
    expect(ticketStatusKey('pending')).toBe('ticketStatusPending'); expect(ticketStatusKey('unknown')).toBe('status');
  });
  it('filterEntityHits bez upita slice 40', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: `${i}`, label: `Item ${i}` }));
    expect(filterEntityHits(items, '')).toHaveLength(40); expect(filterEntityHits(items, '   ')).toHaveLength(40);
  });
  it('filterEntityHits pretraga case-insensitive', () => {
    const items = [{ id: '1', label: 'Edin Dzeko' }, { id: '2', label: 'Messi' }];
    expect(filterEntityHits(items, 'edin')).toEqual([items[0]]); expect(filterEntityHits(items, 'MESSI')).toEqual([items[1]]);
  });
  it('loadEntityHits player', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'p1', firstName: 'Edin', lastName: 'Dzeko' }, { id: 'p2', firstName: '', lastName: '' }] } } as never);
    const r = await loadEntityHits('player');
    expect(r[0].label).toBe('Edin Dzeko'); expect(r[1].label).toBe('—'); expect(get).toHaveBeenCalledWith('/players');
  });
  it('loadEntityHits match', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' }, scheduledAt: '2026-01-01T10:00:00Z' }] } } as never);
    const r = await loadEntityHits('match');
    expect(r[0].label).toBe('A vs B · 2026-01-01'); expect(get).toHaveBeenCalledWith('/matches');
  });
  it('loadEntityHits gallery', async () => {
    get.mockResolvedValue({ data: { data: [{ id: 'g1', title: 'Album' }, { id: 'g2' }] } } as never);
    const r = await loadEntityHits('gallery');
    expect(r[0].label).toBe('Album'); expect(r[1].label).toBe('—');
  });
  it('loadEntityHits direktan array', async () => {
    get.mockResolvedValue({ data: [{ id: 'p1', firstName: 'A', lastName: 'B' }] } as never);
    const r = await loadEntityHits('player');
    expect(r.length).toBe(1);
  });
  it('entity-search match bez datuma', async () => {
    get.mockResolvedValue({ data: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' } }] } as never);
    const r = await loadEntityHits('match');
    expect(r[0].label).toBe('A vs B');
  });
  it('normalizeSponsorTier sve vrijednosti', () => {
    for (const t of ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER']) expect(normalizeSponsorTier(t)).toBe(t);
  });
  it('ticketStatusKey case variants', () => {
    expect(ticketStatusKey('PAID')).toBe('ticketStatusPaid'); expect(ticketStatusKey('reserved')).toBe('ticketStatusReserved');
    expect(ticketStatusKey('used')).toBe('ticketStatusUsed'); expect(ticketStatusKey('PENDING_ONLINE')).toBe('ticketStatusPending');
  });
});
