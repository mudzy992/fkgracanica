import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommsAdminPage } from './CommsAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  perms: [] as string[],
  moduleFlags: {} as Record<string, string>,
  contact: {} as Record<string, unknown>,
  newsletter: {} as Record<string, unknown>,
  emailLog: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks', () => ({ useModuleFlags: () => ({ data: state.moduleFlags }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => ({
  AdminPageShell: (await import('../../test/doubles/admin-shell-doubles')).AdminPageShellDouble,
}));
vi.mock('./ContactAdminPage', () => ({
  ContactAdminPage: (props: Record<string, unknown>) => {
    state.contact = props;
    return <div>kontakt-ugrađen:{String(props.embedded)}</div>;
  },
}));
vi.mock('./NewsletterAdminPage', () => ({
  NewsletterAdminPage: (props: Record<string, unknown>) => {
    state.newsletter = props;
    return <div>newsletter-ugrađen:{String(props.embedded)}</div>;
  },
}));
vi.mock('./EmailLogPanel', () => ({
  EmailLogPanel: () => {
    state.emailLog = { rendered: true };
    return <div>email-log-panel</div>;
  },
}));

function Probe() {
  const location = useLocation();
  return <div data-testid="loc">{`${location.pathname}${location.search}`}</div>;
}

const renderAt = (path = '/admin/comms') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
      <Routes>
        <Route path="/admin/comms" element={<CommsAdminPage />} />
        <Route path="/admin" element={<div>admin-početna</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.perms = [];
  state.moduleFlags = {};
  state.contact = {};
  state.newsletter = {};
  state.emailLog = {};
  adminShellState.actions = null;
});

describe('CommsAdminPage — dozvole i preusmjeravanje', () => {
  it('bez ijedne dozvole preusmjerava na /admin bez upisa taba', async () => {
    renderAt();
    expect(screen.queryByText(/kontakt-ugrađen/)).toBeNull();
    expect(screen.queryByText('email-log-panel')).toBeNull();
    await waitFor(() => expect(screen.getByText('admin-početna')).toBeInTheDocument());
    expect(screen.getByTestId('loc')).toHaveTextContent(/^\/admin$/);
    expect(adminShellState.actions).toBeNull();
  });

  it('samo kontakt dozvola daje ugrađenu kontakt stranicu bez tabova', async () => {
    state.perms = ['contact.read'];
    renderAt();
    expect(screen.getByText('kontakt-ugrađen:true')).toBeInTheDocument();
    expect(screen.queryByText('newsletter-ugrađen:true')).toBeNull();
    expect(adminShellState.actions).toBeNull();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('/admin/comms?tab=contact'));
  });

  it('isključen modul kontakta preusmjerava kad nema drugih dozvola', async () => {
    state.perms = ['contact.read'];
    state.moduleFlags = { 'modules.contact': 'false' };
    renderAt();
    expect(screen.queryByText(/kontakt-ugrađen/)).toBeNull();
    await waitFor(() => expect(screen.getByText('admin-početna')).toBeInTheDocument());
  });

  it('samo newsletter dozvola daje newsletter tab', async () => {
    state.perms = ['newsletter.read'];
    renderAt();
    expect(screen.getByText('newsletter-ugrađen:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=newsletter'));
  });

  it('samo settings.read daje email log', async () => {
    state.perms = ['settings.read'];
    renderAt();
    expect(screen.getByText('email-log-panel')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=email-log'));
  });
});

describe('CommsAdminPage — tabovi i URL', () => {
  it('sa više dozvola prikazuje tabove i poštuje traženi tab iz URL-a', () => {
    state.perms = ['contact.read', 'newsletter.read', 'settings.read'];
    renderAt('/admin/comms?tab=newsletter');
    expect(screen.getByText('newsletter-ugrađen:true')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Newsletter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kontakt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email log' })).toBeInTheDocument();
  });

  it('nedozvoljen tab u URL-u se zamjenjuje prvim dostupnim', async () => {
    state.perms = ['contact.read', 'settings.read'];
    renderAt('/admin/comms?tab=newsletter');
    expect(screen.getByText('kontakt-ugrađen:true')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=contact'));
  });

  it('klik na tab mijenja sadržaj i URL bez gomilanja historije', async () => {
    const user = userEvent.setup();
    state.perms = ['contact.read', 'newsletter.read', 'settings.read'];
    renderAt('/admin/comms?tab=contact');
    await user.click(screen.getByRole('button', { name: 'Email log' }));
    expect(screen.getByText('email-log-panel')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=email-log'));
    await user.click(screen.getByRole('button', { name: 'Kontakt' }));
    expect(screen.getByText('kontakt-ugrađen:true')).toBeInTheDocument();
  });

  it('nema tabova kad je dostupan samo email log', () => {
    state.perms = ['settings.read'];
    renderAt();
    expect(screen.queryByRole('button', { name: 'Email log' })).toBeNull();
    expect(screen.getByText('email-log-panel')).toBeInTheDocument();
  });

  it('beskonačna petlja se ne javlja kad je tab već usklađen', async () => {
    state.perms = ['contact.read', 'newsletter.read'];
    renderAt('/admin/comms?tab=contact');
    await waitFor(() => expect(screen.getByTestId('loc')).toHaveTextContent('tab=contact'));
    expect(screen.getByText('kontakt-ugrađen:true')).toBeInTheDocument();
  });
});
