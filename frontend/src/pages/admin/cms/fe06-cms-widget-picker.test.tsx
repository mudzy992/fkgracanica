import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsWidgetPicker } from './CmsWidgetPicker';
import { installDialogPolyfill } from '../../../test/dialog-polyfill';

const state = vi.hoisted(() => ({
  widgets: { data: [] as unknown[] },
  add: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  openChanges: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-cms-pages', () => ({
  useCmsWidgets: () => state.widgets,
  useAddCmsSection: () => state.add,
}));

const widgets = [
  { type: 'hero', label: 'Hero baner', category: 'layout' },
  { type: 'rich-text', label: 'Tekst blok', category: 'layout' },
  { type: 'gallery', label: 'Galerija', category: 'module' },
  { type: 'newsletter', label: 'Newsletter', category: 'global' },
];

const onOpenChange = (open: boolean) => state.openChanges.push(open);

const renderPicker = (open = true) =>
  render(<CmsWidgetPicker pageId="p1" open={open} onOpenChange={onOpenChange} />);

describe('CmsWidgetPicker', () => {
  beforeAll(() => installDialogPolyfill());

  beforeEach(() => {
    state.widgets = { data: widgets };
    state.add = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.openChanges = [];
  });

  it('zatvoren dijalog ne renderuje sadržaj', () => {
    renderPicker(false);
    expect(screen.queryByText('admin.cmsMenu.addWidget')).toBeNull();
  });

  it('prikazuje samo widgete koji nisu globalni', () => {
    renderPicker();
    expect(screen.getByRole('button', { name: 'Hero baner' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Galerija' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Newsletter' })).toBeNull();
  });

  it('rad sa praznom listom ne pada', () => {
    state.widgets = { data: [] };
    renderPicker();
    expect(screen.getByText('admin.cmsMenu.addWidget')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Hero baner' })).toBeNull();
  });

  it('filter „Layout“ prikazuje samo layout widgete', async () => {
    renderPicker();
    await userEvent.click(screen.getByRole('button', { name: 'Layout' }));
    expect(screen.getByRole('button', { name: 'Hero baner' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Galerija' })).toBeNull();
  });

  it('filter „Moduli“ prikazuje samo module', async () => {
    renderPicker();
    await userEvent.click(screen.getByRole('button', { name: 'Moduli' }));
    expect(screen.getByRole('button', { name: 'Galerija' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Hero baner' })).toBeNull();
  });

  it('povratak na „Sve“ vraća sve widgete', async () => {
    renderPicker();
    await userEvent.click(screen.getByRole('button', { name: 'Moduli' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sve' }));
    expect(screen.getByRole('button', { name: 'Hero baner' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Galerija' })).toBeTruthy();
  });

  it('odabir widgeta dodaje sekciju i zatvara dijalog', async () => {
    renderPicker();
    await userEvent.click(screen.getByRole('button', { name: 'Galerija' }));
    await waitFor(() => expect(state.add.mutateAsync).toHaveBeenCalledWith({ widgetType: 'gallery', config: {} }));
    expect(state.openChanges).toEqual([false]);
  });

  it('dok je zahtjev u toku dugmad su onemogućena', () => {
    state.add = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderPicker();
    expect(screen.getByRole('button', { name: 'Hero baner' })).toHaveProperty('disabled', true);
  });

  it('„Zatvori“ i X zatvaraju dijalog', async () => {
    renderPicker();
    await userEvent.click(screen.getByRole('button', { name: 'Zatvori' }));
    expect(state.openChanges).toEqual([false]);
    state.openChanges = [];
    // dva elementa imaju istu oznaku (backdrop + X u zaglavlju) — X je drugi
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.close' })[1]);
    expect(state.openChanges).toEqual([false]);
  });
});
