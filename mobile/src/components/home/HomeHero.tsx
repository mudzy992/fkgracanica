import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { User } from '../../types/api';
import type { HomeHeroConfig } from './pick-hero-config';

type Props = {
  user: User | null;
  clubName: string;
  crestUrl: string | null;
  hero: HomeHeroConfig | null;
};

export function HomeHero({ user, clubName, crestUrl, hero }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email;
  const title = (hero?.title ?? clubName) || t('appName');
  const subtitle = hero?.subtitle ?? t('homeTagline');
  const welcomeLine = displayName ? `${t('welcome')}, ${displayName}` : t('guestMode');

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]}>
      {hero?.backgroundImage ? (
        <RemoteImage path={hero.backgroundImage} variant="original" style={styles.backdrop} />
      ) : null}
      <View style={styles.scrim} />
      <LinearGradient
        colors={[colors.surface, 'transparent', 'transparent', colors.surface]}
        locations={[0, 0.22, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        {crestUrl ? (
          <View style={styles.crestBox}>
            <RemoteImage path={crestUrl} variant="thumb" style={styles.crest} />
          </View>
        ) : null}
        {hero?.foundedYear ? (
          <Text style={[styles.kicker, { color: colors.primaryLight }]}>
            {t('homeFounded', { year: hero.foundedYear })}
          </Text>
        ) : null}
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        <Text style={[styles.welcome, { color: colors.primary }]}>{welcomeLine}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 380, overflow: 'hidden' },
  backdrop: { ...StyleSheet.absoluteFill, height: undefined, borderRadius: 0 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 10, 20, 0.28)' },
  content: { flex: 1, justifyContent: 'flex-end', padding: spacing.lg, paddingTop: spacing.xl },
  crestBox: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  crest: { width: '100%', height: '100%', borderRadius: 14 },
  kicker: { ...typography.caption, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' },
  title: { ...typography.display, textTransform: 'uppercase', maxWidth: 310 },
  subtitle: { ...typography.body, marginTop: spacing.sm, maxWidth: 280 },
  welcome: { ...typography.caption, marginTop: spacing.md, fontWeight: '700', textTransform: 'uppercase' },
});
