import { describe, expect, it } from 'vitest';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { slugify } from './slugify';
import {
  canCancelOrder,
  canPayOrderOnline,
  canShowSeasonQr,
  canShowTicketQr,
} from './ticketing-status';
import { htmlToParagraphs, stripHtml } from './html-text';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { matchMetaLine, matchStatusKey } from './match-status';

describe('mob-batch02 — P-MOB02 lib parity', () => {
  it('formatDateBs vraća — za null i formatira datum', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    const iso = '2023-12-09T00:00:00.000Z';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const expected = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`;
    expect(formatDateBs(iso)).toBe(expected);
  });

  it('formatDateTimeBs vraća — i datum + vrijeme', () => {
    expect(formatDateTimeBs('')).toBe('—');
    const iso = '2023-06-15T14:05:00.000Z';
    const res = formatDateTimeBs(iso);
    expect(res).not.toBe('—');
    expect(res).toContain('.');
    expect(res).toContain(':');
  });

  it('slugify: dijakritika, razmaci, crtice', () => {
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('Čović & Žabić')).toBe('covic-zabic');
    expect(slugify('  --Hello  World--  ')).toBe('hello-world');
    expect(slugify('')).toBe('');
  });

  it('ticketing canShowTicketQr / canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('PAID')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('EXPIRED')).toBe(false);
  });

  it('canCancelOrder samo pending', () => {
    expect(canCancelOrder({ status: 'pending' })).toBe(true);
    expect(canCancelOrder({ status: 'paid' })).toBe(false);
  });

  it('canPayOrderOnline sve granice', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] })).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID' }] })).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] })).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] })).toBe(false);
  });

  it('stripHtml uklanja tagove, br, p i entitete', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<p>Hello<br>World</p>')).toContain('Hello');
    expect(stripHtml('<p>Hello<br>World</p>')).toContain('World');
    expect(stripHtml('A &amp; B')).toBe('A & B');
    expect(stripHtml('&#65;')).toBe('A');
    expect(stripHtml('&#x41;')).toBe('A');
    expect(stripHtml('&lt;test&gt;')).toBe('<test>');
  });

  it('htmlToParagraphs dijeli po novim linijama', () => {
    expect(htmlToParagraphs('<p>Prvi</p><p>Drugi</p>')).toEqual(['Prvi', 'Drugi']);
    expect(htmlToParagraphs('')).toEqual([]);
  });

  it('computeLiveClock vraća null za ne-LIVE', () => {
    expect(computeLiveClock({ status: 'FINISHED', clockStartedAt: new Date().toISOString(), matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: null, matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: null })).toBeNull();
  });

  it('computeLiveClock računa minute u prvom poluvremenu', () => {
    const startedAt = new Date(Date.now() - 65 * 1000).toISOString();
    const res = computeLiveClock({ status: 'LIVE', clockStartedAt: startedAt, matchPeriod: 'FIRST_HALF' });
    expect(res).not.toBeNull();
    expect(res!.displayMinute).toBe(1);
    expect(res!.periodLabel).toBe('1. poluvrijeme');
  });

  it('computeLiveClock showStoppage kad preko kraja', () => {
    const startedAt = new Date(Date.now() - 50 * 60 * 1000).toISOString();
    const res = computeLiveClock({
      status: 'LIVE',
      clockStartedAt: startedAt,
      matchPeriod: 'FIRST_HALF',
      stoppageFirstHalf: 3,
    });
    expect(res?.showStoppage).toBe(true);
    expect(res?.stoppage).toBe(3);
  });

  it('formatLiveMinute sa i bez clocka', () => {
    expect(formatLiveMinute(null, 5)).toBe("5'");
    const clock = { displayMinute: 45, displaySecond: 5, periodLabel: '1. poluvrijeme', showStoppage: false, stoppage: 0 };
    expect(formatLiveMinute(clock as never)).toBe('45:05');
    const clockStop = { displayMinute: 46, displaySecond: 0, periodLabel: '1. poluvrijeme', showStoppage: true, stoppage: 2 };
    expect(formatLiveMinute(clockStop as never)).toBe('46:00 (+2)');
  });

  it('matchStatusKey fallback na matchScheduled', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('UNKNOWN')).toBe('matchScheduled');
  });

  it('matchMetaLine spaja takmičenje i kolo', () => {
    const roundLabel = (n: number) => `${n}. kolo`;
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 5, name: 'Kolo 5' } }, roundLabel)).toBe('Premijer · 5. kolo');
    expect(matchMetaLine({ season: {}, roundRel: { number: 0, name: 'Kolo X' } }, roundLabel)).toBe('Kolo X');
    expect(matchMetaLine({ season: {}, roundRel: null }, roundLabel)).toBe('');
    expect(matchMetaLine({ season: { competition: { name: undefined } }, roundRel: { number: 3 } }, roundLabel)).toBe('3. kolo');
  });
});
