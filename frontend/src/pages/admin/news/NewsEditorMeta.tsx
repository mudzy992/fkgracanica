import { useId } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { asArray } from '../../../lib/as-array';
import { EntitySelect } from '../../../components/admin/EntitySelect';
import { SlugField } from '../../../components/admin/SlugField';
import { useNewsCategories, type NewsCategory } from '../../../hooks/use-news-admin';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { formatDate } from '../../../lib/utils';
import type { GalleryItem, Match, Player } from '../../../types';
import type { NewsEditorFieldsProps } from '../news-form-utils';

export function NewsEditorMeta({ register, control, watch, setValue, errors }: NewsEditorFieldsProps) {
  const { t } = useTranslation();
  const videoId = useId();
  const videoErrorId = `${videoId}-error`;
  const { data: categoriesRaw } = useNewsCategories();
  const categories = asArray<NewsCategory>(categoriesRaw);
  const title = watch('title');

  return (
    <aside className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-surface/40 p-4 lg:sticky lg:top-4">
      <SlugField title={title} value={watch('slug')} onChange={(v) => setValue('slug', v)} />
      <div>
        <label className="mb-1 block text-sm font-medium">{t('admin.newsForm.category')}</label>
        <Select
          {...register('categoryId')}
        >
          <option value="">{t('admin.newsForm.noCategory')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('admin.newsForm.tags')}</label>
        <Input {...register('tagsCsv')} placeholder={t('admin.newsForm.tagsPlaceholder')} />
      </div>
      <div>
        <label htmlFor={videoId} className="mb-1 block text-sm font-medium">{t('admin.newsForm.videoUrl')}</label>
        <Input id={videoId} {...register('videoUrl')} placeholder="https://..."
          aria-invalid={!!errors.videoUrl || undefined}
          aria-describedby={errors.videoUrl ? videoErrorId : undefined} />
        {errors.videoUrl?.message && <p id={videoErrorId} role="alert" className="mt-1 text-xs text-danger">{errors.videoUrl.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('admin.newsForm.seoTitle')}</label>
        <Input {...register('seoTitle')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('admin.newsForm.seoDescription')}
        </label>
        <Textarea rows={2} {...register('seoDesc')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('admin.newsForm.gallery')}</label>
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
        <label className="mb-1 block text-sm font-medium">{t('admin.newsForm.scheduledAt')}</label>
        <Input type="datetime-local" {...register('scheduledAt')} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('admin.newsForm.relatedMatches')}
        </label>
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
        <label className="mb-1 block text-sm font-medium">
          {t('admin.newsForm.relatedPlayers')}
        </label>
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
              formatLabel={(p) =>
                `${p.firstName} ${p.lastName}${p.number ? ` (#${p.number})` : ''}`
              }
            />
          )}
        />
      </div>
    </aside>
  );
}
