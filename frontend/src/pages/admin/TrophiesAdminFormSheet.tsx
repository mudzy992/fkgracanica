import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateTrophy, useUpdateTrophy } from '../../hooks/use-content-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import type { Trophy } from '../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Trophy | null;
}

export function TrophiesAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const { t } = useTranslation();
  const create = useCreateTrophy();
  const update = useUpdateTrophy();
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [competition, setCompetition] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [featured, setFeatured] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      return;
    }
    setName(edit?.name ?? '');
    setYear(edit?.year ?? new Date().getFullYear());
    setCompetition(edit?.competition ?? '');
    setDescription(edit?.description ?? '');
    setImagePath(edit?.imagePath ?? '');
    setFeatured(edit?.featured ?? false);
  }, [open, edit]);

  const save = async () => {
    setFeedback(null);
    try {
      const body = {
        name,
        year,
        competition: competition || undefined,
        description: description || undefined,
        imagePath: imagePath || null,
        featured,
      };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      setFeedback(t('admin.common.saveFailed'));
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={edit ? t('admin.trophyForm.edit') : t('admin.trophyForm.create')}
    >
      <div className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.trophyForm.nameRequired')}
        />
        <Input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          placeholder={t('admin.trophyForm.year')}
        />
        <Input
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          placeholder={t('admin.calendar.competition')}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={t('admin.trophyForm.description')}
        />
        <MediaPicker
          value={imagePath}
          onChange={setImagePath}
          label={t('admin.trophyForm.image')}
        />
        <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
          <div>
            <p className="text-sm font-medium">{t('admin.trophyForm.featured')}</p>
            <p className="text-xs text-text-muted">{t('admin.trophyForm.featuredHint')}</p>
          </div>
          <Switch checked={featured} onCheckedChange={setFeatured} />
        </label>
        {feedback && <p className="text-sm text-danger">{feedback}</p>}
        <Button
          onClick={() => void save()}
          disabled={!name || create.isPending || update.isPending}
        >
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
