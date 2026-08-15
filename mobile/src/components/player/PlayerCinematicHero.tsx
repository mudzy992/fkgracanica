import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mediaUrl } from '../../lib/media';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { RemoteImage } from '../RemoteImage';

type ClubInfo = { name: string; crestPath?: string };

type Props = {
  firstName: string;
  lastName: string;
  position?: string;
  number?: number;
  photoPath?: string;
  club?: ClubInfo;
};

export function PlayerCinematicHero({
  firstName,
  lastName,
  position,
  number,
  photoPath,
  club,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bgUri = mediaUrl(photoPath, 'original');

  return (
    <View style={[styles.hero, { backgroundColor: colors.background }]}>
      {bgUri ? (
        <Image
          source={bgUri}
          style={styles.bg}
          contentFit="cover"
          contentPosition="top"
          blurRadius={18}
          transition={160}
        />
      ) : (
        <View style={[styles.bg, { backgroundColor: colors.surface }]} />
      )}
      <LinearGradient
        colors={['rgba(5,10,20,0.55)', 'rgba(5,10,20,0.35)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(5,10,20,0.65)', colors.background]}
        locations={[0.25, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        style={[styles.back, { top: insets.top + spacing.sm, backgroundColor: 'rgba(0,0,0,0.45)' }]}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/team'))}
        accessibilityRole="button"
        accessibilityLabel={t('playerBackTeam')}
      >
        <Ionicons name="arrow-back" size={16} color={colors.white} />
        <Text style={[styles.backText, { color: colors.white }]}>{t('playerBackTeam')}</Text>
      </Pressable>
      <View style={[styles.bottom, { paddingBottom: spacing.lg + 4 }]}>
        {photoPath ? (
          <View style={[styles.portraitShell, { borderColor: `${colors.link}44` }]}>
            <RemoteImage
              path={photoPath}
              variant="medium"
              contentFit="cover"
              style={styles.portrait}
            />
          </View>
        ) : null}
        <View style={styles.copy}>
          {number != null ? (
            <Text style={[styles.shirt, { color: colors.link }]}>{number}</Text>
          ) : null}
          {position ? (
            <View
              style={[
                styles.posPill,
                { borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}22` },
              ]}
            >
              <Text style={[styles.posText, { color: colors.link }]}>{position}</Text>
            </View>
          ) : null}
          <Text style={[styles.name, { color: colors.white }]}>
            {firstName}
            {lastName ? `\n${lastName}` : ''}
          </Text>
          {club?.name ? (
            <View style={styles.clubRow}>
              {club.crestPath ? (
                <RemoteImage
                  path={club.crestPath}
                  variant="original"
                  transparent
                  contentFit="contain"
                  style={styles.clubCrest}
                />
              ) : null}
              <Text style={[styles.clubName, { color: 'rgba(255,255,255,0.65)' }]} numberOfLines={1}>
                {club.name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 480, justifyContent: 'flex-end', overflow: 'hidden' },
  bg: {
    ...StyleSheet.absoluteFill,
    transform: [{ scale: 1.06 }],
    opacity: 0.72,
  },
  back: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  portraitShell: {
    width: 112,
    height: 148,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  portrait: { width: '100%', height: '100%', borderRadius: 0 },
  copy: { flex: 1, gap: spacing.sm, paddingBottom: 2 },
  shirt: { fontSize: 56, fontWeight: '800', opacity: 0.32, lineHeight: 56 },
  posPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  posText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
  },
  name: {
    ...typography.display,
    fontSize: 32,
    textTransform: 'uppercase',
    lineHeight: 36,
  },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  clubCrest: { width: 22, height: 22, borderRadius: 0, backgroundColor: 'transparent' },
  clubName: { ...typography.caption, fontWeight: '600', flex: 1 },
});
