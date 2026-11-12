import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HomeKpiGrid } from './HomeKpiGrid';
import { HomeQuickActions } from './HomeQuickActions';
import { RoleHomeShell } from './RoleHomeShell';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('RoleHomeShell', () => {
  it('prikazuje SEO, naslov, napomenu i sadržaj', () => {
    wrap(
      <RoleHomeShell seo="Komentator" title="Komentatorska tabla" hint="Kratka pomoć">
        <p>tijelo</p>
      </RoleHomeShell>,
    );
    expect(screen.getByText('seo:Komentator')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Komentatorska tabla' })).toBeInTheDocument();
    expect(screen.getByText('Kratka pomoć')).toBeInTheDocument();
    expect(screen.getByText('tijelo')).toBeInTheDocument();
  });
});

describe('HomeKpiGrid', () => {
  it('prikazuje vrijednosti, napomene i link za stavke sa href', () => {
    wrap(
      <HomeKpiGrid
        items={[
          { key: 'a', label: 'vijesti', value: 4, href: '/admin/news', hint: 'na čekanju' },
          { key: 'b', label: 'posjete', value: '…' },
        ]}
      />,
    );
    expect(screen.getByText('vijesti')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('na čekanju')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/admin/news');
    expect(screen.getByText('admin.home.open')).toBeInTheDocument();
    expect(screen.getByText('posjete')).toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('stavka bez href nema link ni oznaku otvaranja', () => {
    wrap(<HomeKpiGrid items={[{ key: 'x', label: 'bez linka', value: 0 }]} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByText('admin.home.open')).toBeNull();
  });
});

describe('HomeQuickActions', () => {
  it('prikazuje dugmad kao linkove sa podrazumijevanim stilom', () => {
    wrap(
      <HomeQuickActions
        items={[
          { to: '/admin/news', label: 'red vijesti', variant: 'default' },
          { to: '/admin/comms', label: 'sanduče' },
        ]}
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/admin/news', '/admin/comms']);
    expect(screen.getByRole('link', { name: 'red vijesti' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'sanduče' })).toBeInTheDocument();
  });

  it('prazna lista nema dugmadi', () => {
    wrap(<HomeQuickActions items={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
