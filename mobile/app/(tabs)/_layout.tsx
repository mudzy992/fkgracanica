import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HeaderSearchButton } from '../../src/components/HeaderSearchButton';
import { ScreenLoading } from '../../src/components/ScreenLoading';
import { useAuth } from '../../src/lib/auth';
import { isStaffUser } from '../../src/lib/permissions';
import { useUnreadNotifications } from '../../src/hooks/use-unread-notifications';
import { useModuleFlags } from '../../src/hooks/use-module-flags';
import { ShowcaseScreen } from '../../src/showcase/ShowcaseScreen';
import { useTheme } from '../../src/lib/theme-context';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(filled: IconName, outline: IconName) {
  return ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { colors } = useTheme();
  const { count: unreadCount } = useUnreadNotifications();
  const { flags, loading: flagsLoading, isEnabled } = useModuleFlags();

  if (isLoading || flagsLoading) {
    return <ScreenLoading />;
  }

  if (flags['feature.showcaseMode'] === 'true' && !isStaffUser(user)) {
    return <ShowcaseScreen />;
  }

  const headerRight = () => (
    <View style={styles.right}>
      <HeaderSearchButton color={colors.white} />
      {isAuthenticated ? (
        <Link href="/(tabs)/profile" asChild>
          <Pressable style={styles.logout} accessibilityLabel={t('profile')}>
            <Ionicons name="person-circle-outline" size={26} color={colors.white} />
          </Pressable>
        </Link>
      ) : (
        <Link href="/login" asChild>
          <Pressable style={styles.logout}>
            <Text style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>{t('login')}</Text>
          </Pressable>
        </Link>
      )}
    </View>
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
          headerShown: false,
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
        name="league/index"
        options={{
          title: t('league'),
          href: isEnabled('modules.competitions') ? '/(tabs)/league' : null,
          tabBarIcon: tabIcon('trophy', 'trophy-outline'),
        }}
      />
      <Tabs.Screen
        name="live/index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('more'),
          tabBarIcon: tabIcon('grid', 'grid-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          href: isAuthenticated ? '/(tabs)/profile' : null,
          tabBarBadge: isAuthenticated && unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: tabIcon('person-circle', 'person-circle-outline'),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  right: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  logout: { marginRight: 8 },
});
