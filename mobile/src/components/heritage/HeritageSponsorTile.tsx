import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import type { SponsorTierKey } from './sponsor-tiers';
import { SPONSOR_TIER_ACCENT } from './sponsor-tiers';

type Props = {
  item: HeritageItem;
  tier: SponsorTierKey;
  compact?: boolean;
};

export function HeritageSponsorTile({ item, tier, compact }: Props) {
  const { colors } = useTheme();
  const accent = SPONSOR_TIER_ACCENT[tier];

  return (
    <Pressable
      onPress={() => item.url && void Linking.openURL(item.url)}
      disabled={!item.url}
      accessibilityRole={item.url ? 'link' : 'none'}
      accessibilityLabel={item.title}
      style={({ pressed }) => [
        compact ? styles.compact : styles.tile,
        { backgroundColor: colors.background, borderColor: accent, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      {item.imagePath ? (
        <RemoteImage
          path={item.imagePath}
          variant="medium"
          transparent
          contentFit="contain"
          style={compact ? styles.compactLogo : styles.logo}
        />
      ) : null}
      <Text style={[compact ? styles.compactName : styles.name, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  compact: {
    width: '31%',
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
  },
  logo: { height: 52, width: '100%', marginBottom: spacing.sm },
  compactLogo: { height: 36, width: '100%', marginBottom: 4 },
  name: { ...typography.caption, fontWeight: '700', textAlign: 'center' },
  compactName: { ...typography.caption, fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
