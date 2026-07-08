import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { useAuth } from '../../src/lib/auth';
import { useModuleFlags } from '../../src/hooks/use-module-flags';
import { useUnreadNotifications } from '../../src/hooks/use-unread-notifications';
import { useTheme } from '../../src/lib/theme-context';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(filled: IconName, outline: IconName) {
  return ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { colors } = useTheme();
  const { count: unreadCount } = useUnreadNotifications();
  const { isEnabled } = useModuleFlags();

  if (isLoading) {
    return <ScreenLoading />;
  }

  const headerRight = () =>
    isAuthenticated ? (
      <Pressable onPress={() => void logout()} style={styles.logout} accessibilityLabel={t('logout')}>
        <Ionicons name="log-out-outline" size={22} color={colors.white} />
      </Pressable>
    ) : (
      <Link href="/login" asChild>
        <Pressable style={styles.logout}>
          <Text style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>{t('login')}</Text>
        </Pressable>
      </Link>
    );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        headerRight,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t('news'),
          tabBarIcon: tabIcon('newspaper', 'newspaper-outline'),
        }}
      />
      <Tabs.Screen
        name="live/index"
        options={{
          title: t('live'),
          tabBarIcon: tabIcon('radio', 'radio-outline'),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('notifications'),
          tabBarBadge: isAuthenticated && unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: tabIcon('notifications', 'notifications-outline'),
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: t('membership'),
          href: isEnabled('feature.membership') ? undefined : null,
          tabBarIcon: tabIcon('id-card', 'id-card-outline'),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: t('tickets'),
          href: isEnabled('modules.ticketing') ? undefined : null,
          tabBarIcon: tabIcon('ticket', 'ticket-outline'),
        }}
      />
      <Tabs.Screen name="news/[slug]" options={{ href: null, title: t('news') }} />
      <Tabs.Screen name="live/[id]" options={{ href: null, title: t('live') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logout: { marginRight: 16 },
});
