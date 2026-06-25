import { useEffect, useState } from 'react';
import type { CmsBlock, HomeHeroContent } from '../../types';
import { validateCmsContent } from '../../lib/cms-schemas';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface CmsBlockEditorProps {
  block: CmsBlock;
  title: string;
  onTitleChange: (v: string) => void;
  onSave: (content: Record<string, unknown>) => void;
  isPending?: boolean;
}

const KNOWN_KEYS = new Set(['home.hero', 'footer.about']);

export function CmsBlockEditor({ block, title, onTitleChange, onSave, isPending }: CmsBlockEditorProps) {
  const [hero, setHero] = useState<HomeHeroContent & { backgroundImage?: string }>({});
  const [footerText, setFooterText] = useState('');
  const [json, setJson] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const content = block.content ?? {};
    if (block.key === 'home.hero') {
      setHero(content as HomeHeroContent & { backgroundImage?: string });
    } else if (block.key === 'footer.about') {
      setFooterText(String((content as { text?: string }).text ?? ''));
    } else {
      setJson(JSON.stringify(content, null, 2));
    }
    setError(null);
  }, [block]);

  const submit = () => {
    let content: Record<string, unknown>;
    if (block.key === 'home.hero') content = { ...hero };
    else if (block.key === 'footer.about') content = { text: footerText };
    else {
      try {
        content = JSON.parse(json) as Record<string, unknown>;
      } catch {
        setError('Neispravan JSON');
        return;
      }
    }
    const result = validateCmsContent(block.key, content);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    onSave(result.data);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Naslov bloka</label>
        <Input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Naslov bloka" />
      </div>
      {block.key === 'home.hero' && (
        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-text-muted">Hero sekcija</p>
          <Input value={hero.foundedYear ?? ''} onChange={(e) => setHero((h) => ({ ...h, foundedYear: e.target.value }))} placeholder="Godina osnivanja" />
          <Input value={hero.title ?? ''} onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))} placeholder="Naslov *" />
          <Input value={hero.subtitle ?? ''} onChange={(e) => setHero((h) => ({ ...h, subtitle: e.target.value }))} placeholder="Podnaslov" />
          <Input value={hero.primaryCtaPath ?? ''} onChange={(e) => setHero((h) => ({ ...h, primaryCtaPath: e.target.value }))} placeholder="Primarni link" />
          <Input value={hero.secondaryCtaPath ?? ''} onChange={(e) => setHero((h) => ({ ...h, secondaryCtaPath: e.target.value }))} placeholder="Sekundarni link" />
          <MediaPicker
            value={hero.backgroundImage ?? ''}
            onChange={(v) => setHero((h) => ({ ...h, backgroundImage: v }))}
            label="Pozadinska slika (opcionalno)"
          />
        </div>
      )}
      {block.key === 'footer.about' && (
        <div>
          <label className="mb-1 block text-sm font-medium">Tekst o klubu *</label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-slate-200 bg-background p-2 text-sm"
            placeholder="Tekst o klubu *"
          />
        </div>
      )}
      {!KNOWN_KEYS.has(block.key) && (
        <div>
          <label className="mb-1 block text-sm font-medium">JSON sadržaj</label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-200 bg-background p-2 font-mono text-xs"
          />
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={submit} disabled={isPending}>
        Sačuvaj
      </Button>
    </div>
  );
}
