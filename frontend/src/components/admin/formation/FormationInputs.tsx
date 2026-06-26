import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { FORMATION_OUTFIELD_TOTAL, formationOutfieldSum, isFormationSumValid } from '../../../lib/formation-sum';
import { cn } from '../../../lib/utils';

interface Props {
  def: string;
  mid: string;
  fwd: string;
  onDef: (v: string) => void;
  onMid: (v: string) => void;
  onFwd: (v: string) => void;
  onApply: () => void;
  applying: boolean;
}

const fields = [
  { key: 'def', label: 'ODB', valueKey: 'def' as const },
  { key: 'mid', label: 'VEZ', valueKey: 'mid' as const },
  { key: 'fwd', label: 'NAP', valueKey: 'fwd' as const },
];

export function FormationInputs({ def, mid, fwd, onDef, onMid, onFwd, onApply, applying }: Props) {
  const values = { def, mid, fwd };
  const setters = { def: onDef, mid: onMid, fwd: onFwd };
  const sum = formationOutfieldSum(def, mid, fwd);
  const valid = isFormationSumValid(def, mid, fwd);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {fields.map(({ key, label, valueKey }) => (
          <label key={key} className="flex items-center gap-1.5 text-sm">
            <span className="w-8 font-medium text-text-muted">{label}</span>
            <Input
              type="number"
              min={1}
              max={9}
              value={values[valueKey]}
              onChange={(e) => setters[valueKey](e.target.value)}
              className="h-9 w-14 px-2 text-center"
            />
          </label>
        ))}
        <Button size="sm" onClick={onApply} disabled={!valid || applying}>
          Primijeni
        </Button>
      </div>
      <p className={cn('text-xs', valid ? 'text-text-muted' : 'text-danger')}>
        Zbroj ODB+VEZ+NAP mora biti {FORMATION_OUTFIELD_TOTAL} (trenutno: {sum})
      </p>
    </div>
  );
}
