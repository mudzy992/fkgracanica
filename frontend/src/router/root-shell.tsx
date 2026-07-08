import { Outlet, ScrollRestoration } from 'react-router-dom';

export function RootShell() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
