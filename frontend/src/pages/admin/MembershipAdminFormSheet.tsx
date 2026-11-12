import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateMembershipAdmin } from '../../hooks/use-membership';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipAdminFormSheet({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const create = useCreateMembershipAdmin();
  const [email, setEmail] = useState('');
  const [activate, setActivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail('');
    setActivate(false);
    setError(null);
  };

  const onSubmit = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Unesite email korisnika.');
      return;
    }
    try {
      await create.mutateAsync({ email: trimmed, activate });
      reset();
      onOpenChange(false);
    } catch {
      setError('Dodavanje nije uspjelo. Provjerite email i postojeće članstvo.');
    }
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title={t('admin.membershipForm.newMember')}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-text-muted">
            {t('admin.membershipForm.userEmail')}
          </label>
          <Input
            type="email"
            placeholder={t('admin.membershipForm.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-text-muted">
            {t('admin.membershipForm.accountRequired')}
          </p>
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
          <span className="text-sm font-medium">{t('admin.membershipForm.activateNow')}</span>
          <Switch checked={activate} onCheckedChange={setActivate} />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full" disabled={create.isPending} onClick={() => void onSubmit()}>
          {create.isPending ? 'Dodavanje...' : 'Dodaj člana'}
        </Button>
      </div>
    </AdminFormSheet>
  );
}
