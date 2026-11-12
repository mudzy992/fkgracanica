import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminLoginPage } from './AdminLoginPage';
import { PercentRing } from './platform-status/PercentRing';
import { StatusGroupCard } from './platform-status/StatusGroupCard';
import { PlatformStatusTeaser } from './platform-status/PlatformStatusTeaser';

const state = vi.hoisted(() => ({
  connected: true,
  permissions: [] as string[] | undefined,
  status: null as unknown,
  values: { home: 0, away: 0 },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../hooks/use-realtime-connected', () => ({
  useRealtimeConnected: () => state.connected,
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../hooks/use-platform-status', () => ({
  usePlatformStatus: () => ({ data: state.status }),
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('AdminLoginPage', () => {
  it('preusmjerava na /prijava', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/prijava" element={<p>prijava</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('prijava')).toBeInTheDocument();
  });
});

describe('PercentRing', () => {
  it('prikazuje procenat i prsten sa pomakom', () => {
    const { container } = render(<PercentRing percent={42} size={80} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(Number(circles[1].getAttribute('stroke-dashoffset'))).toBeGreaterThan(0);
  });

  it('sto posto zatvara prsten', () => {
    const { container } = render(<PercentRing percent={100} />);
    expect(Number(container.querySelectorAll('circle')[1].getAttribute('stroke-dashoffset'))).toBe(0);
    expect(container.querySelector('p')?.className).toContain('text-2xl');
  });

  it('manji prsten ima manju labelu', () => {
    const { container } = render(<PercentRing percent={10} size={72} />);
    expect(container.querySelector('p')?.className).toContain('text-sm');
  });
});

describe('StatusGroupCard', () => {
  const mod = {
    id: 'm1',
    title: 'Pregled utakmica',
    percent: 75,
    badge: 'ready' as const,
    surfaces: ['web', 'admin'] as const,
    summary: 'Kratak sažetak',
  };

  it('prikazuje modul sa procentom, površinama i sažetkom', () => {
    render(<StatusGroupCard label="Agenti" modules={[mod as never]} />);
    expect(screen.getByText('Agenti')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Pregled utakmica')).toBeInTheDocument();
    expect(screen.getByText('Web · Admin')).toBeInTheDocument();
    expect(screen.getByText('Kratak sažetak')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('prazna grupa prikazuje poruku', () => {
    render(<StatusGroupCard label="Prazno" modules={[]} />);
    expect(screen.getByText('t:admin.stanjeEmpty')).toBeInTheDocument();
  });
});

describe('PlatformStatusTeaser', () => {
  it('bez dozvole ne renderira ništa', () => {
    const { container } = render(<PlatformStatusTeaser />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sa dozvolom ali bez podataka ne renderira ništa', () => {
    state.permissions = ['dashboard.read'];
    const { container } = render(<PlatformStatusTeaser />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sa podacima prikazuje karticu sa procentom i linkom', () => {
    state.permissions = ['dashboard.read'];
    state.status = { overallPercent: 61 };
    wrap(<PlatformStatusTeaser />);
    expect(screen.getByText('t:admin.stanje')).toBeInTheDocument();
    expect(screen.getByText('61%')).toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/admin/stanje');
  });
});
