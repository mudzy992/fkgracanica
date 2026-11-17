import { describe, expect, it } from 'vitest';
import { canViewKpi, KPI_PERMISSIONS } from './dashboard-kpi-config';
import { hasPermission } from '../../lib/permissions';

describe('dashboard-kpi-config', () => {
  it('dozvoljava KPI bez tražene dozvole', () => {
    expect(canViewKpi('nepoznat', [], hasPermission)).toBe(true);
    expect(canViewKpi('nepoznat', undefined, hasPermission)).toBe(true);
  });

  it('provjerava traženu dozvolu za poznati KPI', () => {
    const key = 'pendingNews'; // news.approve
    expect(KPI_PERMISSIONS[key]).toBe('news.approve');
    expect(canViewKpi(key, ['news.approve'], hasPermission)).toBe(true);
    expect(canViewKpi(key, [], hasPermission)).toBe(false);
    expect(canViewKpi(key, undefined, hasPermission)).toBe(false);
  });

  it('pokriva sve KPI ključeve iz mape', () => {
    for (const [key, perm] of Object.entries(KPI_PERMISSIONS)) {
      expect(canViewKpi(key, [perm], hasPermission)).toBe(true);
      expect(canViewKpi(key, [], hasPermission)).toBe(false);
    }
  });
});
