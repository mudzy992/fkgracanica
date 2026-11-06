import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { AdminCommandPalette } from './AdminCommandPalette';
import type { AdminNavGroup } from './admin-nav-groups';

installDialogPolyfill();
Element.prototype.scrollIntoView = vi.fn();

const auth = vi.hoisted(() => ({ permissions: ['news.manage'] as string[] | undefined }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: auth.permissions } }) }));

const groups: AdminNavGroup[] = [
  {
    labelKey: 'admin.navGroup.content',
    items: [
      { to: '/admin/news', labelKey: 'admin.nav.news', permissions: ['news.manage'] },
      { to: '/admin/media', labelKey: 'admin.nav.media', permissions: ['media.manage'] },
    ],
  },
];

function Host({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <AdminCommandPalette
      open={open}
      groups={groups}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onClose?.();
      }}
    />
  );
}

const renderPalette = (onClose?: () => void) =>
  render(<MemoryRouter><Host onClose={onClose} /></MemoryRouter>);

beforeEach(() => {
  auth.permissions = ['news.manage'];
});

describe('AdminCommandPalette — rubovi', () => {
  it('strelica bez rezultata ne mijenja aktivnu stavku', async () => {
    renderPalette();
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'nema-podudaranja');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByRole('combobox')).toHaveValue('nema-podudaranja');
  });

  it('Enter bez rezultata ne navigira i paleta ostaje otvorena', async () => {
    renderPalette();
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'xyz');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('klik na sam dijalog (pozadinu) zatvara paletu', () => {
    const onClose = vi.fn();
    renderPalette(onClose);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape i Tab na dijalogu ne izlaze iz palete prije odluke', () => {
    const onClose = vi.fn();
    renderPalette(onClose);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Tab' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('cancel događaj dijaloga zatvara paletu bez bubljanja', () => {
    const onClose = vi.fn();
    renderPalette(onClose);
    const dialog = screen.getByRole('dialog');
    const event = new Event('cancel', { cancelable: true, bubbles: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

});
