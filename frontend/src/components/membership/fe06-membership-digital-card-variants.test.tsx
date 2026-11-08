import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MembershipDigitalCard, toMembershipCardData } from './MembershipDigitalCard';

/** Batch 34 — grb na kartici i pretvaranje podataka bez datuma (odvojeno zbog limita dužine). */
vi.mock('../pass/PassQrCode', () => ({
  PassQrCode: ({ value, label }: { value: string; label?: string }) => (
    <div data-testid="qr">{`${label}:${value}`}</div>
  ),
}));

describe('MembershipDigitalCard — grb i nedostajući datum (batch 34)', () => {
  it('sa grbom prikazuje sliku umjesto oznake FK', () => {
    const { container } = render(
      <MembershipDigitalCard
        data={{
          memberName: 'Sa Grbom',
          clubName: 'FK Gračanica',
          crestUrl: 'mediji/grb.png',
          cardNumber: 'CG-3',
          status: 'ACTIVE',
          validUntil: '31.12.2026.',
          qrValue: 'qr-3',
        }}
      />,
    );
    expect(container.querySelector('img')).not.toBeNull();
    expect(screen.queryByText('FK')).toBeNull();
  });

  it('pretvaranje podataka bez grba i bez datuma koristi praznine', () => {
    expect(
      toMembershipCardData({
        memberName: 'Bez Grba',
        clubName: 'FK Gračanica',
        cardNumber: 'CG-4',
        status: 'ACTIVE',
        endDate: null,
        qrCode: 'qr-4',
      }),
    ).toEqual({
      memberName: 'Bez Grba',
      clubName: 'FK Gračanica',
      crestUrl: undefined,
      cardNumber: 'CG-4',
      status: 'ACTIVE',
      validUntil: '—',
      qrValue: 'qr-4',
    });
  });

  it('pretvaranje podataka sa grbom i datumom popunjava oba polja', () => {
    const data = toMembershipCardData({
      memberName: 'Sa Grbom',
      clubName: 'FK Gračanica',
      crestUrl: 'mediji/grb.png',
      cardNumber: 'CG-5',
      status: 'ACTIVE',
      endDate: '2026-12-31T00:00:00.000Z',
      qrCode: 'qr-5',
    });
    expect(data.crestUrl).toBeTruthy();
    expect(data.validUntil).not.toBe('—');
  });
});
