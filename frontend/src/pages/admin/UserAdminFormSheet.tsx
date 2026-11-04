import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreateUser,
  useUpdateUser,
  useUserRoleOptions,
  type UserFormData,
} from '../../hooks/use-users-admin';
import { getApiErrorMessage } from '../../lib/api-error';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Min. 8 znakova'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
});

const editSchema = createSchema.omit({ password: true }).extend({
  password: z.string().min(8).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive?: boolean;
  roles?: { role: { id: string; name: string } }[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserRow | null;
  canCreate: boolean;
  canUpdate: boolean;
}

export function UserAdminFormSheet({ open, onOpenChange, user, canCreate, canUpdate }: Props) {
  const { t } = useTranslation();
  const create = useCreateUser();
  const update = useUpdateUser();
  const { data: roles } = useUserRoleOptions();
  const isEdit = !!user;
  const schema = isEdit ? editSchema : createSchema;
  const canSubmit = isEdit ? canUpdate : canCreate;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<UserFormData & { password?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, roleIds: [] },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        isActive: user.isActive ?? true,
        roleIds: user.roles?.map((r) => r.role.id) ?? [],
        password: '',
      });
    } else {
      reset({ email: '', password: '', firstName: '', lastName: '', roleIds: [], isActive: true });
    }
  }, [user, reset, open]);

  const roleIds = watch('roleIds') ?? [];
  const roleList = roles ?? [];
  const mutationError = create.error ?? update.error;

  const onSubmit = async (data: UserFormData & { password?: string }) => {
    try {
      if (isEdit && user) {
        const payload: UserFormData = { ...data };
        if (!payload.password) delete payload.password;
        await update.mutateAsync({ id: user.id, ...payload });
      } else {
        await create.mutateAsync({ ...data, password: data.password! });
      }
      onOpenChange(false);
    } catch {
      /* error via mutation state */
    }
  };

  const toggleRole = (id: string) => {
    const next = roleIds.includes(id) ? roleIds.filter((r) => r !== id) : [...roleIds, id];
    setValue('roleIds', next);
  };

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('admin.userForm.edit') : t('admin.userForm.create')}
    >
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
        <Input placeholder={t('admin.membershipForm.email')} {...register('email')} />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        <Input
          type="password"
          placeholder={isEdit ? t('admin.userForm.newPassword') : t('admin.userForm.password')}
          {...register('password')}
        />
        {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder={t('admin.userForm.firstName')} {...register('firstName')} />
          <Input placeholder={t('admin.userForm.lastName')} {...register('lastName')} />
        </div>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={watch('isActive') ?? true}
              onCheckedChange={(v) => setValue('isActive', v)}
            />
            {t('admin.userForm.active')}
          </label>
        )}
        <div>
          <p className="mb-2 text-sm font-medium">{t('admin.userForm.roles')}</p>
          <div className="flex flex-wrap gap-2">
            {roleList.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRole(r.id)}
                className={`rounded-lg border px-2 py-1 text-xs ${
                  roleIds.includes(r.id)
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
        {mutationError && (
          <p className="text-sm text-danger">
            {getApiErrorMessage(mutationError, 'Greška pri spremanju korisnika')}
          </p>
        )}
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isEdit ? 'Sačuvaj' : 'Kreiraj'}
        </Button>
      </form>
    </AdminFormSheet>
  );
}
