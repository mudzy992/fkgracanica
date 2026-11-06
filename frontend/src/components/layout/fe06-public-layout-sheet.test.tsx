import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { PublicLayout } from './PublicLayout';

installDialogPolyfill();

const state = vi.hoisted(() => ({
  nav: [] as Array<{ to: string; label: string; external: boolean }>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, d?: string) => d ?? k,
    i18n: { resolvedLanguage: 'bs', changeLanguage: vi.fn(), on: vi.fn(), off: vi.fn() },
  }),
}));
vi.mock('../../hooks', () => ({
  usePublicSettings: () => ({ data: { 'club.name': 'FK Gračanica' } }),
  useModuleFlags: () => ({ data: {} }),
}));
vi.mock('../../hooks/use-dynamic-favicon', () => ({ useDynamicFavicon: () => undefined }));
vi.mock('../../hooks/use-track-public-visit', () => ({ useTrackPublicVisit: () => undefined }));
vi.mock('../../hooks/use-cms-pages', () => ({
  useCmsMenu: () => ({ data: undefined }),
  useCmsPage: () => ({ data: undefined }),
}));
vi.mock('./PublicFooter', () => ({ PublicFooter: () => <div>footer</div> }));
vi.mock('./LanguageSwitcher', () => ({ LanguageSwitcher: () => <div>jezik</div> }));
vi.mock('./PublicSiteLogo', () => ({ PublicSiteLogo: () => <div>logo</div> }));
vi.mock('./PublicAuthButton', () => ({
  PublicAuthButton: ({ onNavigate, mobile }: { onNavigate?: () => void; mobile?: boolean }) => (
    <button onClick={() => onNavigate?.()}>auth-navigiraj-{mobile ? 'mobile' : 'desktop'}</button>
  ),
}));
vi.mock('./PublicNavItems', () => ({
  useFallbackNavItems: () => [{ to: '/', label: 'Početna', external: false }],
  PublicNavItems: ({ items, onNavigate, mobile }: {
    items: Array<{ to: string; label: string; external: boolean }>;
    onNavigate?: () => void; mobile?: boolean;
  }) => {
    state.nav = items;
    return (
      <button onClick={() => onNavigate?.()}>
        nav-navigiraj-{mobile ? 'mobile' : 'desktop'}
      </button>
    );
  },
}));
vi.mock('../search/GlobalSearchDialog', () => ({ GlobalSearchDialog: () => null }));

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<p>sadržaj</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('PublicLayout — mobilni meni', () => {
  it('X u zaglavlju menija zatvara sheet', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    expect(screen.getByRole('button', { name: 'nav-navigiraj-mobile' })).toBeInTheDocument();
    const close = screen.getAllByRole('button', { name: 'actions.close' });
    await user.click(close[close.length - 1]);
    expect(screen.queryByRole('button', { name: 'nav-navigiraj-mobile' })).toBeNull();
  });

  it('navigacija i auth dugme zatvaraju meni', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    await user.click(screen.getByRole('button', { name: 'nav-navigiraj-mobile' }));
    expect(screen.queryByRole('button', { name: 'nav-navigiraj-mobile' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Otvori meni' }));
    await user.click(screen.getByRole('button', { name: 'auth-navigiraj-mobile' }));
    expect(screen.queryByRole('button', { name: 'auth-navigiraj-mobile' })).toBeNull();
  });
});
