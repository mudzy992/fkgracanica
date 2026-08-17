import { Outlet, ScrollRestoration } from 'react-router-dom';
import { PwaInstallBanner } from '../components/pwa/PwaInstallBanner';

export function RootShell() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
      <PwaInstallBanner />
    </>
  );
}
