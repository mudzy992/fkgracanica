import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateRole } from '../../hooks/use-users-admin';
import { getApiErrorMessage } from '../../lib/api-error';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RolesAdminFormSheet({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const create = useCreateRole();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const save = async () => {
    try {
      await create.mutateAsync({ name, description: description || undefined });
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch {
      /* error via mutation */
    }
  };

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={t('admin.rolesForm.create')}>
      <div className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.rolesForm.name')}
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('admin.cmsWidget.description')}
        />
        <Button onClick={() => void save()} disabled={!name || create.isPending}>
          {t('actions.create')}
        </Button>
        {create.isError && (
          <p className="text-sm text-danger">
            {getApiErrorMessage(create.error, t('admin.rolesForm.createError'))}
          </p>
        )}
      </div>
    </AdminFormSheet>
  );
}
