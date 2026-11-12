import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateClub } from '../../../hooks/use-competition-admin';
import { AdminFormSheet } from '../../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../../components/admin/MediaPicker';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { Club } from '../../../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (clubId: string) => void;
}

export function ClubsCreateSheet({ open, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation();
  const create = useCreateClub();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [crestPath, setCrestPath] = useState('');

  const reset = () => {
    setName('');
    setCity('');
    setCrestPath('');
  };

  const save = async () => {
    const created = (await create.mutateAsync({
      name,
      city: city || undefined,
      crestPath: crestPath || undefined,
      isOwnClub: false,
    })) as Club;
    reset();
    onOpenChange(false);
    onCreated(created.id);
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
      title={t('admin.clubForm.create')}
    >
      <div className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.clubForm.name')}
        />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t('admin.club.city')}
        />
        <MediaPicker value={crestPath} onChange={setCrestPath} label={t('admin.club.crest')} />
        <Button onClick={() => void save()} disabled={!name || create.isPending}>
          Kreiraj i otvori hub
        </Button>
      </div>
    </AdminFormSheet>
  );
}
