import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateSponsor, useUpdateSponsor } from '../../hooks/use-content-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import type { Sponsor } from '../../types';

const TIERS = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Sponsor | null;
}

export function SponsorsAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const { t } = useTranslation();
  const create = useCreateSponsor();
  const update = useUpdateSponsor();
  const [name, setName] = useState('');
  const [tier, setTier] = useState('PARTNER');
  const [url, setUrl] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setFeedback(null);
      return;
    }
    setName(edit?.name ?? '');
    setTier(edit?.tier ?? 'PARTNER');
    setUrl(edit?.url ?? '');
    setLogoPath(edit?.logoPath ?? '');
  }, [open, edit]);

  const save = async () => {
    setFeedback(null);
    try {
      const body = { name, tier, url: url || undefined, logoPath: logoPath || undefined };
      if (edit) await update.mutateAsync({ id: edit.id, ...body });
      else await create.mutateAsync(body);
      onOpenChange(false);
    } catch {
      setFeedback({ type: 'error', text: 'Spremanje nije uspjelo. Pokušajte ponovo.' });
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={edit ? t('admin.sponsorForm.edit') : t('admin.sponsorForm.create')}
    >
      <div className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.rolesForm.name')}
        />
        <Select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
        >
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('admin.sponsorForm.url')}
        />
        <MediaPicker value={logoPath} onChange={setLogoPath} label={t('admin.sponsorForm.logo')} />
        {feedback && <p className="text-sm text-danger">{feedback.text}</p>}
        <Button
          onClick={() => void save()}
          disabled={!name || create.isPending || update.isPending}
        >
          {edit ? t('actions.save') : t('actions.create')}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
