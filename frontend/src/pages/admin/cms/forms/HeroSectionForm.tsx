import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { MediaPicker } from '../../../../components/admin/MediaPicker';
import type { WidgetConfigMap } from '../../../../cms/widgets/schemas';

type HeroConfig = WidgetConfigMap['hero'];

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function HeroSectionForm({ config, onChange }: Props) {
  const hero = { title: '', buttons: [], showMatches: true, showLastResult: true, ...config } as HeroConfig;

  const patch = (next: Partial<HeroConfig>) => onChange({ ...hero, ...next });

  const setButton = (index: number, field: 'label' | 'url' | 'variant', value: string) => {
    const buttons = [...(hero.buttons ?? [])];
    buttons[index] = { ...buttons[index], label: buttons[index]?.label ?? '', url: buttons[index]?.url ?? '', [field]: value };
    patch({ buttons });
  };

  return (
    <div className="space-y-3">
      <Input value={hero.foundedYear ?? ''} onChange={(e) => patch({ foundedYear: e.target.value })} placeholder="Godina osnivanja" />
      <Input value={hero.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Naslov *" />
      <Input value={hero.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="Podnaslov" />
      <MediaPicker value={hero.backgroundImage ?? ''} onChange={(v) => patch({ backgroundImage: v })} label="Pozadinska slika (hero + stadion)" />
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={hero.showMatches !== false}
          onChange={(e) => patch({ showMatches: e.target.checked })}
        />
        Prikaži sljedeću utakmicu u hero dnu
      </label>
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={hero.showLastResult !== false}
          onChange={(e) => patch({ showLastResult: e.target.checked })}
        />
        Prikaži zadnji rezultat (suptilno)
      </label>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3">
        <p className="text-sm font-medium">Dugmad (label + link)</p>
        {(hero.buttons ?? []).map((btn, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <Input value={btn.label} onChange={(e) => setButton(i, 'label', e.target.value)} placeholder="Tekst dugmeta" className="flex-1" />
            <Input value={btn.url} onChange={(e) => setButton(i, 'url', e.target.value)} placeholder="/putanja" className="flex-1" />
            <select className="rounded-lg border border-slate-200 px-2 text-sm" value={btn.variant ?? 'primary'} onChange={(e) => setButton(i, 'variant', e.target.value)}>
              <option value="primary">Primarno</option>
              <option value="outline">Outline</option>
            </select>
            <Button type="button" variant="outline" size="sm" onClick={() => patch({ buttons: hero.buttons.filter((_, idx) => idx !== i) })}>
              Ukloni
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => patch({ buttons: [...(hero.buttons ?? []), { label: '', url: '/', variant: 'primary' }] })}>
          + Dugme
        </Button>
      </div>
    </div>
  );
}
