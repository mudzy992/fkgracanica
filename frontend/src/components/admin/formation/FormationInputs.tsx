import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Select } from '../../ui/select';
import { FORMATION_OUTFIELD_TOTAL, formationOutfieldSum, isFormationSumValid } from '../../../lib/formation-sum';
import { cn } from '../../../lib/utils';

const PRESETS: Array<{ label: string; def: string; mid: string; fwd: string }> = [
  { label: '4-3-3', def: '4', mid: '3', fwd: '3' },
  { label: '4-4-2', def: '4', mid: '4', fwd: '2' },
  { label: '3-5-2', def: '3', mid: '5', fwd: '2' },
  { label: '4-2-3-1', def: '4', mid: '5', fwd: '1' },
  { label: '3-4-3', def: '3', mid: '4', fwd: '3' },
  { label: '5-3-2', def: '5', mid: '3', fwd: '2' },
  { label: '4-5-1', def: '4', mid: '5', fwd: '1' },
];

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

  const presetValue = PRESETS.find((p) => p.def === def && p.mid === mid && p.fwd === fwd)?.label ?? '';

  return (
    <Card className="space-y-3 bg-surface p-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-text-muted">Preset</span>
          <Select
            value={presetValue}
            onChange={(e) => {
              const pr = PRESETS.find((x) => x.label === e.target.value);
              if (pr) {
                onDef(pr.def);
                onMid(pr.mid);
                onFwd(pr.fwd);
              }
            }}
            className="h-9 w-28"
            aria-label="Odaberi formaciju"
          >
            <option value="">Prilagođeno</option>
            {PRESETS.map((pr) => (
              <option key={pr.label} value={pr.label}>
                {pr.label}
              </option>
            ))}
          </Select>
        </label>
        <span className="hidden text-text-muted sm:inline">·</span>
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
                aria-label={label}
              />
            </label>
          ))}
        </div>
        <Button size="sm" onClick={onApply} disabled={!valid || applying} className="ml-auto">
          Primijeni
        </Button>
      </div>
      <p className={cn('text-xs', valid ? 'text-text-muted' : 'text-danger')}>
        Zbroj ODB+VEZ+NAP mora biti {FORMATION_OUTFIELD_TOTAL} (trenutno: {sum})
        {!valid && ' — odaberi preset ili prilagodi ručno'}
      </p>
    </Card>
  );
}
