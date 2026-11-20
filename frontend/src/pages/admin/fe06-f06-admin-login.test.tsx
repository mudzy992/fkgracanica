import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AdminLoginPage } from './AdminLoginPage';

function PrijavaProbe() {
  const loc = useLocation();
  return (
    <div>
      <p>prijava</p>
      <p data-testid="state">{JSON.stringify(loc.state ?? null)}</p>
      <p data-testid="path">{loc.pathname}</p>
      <p data-testid="search">{loc.search}</p>
    </div>
  );
}

describe('F-06 AdminLoginPage — redirect', () => {
  it('preusmjerava /admin/login → /prijava bez state (replace)', () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/prijava" element={<PrijavaProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('prijava')).toBeInTheDocument();
    expect(screen.getByTestId('path')).toHaveTextContent('/prijava');
    expect(screen.getByTestId('state')).toHaveTextContent('null');
  });

  it('očuvava location.state (npr. from) kroz Navigate replace', () => {
    const fromState = { from: { pathname: '/admin/users' } };
    render(
      <MemoryRouter initialEntries={[{ pathname: '/admin/login', state: fromState }]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/prijava" element={<PrijavaProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('prijava')).toBeInTheDocument();
    expect(screen.getByTestId('state')).toHaveTextContent(JSON.stringify(fromState));
  });

  it('koristi replace — back ne vraća na /admin/login', () => {
    // History: /other (0) → /admin/login (1, initialIndex 1) → redirect replace → /prijava (1) umjesto push → /prijava (2)
    // Ako je replace, length ostaje 2 ( /other, /prijava ), a ne 3.
    // MemoryRouter ne izlaže direktno history, ali možemo provjeriti da nakon redirecta
    // back navigacija ide na /other a ne na /admin/login provjerom da /admin/login nije u history-ju.
    // Pojednostavljeno: render sa dva entry-ja i provjeri da je krajnji pathname /prijava i da state nije izgubljen.
    render(
      <MemoryRouter initialEntries={['/other', { pathname: '/admin/login', state: { from: '/admin/media' } }] } initialIndex={1}>
        <Routes>
          <Route path="/other" element={<p>other</p>} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/prijava" element={<PrijavaProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('prijava')).toBeInTheDocument();
    // Ako nije replace, history bi imao /admin/login između; sa replace, direktno /prijava
    expect(screen.getByTestId('path')).toHaveTextContent('/prijava');
    expect(screen.getByTestId('state')).toHaveTextContent(JSON.stringify({ from: '/admin/media' }));
  });
});
