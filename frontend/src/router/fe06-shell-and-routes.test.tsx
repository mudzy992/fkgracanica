import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../components/pwa/PwaInstallBanner', () => ({ PwaInstallBanner: () => <p>baner</p> }));
vi.mock('../cms/PageRenderer', () => ({
  PageRenderer: ({ slug }: { slug: string }) => <p>cms:{slug}</p>,
}));
vi.mock('./app-routes', async () => {
  const { Route: R } = await import('react-router-dom');
  return { appRouteElements: <R path="/" element={<p>pocetna</p>} /> };
});

const { RootShell } = await import('./root-shell');
const { HomePage } = await import('../pages/home/HomePage');
const { publicLayoutRoutes } = await import('./public-layout-routes');
const { appRouter } = await import('./index');

describe('ljuska ruta', () => {
  it('RootShell prikazuje outlet i PWA baner', () => {
    const router = createMemoryRouter([
      { element: <RootShell />, children: [{ index: true, element: <p>dijete</p> }] },
    ]);
    render(<RouterProvider router={router} />);
    expect(screen.getByText('dijete')).toBeInTheDocument();
    expect(screen.getByText('baner')).toBeInTheDocument();
  });

  it('HomePage renderuje CMS stranicu "home"', () => {
    render(<HomePage />);
    expect(screen.getByText('cms:home')).toBeInTheDocument();
  });

  it('javni layout ima indeksnu i module rute', () => {
    const children = (publicLayoutRoutes.props as { children: unknown[] }).children;
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBeGreaterThan(5);
    const index = children[0] as { props: { index: boolean } };
    expect(index.props.index).toBe(true);
  });

  it('aplikacijski ruter se gradi iz elemenata ruta', () => {
    expect(appRouter.routes.length).toBeGreaterThan(0);
  });
});
