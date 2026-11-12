import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateClub } from '../../../../hooks/use-competition-admin';
import { useAuth } from '../../../../lib/auth';
import { hasPermission } from '../../../../lib/permissions';
import { MediaPicker } from '../../../../components/admin/MediaPicker';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import type { Club } from '../../../../types';

export function ClubBasicTab({ club }: { club: Club }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'clubs.manage');
  const update = useUpdateClub();
  const [name, setName] = useState(club.name);
  const [shortName, setShortName] = useState(club.shortName ?? '');
  const [city, setCity] = useState(club.city ?? '');
  const [description, setDescription] = useState(club.description ?? '');
  const [crestPath, setCrestPath] = useState(club.crestPath ?? club.logoPath ?? '');
  const [isOwnClub, setIsOwnClub] = useState(club.isOwnClub ?? false);

  useEffect(() => {
    setName(club.name);
    setShortName(club.shortName ?? '');
    setCity(club.city ?? '');
    setDescription(club.description ?? '');
    setCrestPath(club.crestPath ?? club.logoPath ?? '');
    setIsOwnClub(club.isOwnClub ?? false);
  }, [club]);

  const save = async () => {
    await update.mutateAsync({
      id: club.id,
      name,
      shortName: shortName.trim() || null,
      city: city || undefined,
      description: description || undefined,
      crestPath: crestPath || undefined,
      isOwnClub,
    });
  };

  if (!canManage) {
    return (
      <dl className="grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-text-muted">{t('admin.club.shortName')}</dt>
          <dd>{club.shortName ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-text-muted">{t('admin.club.city')}</dt>
          <dd>{club.city ?? '—'}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-text-muted">{t('admin.club.description')}</dt>
          <dd>{club.description ?? '—'}</dd>
        </div>
      </dl>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('admin.club.nameRequired')}
      />
      <Input
        value={shortName}
        onChange={(e) => setShortName(e.target.value)}
        placeholder={t('admin.club.shortNameHint')}
        maxLength={8}
      />
      <p className="-mt-2 text-xs text-text-muted">{t('admin.club.shortNameNote')}</p>
      <Input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={t('admin.club.city')}
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder={t('admin.club.descriptionPlaceholder')}
      />
      <MediaPicker value={crestPath} onChange={setCrestPath} label={t('admin.club.crest')} />
      {canManage && (
        <label className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-3">
          <div>
            <span className="text-sm font-medium">{t('admin.club.ownClub')}</span>
            <p className="text-xs text-text-muted">{t('admin.club.ownClubHint')}</p>
          </div>
          <Switch checked={isOwnClub} onCheckedChange={setIsOwnClub} />
        </label>
      )}
      <Button onClick={() => void save()} disabled={!name || update.isPending}>
        {t('actions.save')}
      </Button>
    </div>
  );
}
