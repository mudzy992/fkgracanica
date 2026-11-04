import { EntitySelect } from '../../../../components/admin/EntitySelect';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../../components/ui/input';
import type { GalleryItem } from '../../../../types';

const LIMIT_WIDGETS = new Set(['news-feed', 'gallery', 'sponsors', 'featured-players', 'trophies']);

interface Props {
  widgetType: string;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function GenericSectionForm({ widgetType, config, onChange }: Props) {
  const { t } = useTranslation();
  const title = String(config.title ?? '');
  const limit = Number(config.limit ?? 3);
  const viewAllUrl = String(config.viewAllUrl ?? '');
  const text = String(config.text ?? '');
  const buttonLabel = String(config.buttonLabel ?? '');
  const buttonUrl = String(config.buttonUrl ?? '');
  const galleryMode = String(config.mode ?? 'latest');
  const galleryId = String(config.galleryId ?? '');
  const isCta = widgetType.endsWith('-cta');

  const patch = (next: Record<string, unknown>) => onChange({ ...config, ...next });

  return (
    <div className="space-y-3">
      <Input
        value={title}
        onChange={(e) => patch({ title: e.target.value })}
        placeholder={t('admin.cmsWidget.sectionTitle')}
      />
      {widgetType === 'gallery' && (
        <select
          value={galleryMode}
          onChange={(e) => patch({ mode: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm"
        >
          <option value="latest">{t('admin.cmsWidget.galleryLatest')}</option>
          <option value="single">{t('admin.cmsWidget.gallerySingle')}</option>
        </select>
      )}
      {widgetType === 'gallery' && galleryMode === 'single' && (
        <EntitySelect<GalleryItem>
          endpoint="/gallery"
          labelKey="title"
          valueKey="id"
          value={galleryId}
          onChange={(v: string | string[]) => patch({ galleryId: typeof v === 'string' ? v : '' })}
        />
      )}
      {LIMIT_WIDGETS.has(widgetType) && (
        <Input
          type="number"
          min={1}
          max={24}
          value={limit}
          onChange={(e) => patch({ limit: Number(e.target.value) })}
          placeholder={t('admin.cmsWidget.limit')}
        />
      )}
      {['gallery', 'sponsors', 'trophies', 'featured-players'].includes(widgetType) && (
        <Input
          value={viewAllUrl}
          onChange={(e) => patch({ viewAllUrl: e.target.value })}
          placeholder={t('admin.cmsWidget.viewAllLink')}
        />
      )}
      {isCta && (
        <>
          <textarea
            value={text}
            onChange={(e) => patch({ text: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            placeholder={t('admin.cmsWidget.description')}
          />
          <Input
            value={buttonLabel}
            onChange={(e) => patch({ buttonLabel: e.target.value })}
            placeholder={t('admin.cmsWidget.buttonLabel')}
          />
          <Input
            value={buttonUrl}
            onChange={(e) => patch({ buttonUrl: e.target.value })}
            placeholder={t('admin.cmsWidget.buttonUrlFull')}
          />
        </>
      )}
      {widgetType === 'newsletter' && (
        <textarea
          value={text}
          onChange={(e) => patch({ text: e.target.value, description: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder={t('admin.cmsWidget.description')}
        />
      )}
    </div>
  );
}
