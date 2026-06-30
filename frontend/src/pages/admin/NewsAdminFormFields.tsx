import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { asArray } from '../../lib/as-array';
import { Controller } from 'react-hook-form';
import { EntitySelect } from '../../components/admin/EntitySelect';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { SlugField } from '../../components/admin/SlugField';
import { useNewsCategories } from '../../hooks/use-news-admin';
import type { NewsCategory } from '../../hooks/use-news-admin';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import type { GalleryItem, Match, Player } from '../../types';
import { formatDate } from '../../lib/utils';
import type { NewsFormData } from './news-form-utils';

interface Props {
  register: UseFormRegister<NewsFormData>;
  control: Control<NewsFormData>;
  watch: UseFormWatch<NewsFormData>;
  setValue: UseFormSetValue<NewsFormData>;
  errors: FieldErrors<NewsFormData>;
}

export function NewsAdminFormFields({ register, control, watch, setValue, errors }: Props) {
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const title = watch('title');

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Naslov</label>
        <Input {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
      </div>
      <SlugField title={title} value={watch('slug')} onChange={(v) => setValue('slug', v)} />
      <div>
        <label className="mb-1 block text-sm font-medium">Uvod</label>
        <Textarea rows={2} {...register('excerpt')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sadržaj</label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
        />
        {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
      </div>
        <Controller
          name="coverPath"
          control={control}
          render={({ field: coverField }) => (
            <MediaPicker value={coverField.value} onSelect={coverField.onChange} />
          )}
        />
      <div>
        <label className="mb-1 block text-sm font-medium">Video URL</label>
        <Input {...register('videoUrl')} placeholder="https://..." />
      </div>
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
    </div>
  );
}
