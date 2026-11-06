import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CmsMenuPreviewBar } from './CmsMenuPreviewBar';
import type { MenuDraftItem } from './menu-utils';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const item = (over: Partial<MenuDraftItem>): MenuDraftItem =>
  ({ id: 'i1', label: 'Početna', path: '/', enabled: true, ...over }) as MenuDraftItem;

const renderBar = (items: MenuDraftItem[], moduleFlags?: Record<string, string>) =>
  render(
    <MemoryRouter>
      <CmsMenuPreviewBar items={items} moduleFlags={moduleFlags} />
    </MemoryRouter>,
  );

describe('CmsMenuPreviewBar', () => {
  it('bez aktivnih stavki prikazuje poruku', () => {
    renderBar([item({ enabled: false })]);
    expect(screen.getByText('admin.cmsMenu.noActiveItems')).toBeTruthy();
  });

  it('prikazuje samo aktivne stavke sa href-om', () => {
    renderBar([
      item({ id: 'a', label: 'Početna', path: '/' }),
      item({ id: 'b', label: 'Vijesti', path: '/vijesti' }),
      item({ id: 'c', label: 'Skriveno', path: '/skriveno', enabled: false }),
    ]);
    expect(screen.getByText('Početna')).toBeTruthy();
    expect(screen.getByText('Vijesti')).toBeTruthy();
    expect(screen.queryByText('Skriveno')).toBeNull();
    expect(screen.getByText('(/)')).toBeTruthy();
    expect(screen.getByText('(/vijesti)')).toBeTruthy();
  });

  it('vanjski link koristi vanjski URL', () => {
    renderBar([item({ label: 'Shop', path: '/x', externalUrl: 'https://shop.example' })]);
    expect(screen.getByText('(https://shop.example)')).toBeTruthy();
  });

  it('bez pathe i vanjskog URL-a koristi korijen', () => {
    renderBar([item({ path: '' })]);
    expect(screen.getByText('(/)')).toBeTruthy();
  });

  it('sistemska stavka ima primarnu boju', () => {
    const { container } = renderBar([item({ isSystem: true })]);
    expect(container.querySelector('.bg-primary\\/10')).toBeTruthy();
  });

  it('obična stavka ima bijelu pozadinu', () => {
    const { container } = renderBar([item({ isSystem: false })]);
    expect(container.querySelector('.bg-white')).toBeTruthy();
  });

  it('ugašen modul prikazuje upozorenje sa brojem stavki i linkom na postavke', () => {
    renderBar(
      [
        item({ id: 'a', label: 'Vijesti', path: '/vijesti' }),
        item({ id: 'b', label: 'Galerija', path: '/galerija' }),
      ],
      { 'modules.news': 'false', 'modules.gallery': 'false' },
    );
    expect(
      screen.getByText('2 aktivne stavke neće se prikazati na javnoj stranici'),
    ).toBeTruthy();
    const warning = screen.getByRole('status');
    expect(within(warning).getAllByText(/Vijesti/).length).toBeGreaterThan(0);
    expect(within(warning).getAllByText(/Galerija/).length).toBeGreaterThan(0);
    expect(within(warning).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Postavke → Moduli' }).getAttribute('href')).toBe(
      '/admin/settings',
    );
  });

  it('jedna blokirana stavka koristi jedninu i oznaku skriveno', () => {
    renderBar([item({ label: 'Vijesti', path: '/vijesti' })], { 'modules.news': 'false' });
    expect(
      screen.getByText('Jedna aktivna stavka neće se prikazati na javnoj stranici'),
    ).toBeTruthy();
    expect(screen.getByText('skriveno')).toBeTruthy();
  });

  it('ugašen modul samo na isključenoj stavki ne prikazuje upozorenje', () => {
    renderBar([item({ label: 'Vijesti', path: '/vijesti', enabled: false })], {
      'modules.news': 'false',
    });
    expect(screen.queryByText(/neće se prikazati/)).toBeNull();
  });

  it('ruta bez modula nikad nije blokirana', () => {
    renderBar([item({ label: 'Kontakt', path: '/nepoznato' })], { 'modules.news': 'false' });
    expect(screen.queryByText(/neće se prikazati/)).toBeNull();
  });

  it('vanjski link nije blokiran ni kad su moduli ugašeni', () => {
    renderBar([item({ label: 'Shop', path: '/', externalUrl: 'https://shop.example' })], {
      'modules.news': 'false',
    });
    expect(screen.queryByText(/neće se prikazati/)).toBeNull();
  });
});
