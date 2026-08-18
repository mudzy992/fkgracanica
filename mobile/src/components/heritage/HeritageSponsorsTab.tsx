import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { HeritageSponsorHero } from './HeritageSponsorHero';
import { HeritageSponsorTile } from './HeritageSponsorTile';
import {
  normalizeSponsorTier,
  SPONSOR_TIER_I18N,
  SPONSOR_TIER_ORDER,
  SPONSOR_TIER_SUB,
} from './sponsor-tiers';

type Props = { items: HeritageItem[] };

export function HeritageSponsorsTab({ items }: Props) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {SPONSOR_TIER_ORDER.map((tier) => {
        const group = items.filter((item) => normalizeSponsorTier(item.tier) === tier);
        if (!group.length) return null;
        if (tier === 'GENERAL') {
          return (
            <View key={tier} style={styles.section}>
              {group.map((item) => (
                <HeritageSponsorHero key={item.id} item={item} />
              ))}
            </View>
          );
        }
        const compact = tier === 'BRONZE' || tier === 'PARTNER';
        return (
          <View key={tier} style={styles.section}>
            <TierHeading title={t(SPONSOR_TIER_I18N[tier])} subtitle={t(SPONSOR_TIER_SUB[tier])} />
            <View style={compact ? styles.compactGrid : styles.grid}>
              {group.map((item) => (
                <HeritageSponsorTile key={item.id} item={item} tier={tier} compact={compact} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TierHeading({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.headingWrap}>
      <Text style={[styles.kicker, { color: colors.textMuted }]}>{title}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  section: { gap: spacing.md },
  headingWrap: { alignItems: 'center', gap: 4 },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sub: { ...typography.caption, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  compactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
});
