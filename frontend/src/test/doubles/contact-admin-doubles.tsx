/** Zajedničko stanje i dvojnici za ContactAdminPage testove (dva fajla). */
export type ContactRow = Record<string, unknown> & { id: string };

export const contactAdminState = {
  list: {
    data: { data: [] as unknown[], meta: undefined as Record<string, unknown> | undefined },
    isLoading: false, isError: false, refetch: () => undefined,
  },
  listArgs: [] as unknown[],
  markRead: { mutateAsync: async (_id?: string) => ({}), isPending: false },
  markAll: { mutateAsync: async () => ({}), isPending: false },
  remove: { mutateAsync: async (_id?: string) => ({}), isPending: false },
  confirm: async (_opts?: unknown) => true,
  sheet: null as null | {
    open: boolean; message: ContactRow | null; isMarking: boolean;
    onMarkRead: (id: string) => void; onOpenChange: (o: boolean) => void;
  },
};

export function ContactMessageSheetDouble(props: {
  open: boolean; message: ContactRow | null; isMarking: boolean;
  onMarkRead: (id: string) => void; onOpenChange: (o: boolean) => void;
}) {
  contactAdminState.sheet = props;
  return props.open ? (
    <div>
      <span>sheet:{String(props.message?.id)}:{String(props.isMarking)}</span>
      <button onClick={() => props.onMarkRead(String(props.message?.id))}>označi-pročitanim</button>
      <button onClick={() => props.onOpenChange(false)}>zatvori-sheet</button>
    </div>
  ) : null;
}

export function AdminPaginationDouble({ page, meta, onPageChange }: {
  page: number; meta: { totalPages: number }; onPageChange: (p: number) => void;
}) {
  return meta.totalPages > 1
    ? <div>paginacija:{page}/{meta.totalPages}<button onClick={() => onPageChange(page + 1)}>dalje</button></div>
    : null;
}
