import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsSectionEditDialog } from './CmsSectionEditDialog';
import type { CmsPageSection } from '../../../cms/types';

const state = vi.hoisted(() => ({
  open: [] as boolean[],
  confirmResult: true,
  confirmCalls: [] as string[],
  sheet: null as null | { title: string; open: boolean; dirty?: boolean; size?: string },
  saved: 0,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, onOpenChange, title, children, dirty, size }: {
    open: boolean; onOpenChange: (open: boolean) => void; title: string;
    children: React.ReactNode; dirty?: boolean; size?: string;
  }) => {
    state.sheet = { title, open, dirty, size };
    return (
      <div>
        <h2>{title}</h2>
        <button onClick={() => onOpenChange(false)}>traži-zatvaranje</button>
        {children}
      </div>
    );
  },
}));
vi.mock('./forms/CmsSectionForm', () => ({
  CmsSectionForm: ({ widgetType, config }: { widgetType: string; config: Record<string, unknown> }) => (
    <div data-testid="section-form">
      {widgetType}:{JSON.stringify(config)}
    </div>
  ),
}));

const section = (over: Partial<CmsPageSection> = {}) =>
  ({ id: 's1', widgetType: 'hero', config: {}, enabled: true, ...over }) as CmsPageSection;

const renderDialog = (over: Partial<React.ComponentProps<typeof CmsSectionEditDialog>> = {}) =>
  render(
    <CmsSectionEditDialog
      section={section()}
      open
      draftConfig={{ title: 'Dobrodošli' }}
      dirty
      onOpenChange={(open) => state.open.push(open)}
      onChange={() => {}}
      onSave={() => { state.saved += 1; }}
      {...over}
    />,
  );

describe('CmsSectionEditDialog', () => {
  beforeEach(() => {
    state.open = [];
    state.confirmResult = true;
    state.confirmCalls = [];
    state.sheet = null;
    state.saved = 0;
    vi.spyOn(window, 'confirm').mockImplementation((msg?: string) => {
      state.confirmCalls.push(String(msg));
      return state.confirmResult;
    });
  });

  it('naslov koristi labelu widgeta iz meta podataka', () => {
    renderDialog();
    expect(screen.getByRole('heading', { name: 'Uredi: Hero baner' })).toBeTruthy();
  });

  it('nepoznat tip widgeta koristi sam tip u naslovu', () => {
    renderDialog({ section: section({ widgetType: 'nepoznat' }) });
    expect(screen.getByRole('heading', { name: 'Uredi: nepoznat' })).toBeTruthy();
  });

  it('prosljeđuje tip, konfiguraciju i veličinu u formu', () => {
    renderDialog();
    expect(screen.getByTestId('section-form').textContent).toBe('hero:{"title":"Dobrodošli"}');
    expect(state.sheet).toMatchObject({ dirty: true, size: 'lg' });
  });

  it('bez sekcije naslov je opći i nema forme', () => {
    renderDialog({ section: null });
    expect(screen.getByRole('heading', { name: 'Uredi sekciju' })).toBeTruthy();
    expect(screen.queryByTestId('section-form')).toBeNull();
  });

  it('sa izmjenama traži potvrdu prije zatvaranja', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'traži-zatvaranje' }));
    expect(state.confirmCalls).toEqual(['Ima nesačuvanih izmjena. Zatvoriti?']);
    expect(state.open).toEqual([false]);
  });

  it('bez potvrde dijalog ostaje otvoren', async () => {
    state.confirmResult = false;
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'traži-zatvaranje' }));
    expect(state.open).toEqual([]);
  });

  it('bez izmjena zatvara bez pitanja', async () => {
    renderDialog({ dirty: false });
    await userEvent.click(screen.getByRole('button', { name: 'traži-zatvaranje' }));
    expect(state.confirmCalls).toEqual([]);
    expect(state.open).toEqual([false]);
  });

  it('„Sačuvaj“ zove onSave kad ima izmjena', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Sačuvaj sekciju' }));
    expect(state.saved).toBe(1);
  });

  it('„Odustani“ sa izmjenama traži potvrdu, a bez izmjena zatvara odmah', async () => {
    const { unmount } = renderDialog({ dirty: false });
    await userEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(state.confirmCalls).toEqual([]);
    expect(state.open).toEqual([false]);
    unmount();

    state.open = [];
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(state.confirmCalls).toEqual(['Ima nesačuvanih izmjena. Zatvoriti?']);
    expect(state.open).toEqual([false]);
  });

  it('sačuvaj je onemogućen bez izmjena ili dok je zahtjev u toku', () => {
    const { unmount } = renderDialog({ dirty: false });
    expect(screen.getByRole('button', { name: 'Sačuvaj sekciju' })).toHaveProperty('disabled', true);
    unmount();
    renderDialog({ isPending: true });
    expect(screen.getByRole('button', { name: 'Sačuvaj sekciju' })).toHaveProperty('disabled', true);
  });
});
