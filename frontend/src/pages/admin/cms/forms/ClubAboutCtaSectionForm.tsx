import { Input } from '../../../../components/ui/input';

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ClubAboutCtaSectionForm({ config, onChange }: Props) {
  const patch = (next: Record<string, unknown>) => onChange({ ...config, ...next });
  const textArea =
    'w-full rounded-lg border border-slate-200 bg-background p-2 text-sm text-foreground outline-none';

  return (
    <div className="space-y-3">
      <Input value={String(config.eyebrow ?? '')} onChange={(e) => patch({ eyebrow: e.target.value })} placeholder="Eyebrow" />
      <Input value={String(config.title ?? '')} onChange={(e) => patch({ title: e.target.value })} placeholder="Naslov" />
      <textarea
        value={String(config.text ?? '')}
        onChange={(e) => patch({ text: e.target.value })}
        rows={4}
        className={textArea}
        placeholder="Glavni opis"
      />
      <Input
        value={String(config.primaryLabel ?? '')}
        onChange={(e) => patch({ primaryLabel: e.target.value })}
        placeholder="CTA label"
      />
      <Input value={String(config.primaryUrl ?? '')} onChange={(e) => patch({ primaryUrl: e.target.value })} placeholder="CTA URL" />
      <Input
        value={String(config.secondaryLabel ?? '')}
        onChange={(e) => patch({ secondaryLabel: e.target.value })}
        placeholder="Sekundarni naslov"
      />
      <textarea
        value={String(config.secondaryText ?? '')}
        onChange={(e) => patch({ secondaryText: e.target.value })}
        rows={3}
        className={textArea}
        placeholder="Sekundarni opis"
      />
      <Input value={String(config.storyImage ?? '')} onChange={(e) => patch({ storyImage: e.target.value })} placeholder="Putanja story slike" />
      <Input
        value={String(config.heritageImage ?? '')}
        onChange={(e) => patch({ heritageImage: e.target.value })}
        placeholder="Putanja heritage slike"
      />
    </div>
  );
}
