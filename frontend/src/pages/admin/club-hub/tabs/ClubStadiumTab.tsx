import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClubStadium, useUpsertClubStadium } from '../../../../hooks/use-club-hub';
import { MediaPicker } from '../../../../components/admin/MediaPicker';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Skeleton } from '../../../../components/ui/skeleton';

export function ClubStadiumTab({ clubId }: { clubId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useClubStadium(clubId);
  const save = useUpsertClubStadium(clubId);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    setName(data?.name ?? '');
    setAddress(data?.address ?? '');
    setCity(data?.city ?? '');
    setCapacity(data?.capacity != null ? String(data.capacity) : '');
    setDescription(data?.description ?? '');
    setImagePath(data?.imagePath ?? '');
  }, [data]);

  if (isLoading) return <Skeleton className="h-48" />;

  const onSave = async () => {
    await save.mutateAsync({
      name: name || 'Stadion',
      address: address || undefined,
      city: city || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      description: description || undefined,
      imagePath: imagePath || undefined,
    });
  };

  return (
    <div className="max-w-xl space-y-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('admin.stadium.nameRequired')}
      />
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t('admin.stadium.address')}
      />
      <Input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={t('admin.club.city')}
      />
      <Input
        type="number"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder={t('admin.stadium.capacity')}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-200 p-2 text-sm"
        placeholder={t('admin.stadium.description')}
      />
      <MediaPicker value={imagePath} onChange={setImagePath} label={t('admin.stadium.image')} />
      <Button onClick={() => void onSave()} disabled={!name || save.isPending}>
        {t('admin.stadium.save')}
      </Button>
    </div>
  );
}
