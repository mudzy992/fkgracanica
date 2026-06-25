import { useEffect, useState } from 'react';
import { useCreateSponsor, useUpdateSponsor } from '../../hooks/use-content-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Sponsor } from '../../types';

const TIERS = ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edit: Sponsor | null;
}

export function SponsorsAdminFormSheet({ open, onOpenChange, edit }: Props) {
  const create = useCreateSponsor();
  const update = useUpdateSponsor();
  const [name, setName] = useState('');
  const [tier, setTier] = useState('PARTNER');
  const [url, setUrl] = useState('');
  const [logoPath, setLogoPath] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(edit?.name ?? '');
    setTier(edit?.tier ?? 'PARTNER');
    setUrl(edit?.url ?? '');
    setLogoPath(edit?.logoPath ?? '');
  }, [open, edit]);

  const save = async () => {
    const body = { name, tier, url: url || undefined, logoPath: logoPath || undefined };
    if (edit) await update.mutateAsync({ id: edit.id, ...body });
    else await create.mutateAsync(body);
    onOpenChange(false);
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={edit ? 'Uredi sponzora' : 'Novi sponzor'}>
      <div className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv *" />
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (opcionalno)" />
        <MediaPicker value={logoPath} onChange={setLogoPath} label="Logo" />
        <Button onClick={() => void save()} disabled={!name || create.isPending || update.isPending}>
          {edit ? 'Spremi' : 'Kreiraj'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
