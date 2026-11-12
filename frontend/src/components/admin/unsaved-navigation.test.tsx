import { StrictMode, useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { AdminFormSheet } from './AdminFormSheet';
import { UnsavedNavigationProvider } from './unsaved-navigation';

installDialogPolyfill();

function Harness({ explicit = false }: { explicit?: boolean }) {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  return (
    <>
      <Link to="/target">Idi dalje</Link>
      <button onClick={() => setFirst(true)}>Prva forma</button>
      <button onClick={() => setSecond(true)}>Druga forma</button>
      <AdminFormSheet open={first} onOpenChange={setFirst} title="Prva" dirty={explicit}>
        {explicit ? <p>Eksplicitni dirty</p> : <label>Prvi <input defaultValue="A" /></label>}
        <button onClick={() => setFirst(false)}>Spremi prvu</button>
      </AdminFormSheet>
      <AdminFormSheet open={second} onOpenChange={setSecond} title="Druga">
        <label>Drugi <input defaultValue="B" /></label>
        <button onClick={() => setSecond(false)}>Spremi drugu</button>
      </AdminFormSheet>
    </>
  );
}

function AsyncHarness() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState('');
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => { setValue('Učitano'); setLoaded(true); }, 10);
    return () => window.clearTimeout(timer);
  }, [open]);
  return (
    <>
      <Link to="/target">Idi dalje</Link>
      <button onClick={() => setOpen(true)}>Otvori kasnu formu</button>
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Kasna forma">
        {loaded ? <label>Kasno polje <input value={value} onChange={(e) => setValue(e.target.value)} /></label> : <p>Učitavanje</p>}
        <button role="switch" aria-checked={enabled} onClick={() => setEnabled(!enabled)}>Uključi</button>
        <button data-dirty-change onClick={() => setValue('Odabrano')}>Učitaj postavu</button>
      </AdminFormSheet>
    </>
  );
}

function setupAsync() {
  const router = createMemoryRouter([{
    element: <UnsavedNavigationProvider><Outlet /></UnsavedNavigationProvider>,
    children: [
      { path: '/', element: <AsyncHarness /> },
      { path: '/target', element: <p>Odredište</p> },
    ],
  }]);
  render(<StrictMode><RouterProvider router={router} /></StrictMode>);
  return router;
}

function setup(explicit = false) {
  const router = createMemoryRouter([{
    element: <UnsavedNavigationProvider><Outlet /></UnsavedNavigationProvider>,
    children: [
      { path: '/', element: <Harness explicit={explicit} /> },
      { path: '/target', element: <p>Odredište</p> },
    ],
  }]);
  render(<StrictMode><RouterProvider router={router} /></StrictMode>);
  return router;
}

describe('SPA zaštita nespremljenih AdminFormSheet formi', () => {
  it('jedan blocker obuhvata više formi; odbijanje čuva podatke, prihvatanje navigira', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const router = setup();
    await user.click(screen.getByRole('button', { name: 'Prva forma' }));
    await user.click(screen.getByRole('button', { name: 'Druga forma' }));
    const second = screen.getByRole('dialog', { name: 'Druga' });
    await user.clear(within(second).getByLabelText('Drugi'));
    await user.type(within(second).getByLabelText('Drugi'), 'Izmjena');
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(router.state.location.pathname).toBe('/');
    expect(within(second).getByLabelText('Drugi')).toHaveValue('Izmjena');
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await screen.findByText('Odredište');
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(router.state.location.pathname).toBe('/target');
  });

  it('uvažava eksplicitni dirty i pri SPA navigaciji i prije unload-a', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = setup(true);
    await user.click(screen.getByRole('button', { name: 'Prva forma' }));
    const event = new Event('beforeunload', { cancelable: true });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(true);
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
    expect(router.state.location.pathname).toBe('/');
  });

  it('nakon uspješnog spremanja/zatvaranja ne upozorava na navigaciju', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm');
    const router = setup();
    await user.click(screen.getByRole('button', { name: 'Druga forma' }));
    const second = screen.getByRole('dialog', { name: 'Druga' });
    await user.clear(within(second).getByLabelText('Drugi'));
    await user.type(within(second).getByLabelText('Drugi'), 'Sačuvano');
    await user.click(within(second).getByRole('button', { name: 'Spremi drugu' }));
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await screen.findByText('Odredište');
    expect(router.state.location.pathname).toBe('/target');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asinhrono učitana ali nedirnuta forma ne upozorava', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm');
    setupAsync();
    await user.click(screen.getByRole('button', { name: 'Otvori kasnu formu' }));
    expect(await screen.findByLabelText('Kasno polje')).toHaveValue('Učitano');
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await screen.findByText('Odredište');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('prati Switch i ne upozorava nakon povratka na početno stanje', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = setupAsync();
    await user.click(screen.getByRole('button', { name: 'Otvori kasnu formu' }));
    expect(await screen.findByLabelText('Kasno polje')).toHaveValue('Učitano');
    const toggle = screen.getByRole('switch', { name: 'Uključi' });
    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
    expect(router.state.location.pathname).toBe('/');
    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await screen.findByText('Odredište');
    expect(confirm).toHaveBeenCalledOnce();
    expect(router.state.location.pathname).toBe('/target');
  });

  it('označena programska akcija koja mijenja formu čuva nespremljene izmjene', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = setupAsync();
    await user.click(screen.getByRole('button', { name: 'Otvori kasnu formu' }));
    expect(await screen.findByLabelText('Kasno polje')).toHaveValue('Učitano');
    await user.click(screen.getByRole('button', { name: 'Učitaj postavu' }));
    await user.click(screen.getByRole('link', { name: 'Idi dalje' }));
    await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
    expect(router.state.location.pathname).toBe('/');
  });

});
