import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RemoteImage } from '../RemoteImage';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeTimelineItem } from './load-home-extras';

type Props = { items: HomeTimelineItem[] };

export function HomeHeritageCta({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  if (items.length === 0) return null;

  const years = items.map((item) => item.year).filter((year): year is number => year != null);
  const span = years.length > 0 ? `${Math.min(...years)} — ${Math.max(...years)}` : '';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/heritage', params: { tab: 'timeline' } })}
      accessibilityRole="button"
      accessibilityLabel={t('homeHeritageCta')}
      style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}
    >
      <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('homeHeritageKicker')}</Text>
      <View style={styles.film}>
        {items.map((item) => (
          <View key={item.id} style={styles.shot} collapsable={false}>
            <RemoteImage path={item.imagePath} variant="medium" contentFit="cover" style={styles.photo} />
            <View pointerEvents="none" style={styles.bw} />
          </View>
        ))}
        <LinearGradient
          colors={['rgba(5,10,20,0.15)', 'rgba(5,10,20,0.55)', 'rgba(5,10,20,0.92)']}
          locations={[0.15, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(5,10,20,0.55)', 'rgba(30,58,138,0.28)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.copy}>
          {span ? <Text style={[styles.span, { color: colors.primaryLight }]}>{span}</Text> : null}
          <Text style={styles.title}>{t('homeHeritageTitle')}</Text>
          <View style={styles.ctaRow}>
            <Text style={styles.cta}>{t('homeHeritageCta')}</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 11,
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  film: {
    height: 172,
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    isolation: 'isolate',
  },
  shot: { flex: 1, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', borderRadius: 0 },
  bw: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#fff',
    mixBlendMode: 'saturation',
  },
  copy: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: 4,
    zIndex: 1,
  },
  span: { ...typography.caption, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { ...typography.heading, color: '#fff', fontWeight: '800' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  cta: { ...typography.caption, color: '#fff', fontWeight: '700' },
});
