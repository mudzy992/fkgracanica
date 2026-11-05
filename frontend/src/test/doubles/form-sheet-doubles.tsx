/** Zajednički dvojnici primitiva obrazaca (AdminFormSheet, MediaPicker, Switch, EntitySelect). */
export const formSheetState = {
  title: '',
  mediaPicked: null as null | ((path: string) => void),
};

export function AdminFormSheetDouble({ title, children }: { title: string; children: React.ReactNode }) {
  formSheetState.title = title;
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export function MediaPickerDouble({ value, onChange, label }: {
  value?: string | null; onChange?: (path: string) => void; label?: string;
}) {
  formSheetState.mediaPicked = onChange ?? null;
  return (
    <div>
      <span>media:{label}:{value || '-'}</span>
      {onChange && <button onClick={() => onChange('media/novo.jpg')}>odaberi-medij</button>}
    </div>
  );
}

export function SwitchDouble({ checked, onCheckedChange, disabled }: {
  checked: boolean; onCheckedChange: (value: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
    >
      switch:{String(checked)}
    </button>
  );
}

export function EntitySelectDouble({ label, value, onChange, options }: {
  label: string; value: string; onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );
}
