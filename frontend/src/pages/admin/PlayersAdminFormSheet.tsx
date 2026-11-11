import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClubs, useOwnClub } from '../../hooks';
import { useCreatePlayer, useUpdatePlayer } from '../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { EntitySelect } from '../../components/admin/EntitySelect';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { playerPositionLabel } from '../../lib/player-utils';
import type { Player } from '../../types';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Player | null;
  clubId?: string;
}

export function PlayersAdminFormSheet({ open, onOpenChange, edit, clubId: fixedClubId }: Props) {
  const { t } = useTranslation();
  const { data: clubs } = useClubs();
  const { data: ownClub } = useOwnClub();
  const create = useCreatePlayer();
  const update = useUpdatePlayer();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clubId, setClubId] = useState('');
  const [position, setPosition] = useState('MID');
  const [number, setNumber] = useState('');
  const [photoPath, setPhotoPath] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const clubOptions = (clubs ?? []).map((c) => ({
    id: c.id,
    label: c.isOwnClub ? `${c.name} (naš)` : c.name,
  }));

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      return;
    }
    setFirstName(edit?.firstName ?? '');
    setLastName(edit?.lastName ?? '');
    setClubId(edit?.clubId ?? fixedClubId ?? ownClub?.id ?? '');
    setPosition(edit?.position ?? 'MID');
    setNumber(edit?.number != null ? String(edit.number) : '');
    setPhotoPath(edit?.photoPath ?? '');
    setBio(edit?.bio ?? '');
    setIsActive(edit?.isActive ?? true);
  }, [open, edit, ownClub?.id, fixedClubId]);

  const save = async () => {
    setFeedback(null);
    try {
      const body = {
        firstName,
        lastName,
        clubId: fixedClubId || clubId || undefined,
        position,
        number: number ? Number(number) : undefined,
        photoPath: photoPath || undefined,
        bio: bio || undefined,
        isActive,
      };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      setFeedback('Spremanje nije uspjelo. Pokušajte ponovo.');
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={edit ? t('admin.playerForm.edit') : t('admin.playerForm.create')}
    >
      <div className="space-y-4">
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t('admin.playerForm.firstName')}
        />
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t('admin.playerForm.lastName')}
        />
        {!fixedClubId && (
          <EntitySelect
            label={t('admin.playerForm.club')}
            options={clubOptions}
            value={clubId}
            onChange={setClubId}
            placeholder={t('admin.playerForm.selectClub')}
          />
        )}
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {playerPositionLabel(p)}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={t('admin.playerForm.shirt')}
        />
        <MediaPicker
          value={photoPath}
          onChange={setPhotoPath}
          label={t('admin.playerForm.photo')}
        />
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder={t('admin.playerForm.bio')}
        />
        <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
          <span className="text-sm font-medium">{t('admin.playerForm.active')}</span>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </label>
        {feedback && <p className="text-sm text-danger">{feedback}</p>}
        <Button
          onClick={() => void save()}
          disabled={!firstName || !lastName || create.isPending || update.isPending}
        >
          {edit ? t('actions.save') : t('actions.create')}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
