import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/lib/theme-context';

export default function AdminStaffLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const header = {
    headerStyle: { backgroundColor: colors.headerBg },
    headerTintColor: colors.white,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    headerBackTitle: t('back'),
  };

  return (
    <Stack screenOptions={header}>
      <Stack.Screen name="index" options={{ title: t('adminHub') }} />
      <Stack.Screen name="dashboard" options={{ title: t('dashboard') }} />
      <Stack.Screen name="users" options={{ title: t('users') }} />
      <Stack.Screen name="roles" options={{ title: t('roles') }} />
      <Stack.Screen name="settings" options={{ title: t('settings') }} />
      <Stack.Screen name="audit" options={{ title: t('auditLog') }} />
      <Stack.Screen name="orders" options={{ title: t('orders') }} />
      <Stack.Screen name="validate" options={{ title: t('qrValidate') }} />
      <Stack.Screen name="membership" options={{ title: t('membershipAdmin') }} />
      <Stack.Screen name="comms" options={{ title: t('inbox') }} />
      <Stack.Screen name="sponsors" options={{ title: t('sponsors') }} />
      <Stack.Screen name="trophies" options={{ title: t('trophies') }} />
      <Stack.Screen name="club-timeline" options={{ title: t('timeline') }} />
      <Stack.Screen name="hall-of-fame" options={{ title: t('hallOfFame') }} />
      <Stack.Screen name="museum" options={{ title: t('museum') }} />
      <Stack.Screen name="clubs" options={{ title: t('clubs') }} />
      <Stack.Screen name="players" options={{ title: t('players') }} />
      <Stack.Screen name="competitions" options={{ title: t('competitions') }} />
      <Stack.Screen name="matches" options={{ title: t('matches') }} />
    </Stack>
  );
}
