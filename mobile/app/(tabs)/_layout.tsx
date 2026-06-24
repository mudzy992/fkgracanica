import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/lib/auth';
import { colors } from '../../src/lib/theme';

function TabIcon({ label, color }: { label: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 16 }}>{label}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        headerRight: () => (
          <Pressable onPress={() => void logout()} style={styles.logout}>
            <Text style={styles.logoutText}>⎋</Text>
          </Pressable>
        ),
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logout: {
    marginRight: 16,
  },
  logoutText: {
    color: colors.white,
    fontSize: 18,
  },
});
