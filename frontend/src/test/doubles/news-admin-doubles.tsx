/** Zajedničko stanje i dvojnici za NewsAdminPage testove (dva fajla). */
export const newsAdminState = {
  perms: [] as string[],
  list: { data: [] as unknown[], isLoading: false, isError: false, refetch: () => undefined },
  categories: [] as Array<{ id: string; name: string }>,
  listArgs: [] as unknown[],
  updateStatus: { mutateAsync: async (_v?: unknown) => ({}), isPending: false },
  submit: { mutateAsync: async (_id?: string) => ({}), isPending: false },
  remove: { mutateAsync: async (_id?: string) => ({}), isPending: false },
  categoriesDialog: null as null | { open: boolean },
  confirm: null as null | {
    open: boolean; title: string; description: string; isPending: boolean;
    onConfirm: () => void; onOpenChange: (o: boolean) => void;
  },
};

export function NewsCategoriesDialogDouble(props: { open: boolean }) {
  newsAdminState.categoriesDialog = props;
  return <div>kategorije:{String(props.open)}</div>;
}

export function ConfirmDialogDouble(props: {
  open: boolean; title: string; description: string; isPending: boolean;
  onConfirm: () => void; onOpenChange: (o: boolean) => void;
}) {
  newsAdminState.confirm = props;
  return props.open ? (
    <div>
      <span>brisanje:{props.title}:{props.description}:{String(props.isPending)}</span>
      <button onClick={props.onConfirm}>potvrdi-brisanje</button>
      <button onClick={() => props.onOpenChange(false)}>otkaži-brisanje</button>
    </div>
  ) : null;
}
