import { Suspense, type ComponentType } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import i18n from '../../i18n';
import { ErrorBoundary } from './ErrorBoundary';
import { lazyRoute } from './lazy-route';
import { RouteLoading } from './RouteLoading';

describe('lazy ruta', () => {
  it('najavljuje prevedeni status dok se modul učitava, a zatim prikaže sadržaj', async () => {
    let resolve!: (value: { default: ComponentType }) => void;
    const Page = lazyRoute(() => new Promise((done) => { resolve = done; }));
    const { rerender } = render(<Suspense fallback={<RouteLoading />}><Page /></Suspense>);
    expect(screen.getByRole('status')).toHaveTextContent('Učitavanje...');
    try {
      await act(() => i18n.changeLanguage('en'));
      expect(screen.getByRole('status')).toHaveTextContent('Loading...');
      await act(async () => resolve({ default: () => <h1>Učitana stranica</h1> }));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Učitana stranica' })).toBeInTheDocument();
    } finally {
      await act(() => i18n.changeLanguage('bs'));
      rerender(<></>);
    }
  });

  it('neuspjeli import daje poruku za reload i navigacija na drugi URL oporavlja boundary', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Page = lazyRoute(() => Promise.reject(new Error('network')));
    const { rerender } = render(
      <ErrorBoundary resetKey="/admin/news/new"><Suspense fallback={<RouteLoading />}><Page /></Suspense></ErrorBoundary>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Stranicu nije moguće učitati');
    expect(screen.getByRole('button', { name: 'Ponovo učitaj stranicu' })).toBeInTheDocument();
    expect(logged).toHaveBeenCalled();
    rerender(<ErrorBoundary resetKey="/admin"><p>Kontrolna tabla</p></ErrorBoundary>);
    expect(await screen.findByText('Kontrolna tabla')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('obična render greška zadržava postojeći pokušaj bez reloada', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Broken(): never { throw new Error('render error'); }
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Broken /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent(i18n.t('admin.common.error'));
    rerender(<ErrorBoundary resetKey="/a"><p>Oporavljeno</p></ErrorBoundary>);
    await userEvent.click(screen.getByRole('button', { name: 'Pokušaj ponovo' }));
    expect(screen.getByText('Oporavljeno')).toBeInTheDocument();
  });

  it('reload dugme na grešci rute osvježava stranicu', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, reload },
    });
    try {
      const Page = lazyRoute(() => Promise.reject(new Error('mreža')));
      render(<ErrorBoundary resetKey="/x"><Suspense fallback={<RouteLoading />}><Page /></Suspense></ErrorBoundary>);
      expect(await screen.findByRole('alert')).toHaveTextContent('Stranicu nije moguće učitati');
      await userEvent.click(screen.getByRole('button', { name: 'Ponovo učitaj stranicu' }));
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original });
    }
  });
});
