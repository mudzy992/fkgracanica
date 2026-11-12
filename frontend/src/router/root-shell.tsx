import { Outlet, ScrollRestoration } from 'react-router-dom';
import { PwaInstallBanner } from '../components/pwa/PwaInstallBanner';
import { UnsavedNavigationProvider } from '../components/admin/unsaved-navigation';

export function RootShell() {
  return (
    <>
      <ScrollRestoration />
      <UnsavedNavigationProvider>
        <Outlet />
        <PwaInstallBanner />
      </UnsavedNavigationProvider>
    </>
  );
}
