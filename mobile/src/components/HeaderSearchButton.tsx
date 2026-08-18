import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

type Props = { color: string };

export function HeaderSearchButton({ color }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/search')}
      accessibilityRole="button"
      accessibilityLabel={t('search')}
      hitSlop={8}
      style={styles.btn}
    >
      <Ionicons name="search" size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 8, paddingVertical: 4 },
});
