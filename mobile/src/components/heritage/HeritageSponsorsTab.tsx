import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { normalizeSponsorTier, SPONSOR_TIER_I18N, SPONSOR_TIER_ORDER } from './sponsor-tiers';

type Props = { items: HeritageItem[] };

export function HeritageSponsorsTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {SPONSOR_TIER_ORDER.map((tier) => {
        const group = items.filter((item) => normalizeSponsorTier(item.tier) === tier);
        if (!group.length) return null;
        const hero = tier === 'GENERAL';
        const compact = tier === 'BRONZE' || tier === 'PARTNER';
        return (
          <View key={tier} style={styles.section}>
            <Text style={[styles.heading, { color: colors.text }]}>{t(SPONSOR_TIER_I18N[tier])}</Text>
            <View style={hero ? styles.heroCol : compact ? styles.compactGrid : styles.grid}>
              {group.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    hero ? styles.heroCard : compact ? styles.compactTile : styles.tile,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  onPress={() => item.url && void Linking.openURL(item.url)}
                  disabled={!item.url}
                  accessibilityRole={item.url ? 'link' : 'none'}
                  accessibilityLabel={item.title}
                >
                  {item.imagePath ? (
                    <RemoteImage
                      path={item.imagePath}
                      variant="medium"
                      transparent
                      contentFit="contain"
                      style={hero ? styles.heroLogo : compact ? styles.compactLogo : styles.logo}
                    />
                  ) : null}
                  <Text style={[hero ? styles.heroTitle : styles.name, { color: colors.text }]}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  section: { gap: spacing.sm },
  heading: { ...typography.heading, fontWeight: '800' },
  heroCol: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  compactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  heroCard: { borderRadius: 20, borderWidth: 1, padding: spacing.lg, alignItems: 'center' },
  tile: { width: '48%', borderRadius: 14, borderWidth: 1, padding: spacing.md, alignItems: 'center' },
  compactTile: { width: '31%', borderRadius: 10, borderWidth: 1, padding: spacing.sm, alignItems: 'center' },
  heroLogo: { height: 88, width: '80%', marginBottom: spacing.md },
  logo: { height: 48, width: '100%', marginBottom: spacing.sm },
  compactLogo: { height: 32, width: '100%', marginBottom: 4 },
  heroTitle: { ...typography.heading, textAlign: 'center' },
  name: { ...typography.caption, fontWeight: '700', textAlign: 'center' },
});
