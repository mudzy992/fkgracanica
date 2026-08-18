import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';

const GOLD = '#C9A227';

type Props = { item: HeritageItem };

export function HeritageSponsorHero({ item }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => item.url && void Linking.openURL(item.url)}
      disabled={!item.url}
      accessibilityRole={item.url ? 'link' : 'none'}
      accessibilityLabel={item.title}
      style={({ pressed }) => [styles.plate, { backgroundColor: colors.background, opacity: pressed ? 0.94 : 1 }]}
    >
      <View style={styles.glow} />
      <Text style={styles.badge}>{t('sponsorGeneral')}</Text>
      {item.imagePath ? (
        <RemoteImage path={item.imagePath} variant="medium" transparent contentFit="contain" style={styles.logo} />
      ) : null}
      <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
      <Text style={styles.sub}>{t('sponsorGeneralSub')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(30,58,138,0.35)',
  },
  badge: {
    ...typography.caption,
    color: GOLD,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  logo: { width: '72%', height: 96, marginBottom: spacing.md },
  name: { ...typography.title, fontWeight: '800', textAlign: 'center' },
  sub: { ...typography.caption, color: 'rgba(255,255,255,0.45)', marginTop: spacing.xs, textAlign: 'center' },
});
