import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroWidget } from './HeroWidget';

/**
 * Batch 34 — `prefers-reduced-motion` isključuje početna stanja animacija
 * (granje `reduce ? false : 'hidden'`) i konfiguracija bez `backgroundDisplay`.
 */
const state = vi.hoisted(() => ({
  matches: { data: undefined as unknown },
  settings: { data: undefined as unknown },
}));

const motionTags = new Set([
  'div', 'h1', 'h2', 'p', 'span', 'section', 'header', 'article', 'img', 'a', 'ul', 'li',
]);
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        motionTags.has(tag)
          ? (props: Record<string, unknown>) => {
              const Tag = tag as React.ElementType;
              const rest = { ...props };
              delete rest.children;
              return <Tag {...rest}>{props.children as React.ReactNode}</Tag>;
            }
          : undefined,
    },
  ),
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => 0,
}));

vi.mock('../../hooks', () => ({
  useMatches: () => state.matches,
  usePublicSettings: () => state.settings,
}));
vi.mock('../../lib/utils', () => ({
  cn: (...values: Array<string | undefined>) => values.filter(Boolean).join(' '),
  formatDateTime: (value: string) => `dt:${value}`,
}));

beforeEach(() => {
  state.matches = { data: [] };
  state.settings = { data: { 'club.name': 'FK Gračanica' } };
});

const wrap = (config: Record<string, unknown>) =>
  render(
    <MemoryRouter>
      <HeroWidget config={{ title: 'FK Gračanica', buttons: [], ...config } as never} />
    </MemoryRouter>,
  );

describe('HeroWidget — smanjeno kretanje (batch 34)', () => {
  it('bez `backgroundDisplay` koristi prikaz „all“', () => {
    const { container } = wrap({ backgroundImage: 'mediji/pozadina.jpg' });
    expect(screen.getByRole('heading', { level: 1, name: 'FK Gračanica' })).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('prikazuje godinu, podnaslov i dugmad bez početnog stanja animacije', () => {
    wrap({
      backgroundDisplay: 'all',
      foundedYear: '1932',
      subtitle: 'Ponos Gračanice',
      buttons: [
        { label: 'Ulaznice', url: '/ulaznice', variant: 'default' },
        { label: 'Klub', url: '/klub', variant: 'outline' },
      ],
    });
    expect(screen.getByText('Osnovan 1932. godine')).toBeInTheDocument();
    expect(screen.getByText('Ponos Gračanice')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ulaznice/ })).toHaveAttribute('href', '/ulaznice');
    expect(screen.getByRole('link', { name: /Klub/ })).toHaveAttribute('href', '/klub');
  });

  it('bez svega osim naslova nema značke ni podnaslova', () => {
    wrap({ backgroundDisplay: 'none' });
    expect(screen.queryByText(/Osnovan/)).toBeNull();
    expect(screen.queryAllByRole('paragraph')).toHaveLength(0);
    expect(screen.getByRole('heading', { level: 1, name: 'FK Gračanica' })).toBeInTheDocument();
  });
});
