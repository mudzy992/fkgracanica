import { vi } from 'vitest';
import { AdminDataTableDouble, AdminPageShellDouble, adminShellState } from './admin-shell-doubles';

/** Stanje i dvojnici za MuseumAdminPage i HallOfFameAdminPage (identična struktura). */
export const museumState = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
};

export const hallOfFameState = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  confirm: vi.fn(),
  remove: vi.fn(),
  sheet: {} as Record<string, unknown>,
};

export function resetMuseumState(data: unknown) {
  museumState.data = data;
  museumState.isLoading = false;
  museumState.isError = false;
  museumState.refetch.mockReset();
  museumState.confirm.mockReset();
  museumState.confirm.mockResolvedValue(true);
  museumState.remove.mockReset();
  museumState.remove.mockResolvedValue({});
  museumState.sheet = {};
  adminShellState.retried = 0;
}

export function resetHallOfFameState(data: unknown) {
  hallOfFameState.data = data;
  hallOfFameState.isLoading = false;
  hallOfFameState.isError = false;
  hallOfFameState.refetch.mockReset();
  hallOfFameState.confirm.mockReset();
  hallOfFameState.confirm.mockResolvedValue(true);
  hallOfFameState.remove.mockReset();
  hallOfFameState.remove.mockResolvedValue({});
  hallOfFameState.sheet = {};
  adminShellState.retried = 0;
}

export function heritageHooksModule() {
  return {
    useMuseum: () => ({
      data: museumState.data,
      isLoading: museumState.isLoading,
      isError: museumState.isError,
      refetch: museumState.refetch,
    }),
    useHallOfFame: () => ({
      data: hallOfFameState.data,
      isLoading: hallOfFameState.isLoading,
      isError: hallOfFameState.isError,
      refetch: hallOfFameState.refetch,
    }),
  };
}

export function heritageAdminModule() {
  return {
    useDeleteMuseumItem: () => ({ mutateAsync: museumState.remove }),
    useDeleteHallOfFame: () => ({ mutateAsync: hallOfFameState.remove }),
  };
}

export function heritageConfirmModule() {
  return {
    useConfirm: () => ({ confirm: museumState.confirm, dialog: null }),
    useHallOfFameConfirm: () => null,
  };
}

export function hallOfFameConfirmModule() {
  return { useConfirm: () => ({ confirm: hallOfFameState.confirm, dialog: null }) };
}

export function heritageShellModule() {
  return { AdminPageShell: AdminPageShellDouble, AdminDataTable: AdminDataTableDouble };
}

export function museumSheetModule() {
  return {
    MuseumAdminFormSheet: (props: Record<string, unknown>) => {
      museumState.sheet = props;
      const edit = props.edit as { id?: string } | null;
      return (
        <div>
          sheet:{String(props.open)}:{String(edit?.id ?? '-')}
          <button onClick={() => (props.onOpenChange as (o: boolean) => void)(false)}>zatvori-sheet</button>
        </div>
      );
    },
  };
}

export function hallOfFameSheetModule() {
  return {
    HallOfFameAdminFormSheet: (props: Record<string, unknown>) => {
      hallOfFameState.sheet = props;
      const edit = props.edit as { id?: string } | null;
      return (
        <div>
          sheet:{String(props.open)}:{String(edit?.id ?? '-')}
          <button onClick={() => (props.onOpenChange as (o: boolean) => void)(false)}>zatvori-sheet</button>
        </div>
      );
    },
  };
}

export function museumCategoriesModule() {
  return {
    museumCategoryLabel: (category?: string) =>
      category === 'gear' ? 'Oprema' : category === 'photo' ? 'Fotografija' : '',
  };
}
