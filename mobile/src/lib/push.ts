import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { api } from './api';

const PUSH_TOKEN_KEY = 'fk_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export function registerPushDeepLinks() {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const path = response.notification.request.content.data?.path;
    if (typeof path === 'string' && path.startsWith('/')) {
      router.push(path as never);
      return;
    }
    router.push('/(tabs)/notifications');
  });
  return () => subscription.remove();
}

export async function ensurePushRegistration() {
  if (!Device.isDevice) return;
  const permissions = await Notifications.requestPermissionsAsync();
  if (!permissions.granted) return;
  const projectId = getProjectId();
  if (!projectId) return;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const previous = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (previous === token.data) return;
  await api.post('/notifications/devices', { token: token.data, platform: Device.osName ?? 'unknown' });
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token.data);
}

export async function clearPushRegistration() {
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (!token) return;
  try {
    await api.delete(`/notifications/devices/${encodeURIComponent(token)}`);
  } catch {
    // ignore logout cleanup failures
  }
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
