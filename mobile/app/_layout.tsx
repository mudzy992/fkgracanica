import { hydrateLanguage } from '../src/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/lib/auth';
import { registerPushDeepLinks } from '../src/lib/push';
import { ThemeProvider, useTheme } from '../src/lib/theme-context';

function RootStack() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    void hydrateLanguage();
    return registerPushDeepLinks();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: t('back'),
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="showcase" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="payment-return" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="staff" options={{ headerShown: false }} />
        <Stack.Screen name="team" options={{ headerShown: false }} />
        <Stack.Screen name="league" options={{ headerShown: false }} />
        <Stack.Screen name="player/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="gallery" options={{ title: t('gallery') }} />
        <Stack.Screen name="gallery/[slug]" options={{ title: t('gallery') }} />
        <Stack.Screen name="heritage" options={{ title: t('heritage') }} />
        <Stack.Screen name="contact" options={{ title: t('contact') }} />
        <Stack.Screen name="search" options={{ title: t('search') }} />
        <Stack.Screen name="tickets-browse" options={{ title: t('browseTickets') }} />
        <Stack.Screen name="tickets-buy" options={{ title: t('buyTickets') }} />
        <Stack.Screen name="membership" options={{ title: t('membership') }} />
        <Stack.Screen name="tickets" options={{ title: t('tickets') }} />
        <Stack.Screen name="notifications" options={{ title: t('notifications') }} />
        <Stack.Screen name="news/[slug]" options={{ title: t('news') }} />
        <Stack.Screen name="live/[id]" options={{ title: t('live') }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootStack />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
