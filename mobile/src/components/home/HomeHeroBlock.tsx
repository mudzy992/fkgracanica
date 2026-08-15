import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { User } from '../../types/api';
import { HomeModuleCtas } from './HomeModuleCtas';
import type { HomeHeroConfig } from './pick-hero-config';

const HERO_ON_IMAGE = {
  title: '#FFFFFF',
  subtitle: 'rgba(255, 255, 255, 0.84)',
  welcome: 'rgba(255, 255, 255, 0.72)',
  kicker: 'rgba(255, 255, 255, 0.9)',
} as const;

type Props = {
  user: User | null;
  clubName: string;
  crestUrl: string | null;
  hero: HomeHeroConfig | null;
  showMembership: boolean;
  showTickets: boolean;
  ctasLoading: boolean;
};

export function HomeHeroBlock({
  user,
  clubName,
  crestUrl,
  hero,
  showMembership,
  showTickets,
  ctasLoading,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email;
  const title = (hero?.title ?? clubName) || t('appName');
  const subtitle = hero?.subtitle ?? t('homeTagline');
  const welcomeLine = displayName ? `${t('welcome')}, ${displayName}` : t('guestMode');
  const showCtas = !ctasLoading && (showMembership || showTickets);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]}>
      <View style={styles.visual}>
        {hero?.backgroundImage ? (
          <RemoteImage path={hero.backgroundImage} variant="original" style={styles.backdrop} />
        ) : (
          <View style={[styles.backdrop, { backgroundColor: colors.primary }]} />
        )}
        <View style={styles.scrim} />
        <LinearGradient
          colors={['transparent', 'rgba(5, 10, 20, 0.5)']}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[colors.surface, 'transparent', 'transparent', colors.surface]}
          locations={[0, 0.16, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.inner, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.copy}>
            {crestUrl ? (
              <RemoteImage
                path={crestUrl}
                variant="original"
                contentFit="contain"
                transparent
                style={styles.crest}
              />
            ) : null}
            {hero?.foundedYear ? (
              <Text style={[styles.kicker, { color: HERO_ON_IMAGE.kicker }]}>
                {t('homeFounded', { year: hero.foundedYear })}
              </Text>
            ) : null}
            <Text style={[styles.title, { color: HERO_ON_IMAGE.title }]} accessibilityRole="header">
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: HERO_ON_IMAGE.subtitle }]}>{subtitle}</Text>
            <Text style={[styles.welcome, { color: HERO_ON_IMAGE.welcome }]}>{welcomeLine}</Text>
          </View>
          {showCtas ? (
            <View style={styles.ctaZone}>
              <HomeModuleCtas showMembership={showMembership} showTickets={showTickets} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  visual: { minHeight: 348, overflow: 'hidden' },
  backdrop: { ...StyleSheet.absoluteFill, height: undefined, borderRadius: 0 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 20, 0.18)' },
  inner: { flex: 1, justifyContent: 'flex-end' },
  copy: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  crest: { width: 80, height: 80, marginBottom: spacing.md, borderRadius: 0 },
  kicker: { ...typography.caption, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  title: { ...typography.display, textTransform: 'uppercase', maxWidth: 310 },
  subtitle: { ...typography.body, marginTop: spacing.sm, maxWidth: 280 },
  welcome: { ...typography.caption, marginTop: spacing.md, fontWeight: '700', textTransform: 'uppercase' },
  ctaZone: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
