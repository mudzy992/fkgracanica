import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimelineAdminFormSheet } from './TimelineAdminFormSheet';

const state = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  createPending: false,
  updatePending: false,
  closed: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-heritage-admin', () => ({
  useCreateTimelineEvent: () => ({ mutateAsync: state.create, isPending: state.createPending }),
  useUpdateTimelineEvent: () => ({ mutateAsync: state.update, isPending: state.updatePending }),
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));

const renderSheet = (over: Record<string, unknown> = {}) =>
  render(
    <TimelineAdminFormSheet
      open
      onOpenChange={(open: boolean) => state.closed.push(open)}
      edit={null}
      {...(over as object)}
    />,
  );

const save = () => screen.getByRole('button', { name: /^(actions\.create|actions\.save)$/ });

beforeEach(() => {
  state.create.mockReset().mockResolvedValue(undefined);
  state.update.mockReset().mockResolvedValue(undefined);
  state.createPending = false;
  state.updatePending = false;
  state.closed = [];
});

describe('TimelineAdminFormSheet — kreiranje', () => {
  it('naslov je za kreiranje i polja su prazna', () => {
    renderSheet();
    expect(screen.getByRole('heading', { name: 'admin.timelineForm.create' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin.timelineForm.year')).toHaveValue(null);
    expect(screen.getByPlaceholderText('admin.cmsWidget.titleRequired')).toHaveValue('');
    expect(screen.getByText('media:admin.timelineForm.image:-')).toBeInTheDocument();
    expect(save()).toBeDisabled();
  });

  it('dugme je aktivno tek kad su godina i naslov uneseni', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.timelineForm.year'), '1952');
    expect(save()).toBeDisabled();
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Osnivanje');
    expect(save()).toBeEnabled();
  });

  it('šalje prazna opciona polja kao undefined i null', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.timelineForm.year'), '1952');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Osnivanje');
    await user.click(save());
    await waitFor(() => expect(state.create).toHaveBeenCalledTimes(1));
    expect(state.create).toHaveBeenCalledWith({
      year: 1952,
      title: 'Osnivanje',
      description: undefined,
      imagePath: null,
    });
    expect(state.closed).toEqual([false]);
  });

  it('popunjava opis i sliku kad su uneseni', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.timelineForm.year'), '1952');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Osnivanje');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.description'), 'Tekst');
    await user.click(screen.getByText('odaberi-medij'));
    expect(screen.getByText('media:admin.timelineForm.image:media/novo.jpg')).toBeInTheDocument();
    await user.click(save());
    await waitFor(() => expect(state.create).toHaveBeenCalledTimes(1));
    expect(state.create).toHaveBeenCalledWith({
      year: 1952,
      title: 'Osnivanje',
      description: 'Tekst',
      imagePath: 'media/novo.jpg',
    });
  });

  it('greška prikazuje poruku i ne zatvara formu', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('puklo'));
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.timelineForm.year'), '1952');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Osnivanje');
    await user.click(save());
    expect(await screen.findByText('Spremanje nije uspjelo. Pokušajte ponovo.')).toBeInTheDocument();
    expect(state.closed).toEqual([]);
  });

  it('ponovni pokušaj čisti prethodnu poruku', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValueOnce(new Error('puklo'));
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.timelineForm.year'), '1952');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Osnivanje');
    await user.click(save());
    expect(await screen.findByText(/Spremanje nije uspjelo/)).toBeInTheDocument();
    await user.click(save());
    await waitFor(() =>
      expect(screen.queryByText(/Spremanje nije uspjelo/)).toBeNull(),
    );
    expect(state.closed).toEqual([false]);
  });

  it('dok traje kreiranje dugme je onemogućeno', async () => {
    const user = userEvent.setup();
    state.createPending = true;
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.timelineForm.year'), '1952');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Osnivanje');
    expect(save()).toBeDisabled();
  });
});
