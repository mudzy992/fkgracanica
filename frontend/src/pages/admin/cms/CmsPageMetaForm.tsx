import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <Card className="space-y-3 p-4">
      <h1 className="text-xl font-bold">{t('admin.cmsMeta.editTitle', { title: page.title })}</h1>
      <div className="grid gap-2 md:grid-cols-3">
        <Input
          value={meta.title}
          onChange={(e) => onChange({ ...meta, title: e.target.value })}
          placeholder={t('admin.cmsMeta.title')}
        />
        <Input
          value={meta.slug}
          onChange={(e) => onChange({ ...meta, slug: e.target.value })}
          placeholder={t('admin.slug.label')}
          disabled={page.isSystem}
        />
        <Select
          value={meta.status}
          onChange={(e) => onChange({ ...meta, status: e.target.value })}
        >
          <option value="DRAFT">{t('admin.cmsMeta.draft')}</option>
          <option value="PUBLISHED">{t('admin.cmsMeta.published')}</option>
        </Select>
      </div>
      <Button size="sm" onClick={onSave} disabled={isPending}>
        {t('admin.cmsMeta.save')}
      </Button>
      {page.slug !== 'home' && meta.status === 'PUBLISHED' && (
        <p className="text-xs text-text-muted">
          Javni URL:{' '}
          <a href={`/p/${meta.slug}`} className="text-accent" target="_blank" rel="noreferrer">
            /p/{meta.slug}
          </a>
        </p>
      )}
    </Card>
  );
}
