import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PublicNavItems, useFallbackNavItems } from './PublicNavItems';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));

const renderNav = (props: Parameters<typeof PublicNavItems>[0], url = '/') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <PublicNavItems {...props} />
    </MemoryRouter>,
  );

const items = [
  { to: '/', label: 'Početna' },
  { to: '/vijesti', label: 'Vijesti' },
  { to: 'https://ffbih.ba', label: 'Savez', external: true },
];

describe('PublicNavItems', () => {
  it('interne stavke renderuje kao linkove sa aktivnom klasom na trenutnoj ruti', () => {
    renderNav({ items }, '/vijesti');
    const news = screen.getByRole('link', { name: 'Vijesti' });
    expect(news.getAttribute('href')).toBe('/vijesti');
    expect(news.className).toContain('nav-link-active');
    expect(screen.getByRole('link', { name: 'Početna' }).className).not.toContain('nav-link-active');
  });

  it('eksterne stavke otvara u novom tabu i zove onNavigate', async () => {
    const onNavigate = vi.fn();
    renderNav({ items, onNavigate });
    const external = screen.getByRole('link', { name: 'Savez' });
    expect(external.getAttribute('href')).toBe('https://ffbih.ba');
    expect(external.getAttribute('target')).toBe('_blank');
    expect(external.getAttribute('rel')).toBe('noreferrer');
    await userEvent.click(external);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('premium varijanta koristi premium klase i mobilni raspored', () => {
    renderNav({ items, mobile: true, premium: true }, '/vijesti');
    const news = screen.getByRole('link', { name: 'Vijesti' });
    expect(news.className).toContain('nav-link-premium-active');
    expect(news.className).toContain('!normal-case');
    const home = screen.getByRole('link', { name: 'Početna' });
    expect(home.className).toContain('nav-link-premium');
    expect(home.className).not.toContain('nav-link-premium-active');
  });
});

function FallbackProbe({ settings }: { settings?: Record<string, string> }) {
  const links = useFallbackNavItems(settings);
  return (
    <ul>
      {links.map((link) => (
        <li key={link.to} data-external={String(link.external)}>
          {link.to}:{link.label}
        </li>
      ))}
    </ul>
  );
}

describe('useFallbackNavItems', () => {
  it('bez podešavanja vraća sve stavke sa prevedenim nazivima', () => {
    render(<FallbackProbe />);
    const entries = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(entries).toHaveLength(9);
    expect(entries[0]).toBe('/:t:nav.home');
    expect(screen.getAllByRole('listitem')[0].getAttribute('data-external')).toBe('false');
  });

  it('filtrira stavke čiji je modul isključen', () => {
    render(<FallbackProbe settings={{ 'modules.news': 'false', 'modules.gallery': 'false' }} />);
    const entries = screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
    expect(entries.some((entry) => entry.startsWith('/vijesti'))).toBe(false);
    expect(entries.some((entry) => entry.startsWith('/galerija'))).toBe(false);
    expect(entries.some((entry) => entry.startsWith('/tim'))).toBe(true);
    expect(entries).toHaveLength(7);
  });
});
