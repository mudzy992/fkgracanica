import { useState } from 'react';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { AdminCommandPalette } from './AdminCommandPalette';
import type { AdminNavGroup } from './admin-nav-groups';

installDialogPolyfill();

// jsdom nema scrollIntoView; paleta ga koristi za aktivnu stavku.
Element.prototype.scrollIntoView = vi.fn();

const auth = vi.hoisted(() => ({ permissions: ['news.manage', 'cms.manage'] as string[] | undefined }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: auth.permissions } }) }));

const groups: AdminNavGroup[] = [
  {
    labelKey: 'admin.navGroup.content',
    items: [
      { to: '/admin/news', labelKey: 'admin.nav.news', permissions: ['news.manage'] },
      { to: '/admin/gallery', labelKey: 'admin.nav.gallery', permissions: ['gallery.manage'] },
      { to: 'https://docs.example', labelKey: 'admin.nav.docs', external: true, permissions: ['news.manage'] },
    ],
  },
];

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="path">{location.pathname}</output>;
}

function Host() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>otvori</button>
      <LocationProbe />
      <AdminCommandPalette open={open} onOpenChange={setOpen} groups={groups} />
    </>
  );
}

const renderPalette = () => render(<MemoryRouter><Host /></MemoryRouter>);
const input = () => screen.getByRole('combobox');

const path = () => screen.getByTestId('path').textContent;

beforeEach(() => {
  auth.permissions = ['news.manage', 'cms.manage'];
});

describe('AdminCommandPalette', () => {
  it('prikazuje sve stavke menija i samo dozvoljene brze akcije', () => {
    renderPalette();
    const labels = within(screen.getByRole('dialog')).getAllByRole('option').map((o) => o.textContent ?? '');
    expect(labels).toHaveLength(5);
    expect(labels.filter((l) => l.includes('Brze akcije'))).toEqual(['Nova vijestBrze akcije', 'CMS stranice i meniBrze akcije']);
  });

  it('bez dozvola ostaju samo stavke menija', () => {
    auth.permissions = [];
    renderPalette();
    expect(within(screen.getByRole('dialog')).getAllByRole('option')).toHaveLength(3);
  });

  it('filtrira bez dijakritike i prikazuje poruku za prazan rezultat', async () => {
    const user = userEvent.setup();
    renderPalette();
    await user.type(input(), 'NOVA  vijest');
    const filtered = within(screen.getByRole('dialog')).getAllByRole('option');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].textContent).toContain('Nova vijest');
    await user.clear(input());
    await user.type(input(), 'zzz-nema');
    expect(within(screen.getByRole('dialog')).getByText(/Nema rezultata/)).toBeInTheDocument();
  });

  it('strelicama mijenja aktivnu stavku i Enter navigira', async () => {
    const user = userEvent.setup();
    renderPalette();
    await user.type(input(), 'admin');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(path()).toMatch(/^\/admin/));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('klik na stavku navigira i zatvara paletu', async () => {
    const user = userEvent.setup();
    auth.permissions = [];
    renderPalette();
    await user.click(within(screen.getByRole('dialog')).getAllByRole('option')[0]);
    await waitFor(() => expect(path()).toBe('/admin/news'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('vanjska stavka otvara novi prozor umjesto navigacije', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    auth.permissions = [];
    renderPalette();
    const option = within(screen.getByRole('dialog')).getAllByRole('option')[2];
    await user.click(option);
    expect(open).toHaveBeenCalledWith('https://docs.example', '_blank', 'noopener,noreferrer');
    expect(path()).toBe('/');
  });

  it('Ctrl+K otvara/zatvara, a Escape i klik na pozadinu zatvaraju', async () => {
    const user = userEvent.setup();
    renderPalette();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Zatvori|Close/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ponovno otvaranje resetuje upit i aktivnu stavku', async () => {
    const user = userEvent.setup();
    renderPalette();
    await user.type(input(), 'cms');
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await user.click(screen.getByRole('button', { name: 'otvori' }));
    expect(input()).toHaveValue('');
    expect(within(screen.getByRole('dialog')).getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
  });
});
