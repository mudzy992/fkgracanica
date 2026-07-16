import { Stack } from 'expo-router';
import { useTheme } from '../../src/lib/theme-context';

export default function StaffLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.white,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Radni prostor' }} />
    </Stack>
  );
}
