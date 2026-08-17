import { Controller } from 'react-hook-form';
import { asArray } from '../../../lib/as-array';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import { SlugField } from '../../../components/admin/SlugField';
import { useNewsCategories, type NewsCategory } from '../../../hooks/use-news-admin';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { formatDate } from '../../../lib/utils';
import type { GalleryItem, Match, Player } from '../../../types';
import type { NewsEditorFieldsProps } from '../news-form-utils';

export function NewsEditorMeta({ register, control, watch, setValue }: NewsEditorFieldsProps) {
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const title = watch('title');

  return (
    <aside className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-surface/40 p-4 lg:sticky lg:top-4">
      <SlugField title={title} value={watch('slug')} onChange={(v) => setValue('slug', v)} />
      <div>
        <label className="mb-1 block text-sm font-medium">Kategorija</label>
        <select
          className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
          {...register('categoryId')}
        >
          <option value="">— Bez kategorije —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tagovi (zarezom)</label>
        <Input {...register('tagsCsv')} placeholder="transfer, utakmica" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Video URL</label>
        <Input {...register('videoUrl')} placeholder="https://..." />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">SEO naslov</label>
        <Input {...register('seoTitle')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">SEO opis</label>
        <Textarea rows={2} {...register('seoDesc')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Galerija</label>
        <Controller
          name="galleryId"
          control={control}
          render={({ field }) => (
            <EntitySelect<GalleryItem>
              endpoint="/gallery"
              labelKey="title"
              valueKey="id"
              value={field.value}
              onChange={(v: string | string[]) => field.onChange(typeof v === 'string' ? v : '')}
            />
          )}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Zakazano objavljivanje</label>
        <Input type="datetime-local" {...register('scheduledAt')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Povezane utakmice</label>
        <Controller
          name="relatedMatchIds"
          control={control}
          render={({ field }) => (
            <EntitySelect<Match>
              endpoint="/matches"
              labelKey="id"
              valueKey="id"
              multiple
              value={field.value}
              onChange={field.onChange}
              formatLabel={(m) =>
                `${m.homeClub?.name ?? '?'} vs ${m.awayClub?.name ?? '?'} (${formatDate(m.scheduledAt)})`
              }
            />
          )}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Povezani igrači</label>
        <Controller
          name="relatedPlayerIds"
          control={control}
          render={({ field }) => (
            <EntitySelect<Player>
              endpoint="/players"
              labelKey="lastName"
              valueKey="id"
              multiple
              value={field.value}
              onChange={field.onChange}
              formatLabel={(p) => `${p.firstName} ${p.lastName}${p.number ? ` (#${p.number})` : ''}`}
            />
          )}
        />
      </div>
    </aside>
  );
}
