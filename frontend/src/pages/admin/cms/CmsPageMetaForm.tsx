import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { CmsPage } from '../../../cms/types';

interface Meta {
  title: string;
  slug: string;
  status: string;
}

interface Props {
  page: CmsPage;
  meta: Meta;
  onChange: (meta: Meta) => void;
  onSave: () => void;
  isPending?: boolean;
}

export function CmsPageMetaForm({ page, meta, onChange, onSave, isPending }: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h1 className="text-xl font-bold">Uredi: {page.title}</h1>
      <div className="grid gap-2 md:grid-cols-3">
        <Input value={meta.title} onChange={(e) => onChange({ ...meta, title: e.target.value })} placeholder="Naslov" />
        <Input
          value={meta.slug}
          onChange={(e) => onChange({ ...meta, slug: e.target.value })}
          placeholder="Slug"
          disabled={page.isSystem}
        />
        <select
          className="rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
          value={meta.status}
          onChange={(e) => onChange({ ...meta, status: e.target.value })}
        >
          <option value="DRAFT">Nacrt</option>
          <option value="PUBLISHED">Objavljeno</option>
        </select>
      </div>
      <Button size="sm" onClick={onSave} disabled={isPending}>
        Sačuvaj meta
      </Button>
      {page.slug !== 'home' && meta.status === 'PUBLISHED' && (
        <p className="text-xs text-text-muted">
          Javni URL:{' '}
          <a href={`/p/${meta.slug}`} className="text-accent" target="_blank" rel="noreferrer">
            /p/{meta.slug}
          </a>
        </p>
      )}
    </div>
  );
}
