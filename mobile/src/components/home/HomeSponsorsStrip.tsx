import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeSponsorItem } from './load-home-extras';

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
        <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('homeSponsorsKicker')}</Text>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {t('sponsors')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.logoTile,
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
            onPress={() => openSponsor(item)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            {item.logoPath ? (
              <RemoteImage path={item.logoPath} variant="medium" style={styles.logo} contentFit="contain" />
            ) : (
              <Text style={[styles.fallback, { color: colors.textMuted }]} numberOfLines={2}>
                {item.name}
              </Text>
            )}
            <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.moreRow, { opacity: pressed ? 0.8 : 1 }]}
        onPress={() => router.push('/heritage')}
        accessibilityRole="button"
        accessibilityLabel={t('homeSeeAll')}
      >
        <Text style={[styles.moreText, { color: colors.link }]}>{t('homeSeeAll')}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.link} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.md },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  title: { ...typography.heading, fontSize: 22, fontWeight: '800', marginTop: 2 },
  row: { gap: spacing.sm, paddingHorizontal: spacing.xs },
  logoTile: {
    width: 128,
    height: 104,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  logo: { width: '100%', height: 48, borderRadius: 0 },
  fallback: { ...typography.caption, textAlign: 'center', fontWeight: '700' },
  name: { ...typography.caption, fontSize: 11, fontWeight: '600' },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: spacing.md,
  },
  moreText: { ...typography.caption, fontWeight: '700' },
});
