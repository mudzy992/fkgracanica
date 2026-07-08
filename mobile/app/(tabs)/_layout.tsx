import { Link, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/lib/auth';
import { useUnreadNotificationCount } from '../../src/hooks/use-unread-notifications';
import { useTheme } from '../../src/lib/theme-context';

function TabIcon({ label, color }: { label: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 16 }}>{label}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { colors } = useTheme();
  const unreadCount = useUnreadNotificationCount();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const headerRight = () =>
    isAuthenticated ? (
      <Pressable onPress={() => void logout()} style={styles.logout} accessibilityLabel={t('logout')}>
        <Text style={{ color: colors.white, fontSize: 18 }}>⎋</Text>
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
          tabBarIcon: ({ color }) => <TabIcon label="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: t('news'),
          tabBarIcon: ({ color }) => <TabIcon label="📰" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('notifications'),
          tabBarBadge: isAuthenticated && unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color }) => <TabIcon label="🔔" color={color} />,
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: t('membership'),
          tabBarIcon: ({ color }) => <TabIcon label="🪪" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: t('tickets'),
          tabBarIcon: ({ color }) => <TabIcon label="🎫" color={color} />,
        }}
      />
      <Tabs.Screen name="news/[slug]" options={{ href: null, title: t('news') }} />
      <Tabs.Screen name="live/[id]" options={{ href: null, title: t('live') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logout: { marginRight: 16 },
});
