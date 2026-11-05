/** Zajedničko stanje i dvojnici za SeasonRoundsPanel testove (dva fajla). */
export const seasonRoundsState = {
  rounds: { data: [] as Array<Record<string, unknown>>, isLoading: false },
  remove: { mutateAsync: async () => ({}), isPending: false },
  confirm: async () => true,
  apiGet: async (_url?: string) => ({ data: {} as Record<string, unknown> }),
  onSelectRound: (_id: string) => undefined,
  form: {} as { open: boolean; edit: Record<string, unknown> | null; seasonId: string },
  cascade: {} as {
    open: boolean; roundLabel: string; impact: Record<string, unknown>;
    isPending: boolean; onConfirm: () => void; onOpenChange: (o: boolean) => void;
  },
};

export function RoundFormSheetDouble(props: {
  open: boolean; edit: Record<string, unknown> | null; seasonId: string;
}) {
  seasonRoundsState.form = props;
  return <div>form:{String(props.open)}:{String(props.edit?.id ?? '-')}:{props.seasonId}</div>;
}

export function RoundCascadeDeleteDialogDouble(props: {
  open: boolean; roundLabel: string; impact: Record<string, unknown>;
  isPending: boolean; onConfirm: () => void; onOpenChange: (o: boolean) => void;
}) {
  seasonRoundsState.cascade = props;
  return props.open ? (
    <div>
      <span>cascade:{props.roundLabel}:{String(props.impact.matchCount)}:{String(props.isPending)}</span>
      <button onClick={props.onConfirm}>potvrdi-kaskadu</button>
      <button onClick={() => props.onOpenChange(false)}>zatvori-kaskadu</button>
    </div>
  ) : null;
}
