import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MembershipRow } from '../../types/membership';
import { MemberHomeStrip } from './MemberHomeStrip';

const state = vi.hoisted(() => ({
  memberships: undefined as MembershipRow[] | undefined,
  next: null as Record<string, unknown> | null,
  unread: undefined as { data: unknown[]; meta?: { total: number } } | undefined,
}));

vi.mock('../../hooks/use-membership', () => ({ useMyMembership: () => ({ data: state.memberships }) }));
vi.mock('../../hooks/use-notifications', () => ({ useNotifications: () => ({ data: state.unread }) }));
vi.mock('../../hooks/use-ticketing', () => ({ useNextHomeMatch: () => ({ data: state.next }) }));

const renderStrip = () =>
  render(
    <MemoryRouter>
      <MemberHomeStrip />
    </MemoryRouter>,
  );

const membership = (over: Partial<MembershipRow>): MembershipRow => ({
  id: 'm1',
  status: 'ACTIVE',
  ...over,
});

describe('MemberHomeStrip', () => {
  beforeEach(() => {
    state.memberships = undefined;
    state.next = null;
    state.unread = undefined;
  });

  it('bez podataka prikazuje početna stanja', () => {
    renderStrip();
    expect(screen.getByText('Niste član')).toBeTruthy();
    expect(screen.getByText('Digitalna kartica nakon aktivacije')).toBeTruthy();
    expect(screen.getByText('Nema zakazane utakmice')).toBeTruthy();
    expect(screen.getByText('Ulaznice kad bude raspored')).toBeTruthy();
    expect(screen.getByText('Nepročitane — zvono u headeru')).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/ulaznice');
  });

  it('prioritet ima aktivno članstvo i broj kartice', () => {
    state.memberships = [
      membership({ id: 'm2', status: 'PENDING' }),
      membership({ id: 'm1', status: 'ACTIVE', card: { id: 'c', cardNumber: 'CG-2026-001', qrCode: 'q', issuedAt: '2026-01-01' } }),
    ];
    renderStrip();
    expect(screen.getByText('Aktivno')).toBeTruthy();
    expect(screen.getByText('Kartica CG-2026-001')).toBeTruthy();
  });

  it('bez aktivnog uzima članstvo na čekanju', () => {
    state.memberships = [
      membership({ id: 'm3', status: 'CANCELLED' }),
      membership({ id: 'm2', status: 'PENDING' }),
    ];
    renderStrip();
    expect(screen.getByText('Na čekanju')).toBeTruthy();
  });

  it('bez aktivnog i na čekanju uzima prvo članstvo', () => {
    state.memberships = [membership({ id: 'm3', status: 'EXPIRED' })];
    renderStrip();
    expect(screen.getByText('Isteklo')).toBeTruthy();
  });

  it('sa zakazanom utakmicom vodi na detalj i prikazuje oba kluba', () => {
    state.next = {
      id: 'match-7',
      scheduledAt: '2026-05-10T17:00:00.000Z',
      homeClub: { name: 'FK Gračanica' },
      awayClub: { name: 'FK Slavija' },
    };
    renderStrip();
    expect(screen.getByText('FK Gračanica – FK Slavija')).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/utakmice/match-7');
  });

  it('bez imena klubova koristi zamjenske nazive', () => {
    state.next = { id: 'match-8', scheduledAt: '2026-05-10T17:00:00.000Z' };
    renderStrip();
    expect(screen.getByText('Domaćin – Gost')).toBeTruthy();
  });

  it('broj nepročitanih uzima iz meta.total', () => {
    state.unread = { data: [{}, {}], meta: { total: 5 } };
    renderStrip();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('meta.total ima prednost i kad je nula', () => {
    state.unread = { data: [{}, {}], meta: { total: 0 } };
    renderStrip();
    expect(screen.getByText('0')).toBeTruthy();
  });
});
