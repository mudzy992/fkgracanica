import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() }, Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('./api', () => ({ api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';
import { filterEntityHits } from '../components/writer/entity-search';
describe('mob-batch45 — P-MOB45 ticketing/entity', () => {
  it('canShowTicketQr', () => { expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true); expect(canShowTicketQr('PAID')).toBe(false); });
  it('canPayOrderOnline pending svi RESERVED', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
  });
  it('canCancelOrder', () => { expect(canCancelOrder({ status: 'pending' })).toBe(true); expect(canCancelOrder({ status: 'PAID' })).toBe(false); });
  it('canShowSeasonQr', () => { expect(canShowSeasonQr('ACTIVE')).toBe(true); expect(canShowSeasonQr('EXPIRED')).toBe(false); });
  it('filterEntityHits prazan upit', () => {
    const items = Array.from({ length: 45 }, (_, i) => ({ id: `${i}`, label: `Item ${i}` }));
    expect(filterEntityHits(items, '').length).toBe(40);
  });
  it('filterEntityHits pretraga', () => {
    expect(filterEntityHits([{ id: '1', label: 'Edin' } as any, { id: '2', label: 'Messi' } as any], 'edin').length).toBe(1);
  });
  it('canPayOrderOnline edge', () => { expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] as any })).toBe(true); });
  it('canShowTicketQr case', () => { expect(canShowTicketQr('paid_at_box_office')).toBe(false); });
  it('canCancelOrder pending', () => { expect(canCancelOrder({ status: 'pending' })).toBe(true); });
  it('canShowSeasonQr ACTIVE', () => { expect(canShowSeasonQr('ACTIVE')).toBe(true); });
  it('filterEntityHits slice', () => {
    const items = [{ id: '1', label: 'a' }, { id: '2', label: 'b' }] as any;
    expect(filterEntityHits(items, 'a')).toEqual([items[0]]);
  });
});
