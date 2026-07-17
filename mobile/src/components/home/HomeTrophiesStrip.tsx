import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeTrophyItem } from './load-home-extras';
import { HomeSectionTitle } from './HomeSectionTitle';

type Props = { items: HomeTrophyItem[] };

export function HomeTrophiesStrip({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <HomeSectionTitle title={t('trophies')} compact />
        <Pressable onPress={() => router.push('/heritage')} accessibilityRole="button">
          <Text style={[styles.seeAll, { color: colors.accent }]}>{t('homeSeeAll')}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <View key={item.id} style={[styles.chip, { backgroundColor: colors.background }]}>
            <Text style={[styles.year, { color: colors.primary }]}>{item.year}</Text>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            {item.competition ? (
              <Text style={[styles.comp, { color: colors.textMuted }]} numberOfLines={1}>
                {item.competition}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontWeight: '600' },
  row: { gap: spacing.sm, paddingTop: spacing.sm },
  chip: {
    width: 140,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  year: { ...typography.title, fontSize: 22 },
  name: { ...typography.caption, fontWeight: '700', marginTop: spacing.xs },
  comp: { ...typography.caption, marginTop: spacing.xs },
});
