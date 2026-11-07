import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrackPublicVisit } from './use-track-public-visit';
import { PlatformStatusTeaser } from '../pages/admin/platform-status/PlatformStatusTeaser';
import { MuseumFilters } from '../components/public/museum/MuseumFilters';

const state = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({}),
  sent: false,
  user: null as unknown,
  status: null as unknown,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../lib/api', () => ({
  api: { post: (...args: unknown[]) => state.post(...args) },
}));
vi.mock('../lib/visitor-identity', () => ({
  getOrCreateVisitorId: () => 'vid-1',
  markVisitSent: () => {
    state.sent = true;
  },
  wasVisitSentThisSession: () => state.sent,
}));
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('./use-platform-status', () => ({
  usePlatformStatus: () => ({ data: state.status }),
}));
vi.mock('../components/public/shell/WidgetSectionShell', () => ({
  WidgetSectionShell: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));
vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...rest}>{children}</div>
  ) },
  useReducedMotion: () => true,
}));

beforeEach(() => {
  state.post = vi.fn().mockResolvedValue({});
  state.sent = false;
  state.user = null;
  state.status = null;
});

describe('useTrackPublicVisit', () => {
  it('šalje posjetu jednom i označava sesiju', () => {
    renderHook(() => useTrackPublicVisit());
    expect(state.post).toHaveBeenCalledWith('/public-analytics/visit', {
      platform: 'web',
      visitorId: 'vid-1',
    });
    expect(state.sent).toBe(true);
  });

  it('ne šalje ponovo u istoj sesiji', () => {
    state.sent = true;
    renderHook(() => useTrackPublicVisit());
    expect(state.post).not.toHaveBeenCalled();
  });

  it('greška mreže se ne propagira', async () => {
    state.post = vi.fn().mockRejectedValue(new Error('offline'));
    renderHook(() => useTrackPublicVisit());
    expect(state.post).toHaveBeenCalledTimes(1);
  });
});

describe('PlatformStatusTeaser', () => {
  it('bez dozvole ne renderira ništa', () => {
    const { container } = render(<PlatformStatusTeaser />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sa dozvolom i podacima prikazuje procenat i link', () => {
    state.user = { permissions: ['dashboard.read'] };
    state.status = { overallPercent: 64 };
    render(
      <MemoryRouter>
        <PlatformStatusTeaser />
      </MemoryRouter>,
    );
    expect(screen.getByText('64%')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/admin/stanje');
    expect(screen.getByText('t:admin.stanjeTeaser')).toBeInTheDocument();
  });

  it('bez podataka ne renderira ništa', () => {
    state.user = { permissions: ['dashboard.read'] };
    const { container } = render(<PlatformStatusTeaser />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('MuseumFilters', () => {
  const setup = (over: Record<string, unknown> = {}) => {
    const onYear = vi.fn();
    const onCategory = vi.fn();
    render(
      <MuseumFilters
        years={[1999, 2005]}
        categories={['TROPHY', 'DOCUMENT']}
        categoryLabel={(c) => `kat-${c}`}
        onYear={onYear}
        onCategory={onCategory}
        {...over}
      />,
    );
    return { onYear, onCategory };
  };

  it('prikazuje godine i emituje odabir', async () => {
    const { onYear } = setup();
    await userEvent.click(screen.getByRole('button', { name: '2005' }));
    expect(onYear).toHaveBeenCalledWith(2005);
    await userEvent.click(screen.getByRole('button', { name: 'Sve godine' }));
    expect(onYear).toHaveBeenLastCalledWith(undefined);
  });

  it('kategorije se prikazuju samo kad ih ima', async () => {
    const { onCategory } = setup({ category: 'TROPHY' });
    expect(screen.getByRole('button', { name: 'kat-TROPHY' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'kat-DOCUMENT' }));
    expect(onCategory).toHaveBeenCalledWith('DOCUMENT');
    await userEvent.click(screen.getByRole('button', { name: 'Sve kategorije' }));
    expect(onCategory).toHaveBeenLastCalledWith(undefined);
  });

  it('bez kategorija nema drugog reda', () => {
    setup({ categories: [] });
    expect(screen.queryByText('Sve kategorije')).toBeNull();
  });
});
