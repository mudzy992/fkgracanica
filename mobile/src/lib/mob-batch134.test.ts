import { describe, expect, it } from 'vitest';
import { deskCounts, filterCommentatorDesk } from './desk-counts';
import { brand, colors, darkColors, spacing, typography } from './theme';
import { kpiLabel } from './dashboard-kpi-labels';

describe('mob-batch134 — P-MOB47 desk/theme (test-only)', () => {
  it('deskCounts live/halftime', () => {
    expect(deskCounts([{ status: 'LIVE' } as any]).live).toBe(1);
    expect(deskCounts([{ status: 'HALFTIME' } as any]).live).toBe(1);
    expect(deskCounts([{ status: 'SCHEDULED' } as any]).scheduled).toBe(1);
  });
  it('deskCounts reports only pending approval', () => {
    expect(deskCounts([{ status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' } as any]).reports).toBe(1);
    expect(deskCounts([{ status: 'FINISHED', reportStatus: 'APPROVED' } as any]).reports).toBe(0);
    expect(deskCounts([{ status: 'LIVE', reportStatus: 'PENDING_APPROVAL' } as any]).reports).toBe(0);
  });
  it('deskCounts combined', () => {
    const c = deskCounts([
      { status: 'LIVE' },
      { status: 'HALFTIME' },
      { status: 'SCHEDULED' },
      { status: 'SCHEDULED' },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
    ] as any);
    expect(c).toEqual({ live: 2, scheduled: 2, reports: 1 });
  });
  it('filterCommentatorDesk live always included', () => {
    const m = [{ status: 'LIVE' } as any];
    expect(filterCommentatorDesk(m)).toHaveLength(1);
    expect(filterCommentatorDesk([{ status: 'HALFTIME' } as any])).toHaveLength(1);
  });
  it('filterCommentatorDesk today scheduled only', () => {
    const today = new Date().toISOString();
    expect(filterCommentatorDesk([{ status: 'SCHEDULED', scheduledAt: today } as any])).toHaveLength(1);
    expect(filterCommentatorDesk([{ status: 'SCHEDULED', scheduledAt: '2000-01-01T00:00:00Z' } as any])).toHaveLength(0);
    expect(filterCommentatorDesk([{ status: 'SCHEDULED' } as any])).toHaveLength(0);
  });
  it('filterCommentatorDesk report pending only', () => {
    expect(filterCommentatorDesk([{ status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' } as any])).toHaveLength(1);
    expect(filterCommentatorDesk([{ status: 'FINISHED', reportStatus: 'APPROVED' } as any])).toHaveLength(0);
    expect(filterCommentatorDesk([{ status: 'FINISHED' } as any])).toHaveLength(0);
  });
  it('filterCommentatorDesk mixed filter', () => {
    const today = new Date().toISOString();
    const input = [
      { status: 'LIVE' },
      { status: 'SCHEDULED', scheduledAt: today },
      { status: 'FINISHED', reportStatus: 'PENDING_APPROVAL' },
      { status: 'SCHEDULED', scheduledAt: '2000-01-01T00:00:00Z' },
    ] as any;
    expect(filterCommentatorDesk(input)).toHaveLength(3);
  });
  it('brand colors correct hex', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.primaryLight).toBe('#93C5FD');
    expect(brand.accent).toBe('#2563EB');
    expect(brand.white).toBe('#FFFFFF');
    expect(brand.success).toBe('#16A34A');
    expect(brand.danger).toBe('#DC2626');
  });
  it('darkColors extends brand', () => {
    expect(darkColors.primary).toBe(brand.primary);
    expect(darkColors.primaryLight).toBe(brand.primaryLight);
    expect(darkColors.accent).toBe(brand.accent);
    expect(darkColors.white).toBe(brand.white);
  });
  it('darkColors dark palette values', () => {
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.surface).toBe('#0A1525');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(darkColors.textMuted).toBe('#94A3B8');
    expect(darkColors.border).toBe('#334155');
    expect(darkColors.headerBg).toBe('#050A14');
    expect(darkColors.link).toBe('#93C5FD');
  });
  it('colors alias darkColors', () => {
    expect(colors).toBe(darkColors);
    expect(colors.background).toBe(darkColors.background);
  });
  it('spacing values', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(32);
  });
  it('typography display title heading body caption', () => {
    expect(typography.display.fontSize).toBe(34);
    expect(typography.title.fontSize).toBe(24);
    expect(typography.heading.fontSize).toBe(18);
    expect(typography.body.fontSize).toBe(16);
    expect(typography.caption.fontSize).toBe(13);
  });
  it('kpiLabel maps correctly', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('matches')).toBe('Utakmice');
    expect(kpiLabel('unknown')).toBe('unknown');
    expect(kpiLabel('pendingLive')).toBe('Live izvještaji');
  });
  it('filterCommentatorDesk respects isSameDay with now', () => {
    const now = new Date();
    const iso = now.toISOString();
    const tomorrow = new Date(now.getTime() + 86400000).toISOString();
    expect(filterCommentatorDesk([{ status: 'SCHEDULED', scheduledAt: iso } as any])).toHaveLength(1);
    expect(filterCommentatorDesk([{ status: 'SCHEDULED', scheduledAt: tomorrow } as any])).toHaveLength(0);
  });
});
