import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

const mockUser = { current: { permissions: ['users.read'] as string[] } };
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: mockUser.current }),
}));

import { PermissionRoute } from './PermissionRoute';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<p>admin home</p>} />
        <Route element={<PermissionRoute permission="audit.read" />}>
          <Route path="/admin/audit" element={<p>audit</p>} />
        </Route>
        <Route element={<PermissionRoute anyOf={['users.read', 'rbac.read']} />}>
          <Route path="/admin/users" element={<p>users</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('PermissionRoute (FE-04 / P-FE04-3)', () => {
  it('propušta rutu kad korisnik ima traženu dozvolu', () => {
    mockUser.current = { permissions: ['audit.read'] };
    renderAt('/admin/audit');
    expect(screen.getByText('audit')).toBeInTheDocument();
  });

  it('preusmjerava na /admin kad dozvola fali', () => {
    mockUser.current = { permissions: ['media.read'] };
    renderAt('/admin/audit');
    expect(screen.getByText('admin home')).toBeInTheDocument();
  });

  it('anyOf propušta kad postoji BILO koja dozvola (users.read ili rbac.read)', () => {
    mockUser.current = { permissions: ['rbac.read'] };
    renderAt('/admin/users');
    expect(screen.getByText('users')).toBeInTheDocument();
  });

  it('anyOf preusmjerava kad nema nijedne dozvole', () => {
    mockUser.current = { permissions: ['media.read'] };
    renderAt('/admin/users');
    expect(screen.getByText('admin home')).toBeInTheDocument();
  });
});
