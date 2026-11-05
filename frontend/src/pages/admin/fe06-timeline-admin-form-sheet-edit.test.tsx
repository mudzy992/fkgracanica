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

const row = (over: Record<string, unknown> = {}) => ({
  id: 't1',
  year: 1952,
  title: 'Osnivanje kluba',
  description: 'Klub je osnovan u Gračanici.',
  imagePath: 'mediji/osnivanje.jpg',
  ...over,
});

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

describe('TimelineAdminFormSheet — izmjena', () => {
  it('popunjava polja iz zapisa i naslov je za izmjenu', () => {
    renderSheet({ edit: row() });
    expect(screen.getByRole('heading', { name: 'admin.timelineForm.edit' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin.timelineForm.year')).toHaveValue(1952);
    expect(screen.getByPlaceholderText('admin.cmsWidget.titleRequired')).toHaveValue('Osnivanje kluba');
    expect(screen.getByPlaceholderText('admin.cmsWidget.description')).toHaveValue('Klub je osnovan u Gračanici.');
    expect(screen.getByText('media:admin.timelineForm.image:mediji/osnivanje.jpg')).toBeInTheDocument();
    expect(save()).toHaveTextContent('actions.save');
  });

  it('šalje id uz izmijenjena polja', async () => {
    const user = userEvent.setup();
    renderSheet({ edit: row() });
    await user.clear(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'));
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), 'Novi naslov');
    await user.click(save());
    await waitFor(() => expect(state.update).toHaveBeenCalledTimes(1));
    expect(state.update).toHaveBeenCalledWith({
      id: 't1',
      year: 1952,
      title: 'Novi naslov',
      description: 'Klub je osnovan u Gračanici.',
      imagePath: 'mediji/osnivanje.jpg',
    });
    expect(state.create).not.toHaveBeenCalled();
  });

  it('zapis bez opisa i slike daje undefined i null', async () => {
    const user = userEvent.setup();
    renderSheet({ edit: row({ description: null, imagePath: null }) });
    await user.click(save());
    await waitFor(() => expect(state.update).toHaveBeenCalledTimes(1));
    expect(state.update).toHaveBeenCalledWith({
      id: 't1',
      year: 1952,
      title: 'Osnivanje kluba',
      description: undefined,
      imagePath: null,
    });
  });

  it('zatvaranje forme briše prethodnu poruku o grešci', async () => {
    const user = userEvent.setup();
    state.update.mockRejectedValueOnce(new Error('puklo'));
    const { rerender } = renderSheet({ edit: row() });
    await user.click(save());
    expect(await screen.findByText(/Spremanje nije uspjelo/)).toBeInTheDocument();
    rerender(
      <TimelineAdminFormSheet
        open={false}
        onOpenChange={(open: boolean) => state.closed.push(open)}
        edit={row()}
      />,
    );
    await waitFor(() => expect(screen.queryByText(/Spremanje nije uspjelo/)).toBeNull());
    expect(state.closed).toEqual([]);
  });
});
