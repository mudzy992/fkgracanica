import { Redirect, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';

interface Props {
  children: ReactNode;
  /** Path after login, e.g. /(tabs)/membership */
  returnTo: string;
}

export function RequireAuth({ children, returnTo }: Props) {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Redirect
        href={{ pathname: '/login', params: { returnTo } } as unknown as Href}
      />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
