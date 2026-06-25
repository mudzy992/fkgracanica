import { Input } from '../../../../components/ui/input';

const LIMIT_WIDGETS = new Set(['news-feed', 'gallery', 'sponsors', 'featured-players', 'trophies']);

interface Props {
  widgetType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function GenericSectionForm({ widgetType, config, onChange }: Props) {
  const title = String(config.title ?? '');
  const limit = Number(config.limit ?? 3);
  const viewAllUrl = String(config.viewAllUrl ?? '');
  const text = String(config.text ?? '');
  const buttonLabel = String(config.buttonLabel ?? '');
  const buttonUrl = String(config.buttonUrl ?? '');
  const isCta = widgetType.endsWith('-cta');

  const patch = (next: Record<string, unknown>) => onChange({ ...config, ...next });

  return (
    <div className="space-y-3">
      <Input value={title} onChange={(e) => patch({ title: e.target.value })} placeholder="Naslov sekcije (opcionalno)" />
      {LIMIT_WIDGETS.has(widgetType) && (
        <Input type="number" min={1} max={24} value={limit} onChange={(e) => patch({ limit: Number(e.target.value) })} placeholder="Limit" />
      )}
      {['gallery', 'sponsors', 'trophies'].includes(widgetType) && (
        <Input value={viewAllUrl} onChange={(e) => patch({ viewAllUrl: e.target.value })} placeholder="Link 'Vidi sve'" />
      )}
      {isCta && (
        <>
          <textarea value={text} onChange={(e) => patch({ text: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="Opis" />
          <Input value={buttonLabel} onChange={(e) => patch({ buttonLabel: e.target.value })} placeholder="Tekst dugmeta" />
          <Input value={buttonUrl} onChange={(e) => patch({ buttonUrl: e.target.value })} placeholder="URL dugmeta" />
        </>
      )}
      {widgetType === 'newsletter' && (
        <textarea value={text} onChange={(e) => patch({ text: e.target.value, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="Opis" />
      )}
    </div>
  );
}
