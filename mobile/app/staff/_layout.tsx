import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/lib/theme-context';

export default function StaffLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.white,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: t('back'),
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('staffWorkspace') }} />
      <Stack.Screen name="writer/index" options={{ title: t('writer') }} />
      <Stack.Screen name="writer/[id]" options={{ title: t('writer') }} />
      <Stack.Screen name="commentator" options={{ title: t('commentatorTitle') }} />
      <Stack.Screen name="gallery-manage/index" options={{ title: t('galleryManage') }} />
      <Stack.Screen name="gallery-manage/[id]" options={{ title: t('galleryManage') }} />
      <Stack.Screen name="moderation" options={{ title: t('moderator') }} />
      <Stack.Screen name="ulaz" options={{ title: t('ulaz') }} />
      <Stack.Screen name="admin" options={{ headerShown: false, title: t('adminHub') }} />
    </Stack>
  );
}
