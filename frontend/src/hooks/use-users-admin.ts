import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface UserFormData {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roleIds?: string[];
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserFormData & { password: string }) =>
      (await api.post('/users', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: UserFormData & { id: string }) =>
      (await api.patch(`/users/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/users/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUserRoleOptions() {
  return useQuery({
    queryKey: ['users', 'role-options'],
    queryFn: async () =>
      (await api.get<{ id: string; name: string }[]>('/users/role-options')).data,
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissionKeys }: { roleId: string; permissionKeys: string[] }) =>
      (await api.patch(`/rbac/roles/${roleId}/permissions`, { permissionKeys })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; description?: string }) =>
      (await api.post('/rbac/roles', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/rbac/roles/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}
