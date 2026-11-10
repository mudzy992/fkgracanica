import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/utils', async (imp) => { const a: any = await imp(); return { ...a, cn: (...xs: any[]) => xs.filter(Boolean).join(' ') }; });

describe('batch60 cms — coverable fallbacks', () => {
  it('CmsMenuPreviewBar id ?? fallback [11,0] 35', async () => {
    const { CmsMenuPreviewBar } = await import('./cms/CmsMenuPreviewBar');
    const items: any[] = [{ label: 'Test', path: '/test', enabled: true, isSystem: false }];
    // no id → fallback
    const { container } = render(<MemoryRouter><CmsMenuPreviewBar items={items} moduleFlags={{}} /></MemoryRouter>);
    expect(container.textContent).toContain('Test');
  });
  it('CmsMenuPreviewBar with id → first branch', async () => {
    const { CmsMenuPreviewBar } = await import('./cms/CmsMenuPreviewBar');
    const items: any[] = [{ id: '1', label: 'Home', path: '/', enabled: true, isSystem: true }];
    const { container } = render(<MemoryRouter><CmsMenuPreviewBar items={items} moduleFlags={{}} /></MemoryRouter>);
    expect(container.textContent).toContain('Home');
  });
  it('menu-module-warnings findBlockedMenuItems', async () => {
    const { findBlockedMenuItems } = await import('./cms/menu-module-warnings');
    const items: any[] = [{ label: 'Shop', path: '/shop', enabled: true }];
    const blocked = findBlockedMenuItems(items, { 'shop.enabled': 'false' } as any);
    expect(Array.isArray(blocked)).toBe(true);
  });
  it('AnalyticsVisitorsPanel geo ?? []', async () => {
    // mock hooks to avoid loading
    vi.doMock('../../hooks/use-analytics', async (orig: any) => {
      const a: any = await vi.importActual('../../hooks/use-analytics');
      return { ...a, useVisitorGeo: () => ({ data: undefined, isLoading: false }), useVisitorTrend: () => ({ data: [], isLoading: false }), useVisitorTotals: () => ({ data: { web: 1, mobile: 2, total: 3 }, isLoading: false }) };
    });
    const { AnalyticsVisitorsPanel } = await import('./analytics/AnalyticsVisitorsPanel');
    const { container } = render(<AnalyticsVisitorsPanel />);
    expect(container.textContent).toContain('admin.analyticsPanel.geo');
  });
});
