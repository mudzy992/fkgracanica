import { Input } from '../../../../components/ui/input';
import type { WidgetConfigMap } from '../../../../cms/widgets/schemas';

type Config = WidgetConfigMap['news-feed'];

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function NewsFeedSectionForm({ config, onChange }: Props) {
  const data = { mode: 'latest' as const, limit: 3, ...config } as Config;
  const patch = (next: Partial<Config>) => onChange({ ...data, ...next });

  return (
    <div className="space-y-3">
      <Input value={data.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Naslov sekcije" />
      <Input type="number" min={1} max={12} value={data.limit} onChange={(e) => patch({ limit: Number(e.target.value) })} placeholder="Broj vijesti" />
      <Input value={data.viewAllUrl ?? ''} onChange={(e) => patch({ viewAllUrl: e.target.value })} placeholder="Link 'Vidi sve'" />
      <Input value={data.viewAllLabel ?? ''} onChange={(e) => patch({ viewAllLabel: e.target.value })} placeholder="Tekst 'Vidi sve'" />
    </div>
  );
}
