import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeSponsorItem } from './load-home-extras';
import { HomeSectionTitle } from './HomeSectionTitle';

type Props = { items: HomeSponsorItem[] };

export function HomeSponsorsStrip({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (items.length === 0) return null;

  const openSponsor = (item: HomeSponsorItem) => {
    if (item.url) void Linking.openURL(item.url);
    else router.push('/heritage');
  };

  return (
    <View>
      <View style={styles.header}>
        <HomeSectionTitle title={t('sponsors')} compact />
        <Pressable onPress={() => router.push('/heritage')} accessibilityRole="button">
          <Text style={[styles.seeAll, { color: colors.accent }]}>{t('homeSeeAll')}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.logoTile,
              { backgroundColor: colors.background, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => openSponsor(item)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            {item.logoPath ? (
              <RemoteImage path={item.logoPath} variant="thumb" style={styles.logo} contentFit="contain" />
            ) : (
              <Text style={[styles.fallback, { color: colors.textMuted }]} numberOfLines={2}>
                {item.name}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontWeight: '600' },
  row: { gap: spacing.sm, paddingTop: spacing.sm },
  logoTile: {
    width: 108,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  logo: { width: '100%', height: 48, borderRadius: 0 },
  fallback: { ...typography.caption, textAlign: 'center', fontWeight: '600' },
});
