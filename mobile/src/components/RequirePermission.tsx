import { Redirect, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScreenEmpty } from './ScreenEmpty';
import { useAuth } from '../lib/auth';
import { hasAnyPermission, hasPermission } from '../lib/permissions';

type Props = {
  children: ReactNode;
  permission?: string;
  anyOf?: string[];
  returnTo?: string;
};

export function RequirePermission({ children, permission, anyOf, returnTo = '/(tabs)/more' }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <ScreenEmpty message="..." icon="hourglass-outline" />;
  }

  if (!isAuthenticated) {
    return <Redirect href={{ pathname: '/login', params: { returnTo } } as unknown as Href} />;
  }

  const allowed = anyOf?.length
    ? hasAnyPermission(user, anyOf)
    : hasPermission(user, permission ?? '');
  if (!allowed) {
    return <ScreenEmpty message="Nemate pristup ovom ekranu." icon="lock-closed-outline" />;
  }

  return <>{children}</>;
}
