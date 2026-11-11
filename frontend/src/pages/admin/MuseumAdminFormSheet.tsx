import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateMuseumItem, useUpdateMuseumItem } from '../../hooks/use-heritage-admin';
import { getApiErrorMessage } from '../../lib/api-error';
import { MUSEUM_CATEGORIES } from '../../lib/museum-categories';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import type { MuseumItem } from '../../types';

const CATEGORIES = MUSEUM_CATEGORIES;

type MuseumRow = MuseumItem & { category?: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: MuseumRow | null;
}

export function MuseumAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const { t } = useTranslation();
  const create = useCreateMuseumItem();
  const update = useUpdateMuseumItem();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('artifact');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(edit?.title ?? '');
    setCategory(edit?.category ?? 'artifact');
    setYear(edit?.year ? String(edit.year) : '');
    setDescription(edit?.description ?? '');
    setImagePath(edit?.imagePath ?? '');
  }, [open, edit]);

  const save = async () => {
    const body = {
      title,
      category,
      year: year ? Number(year) : undefined,
      description: description || undefined,
      imagePath: imagePath || null,
    };
    try {
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      /* error via mutation state */
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={edit ? t('admin.museumForm.edit') : t('admin.museumForm.create')}
    >
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('admin.museumForm.title')}
        />
        <div>
          <label className="mb-1 block text-sm font-medium">{t('admin.newsForm.category')}</label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <Input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder={t('admin.trophyForm.year')}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={t('admin.cmsWidget.description')}
        />
        <MediaPicker value={imagePath} onChange={setImagePath} />
        <Button
          onClick={() => void save()}
          disabled={!title || create.isPending || update.isPending}
        >
          {edit ? t('actions.save') : t('actions.create')}
        </Button>
        {(create.isError || update.isError) && (
          <p className="text-sm text-danger">
            {getApiErrorMessage(create.error ?? update.error, t('admin.common.saveFailedShort'))}
          </p>
        )}
      </div>
    </AdminFormSheet>
  );
}
