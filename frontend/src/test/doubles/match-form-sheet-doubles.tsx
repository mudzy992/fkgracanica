import type { Match } from '../../types';

/** Zajedničko stanje i dvojnici za MatchFormSheet testove. */
export const matchFormState = {
  clubs: [] as Array<{ id: string; name: string; stadium?: string }>,
  user: { permissions: [] as string[] },
  create: { mutateAsync: async () => ({}), isPending: false },
  update: { mutateAsync: async () => ({}), isPending: false },
  lastFinishedProps: {} as { match?: Match; canLive?: boolean },
  scoreArgs: {} as { homeScore: number; awayScore: number; labeled?: boolean },
  onOpenChange: () => undefined,
};

export function AdminFormSheetDouble({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function EntitySelectDouble({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );
}

export function MatchFinishedReadOnlyDouble(props: { match: Match; canLive?: boolean }) {
  matchFormState.lastFinishedProps = props;
  return <div>finished-readonly:{props.match.id}</div>;
}

export function MatchScoreInputsDouble({ homeScore, awayScore, onHome, onAway, labeled }: {
  homeScore: number; awayScore: number; onHome: (v: number) => void;
  onAway: (v: number) => void; labeled?: boolean;
}) {
  matchFormState.scoreArgs = { homeScore, awayScore, labeled };
  return (
    <div>
      <span>score:{homeScore}:{awayScore}</span>
      <button onClick={() => onHome(homeScore + 1)}>home-plus</button>
      <button onClick={() => onAway(awayScore + 1)}>away-plus</button>
    </div>
  );
}
