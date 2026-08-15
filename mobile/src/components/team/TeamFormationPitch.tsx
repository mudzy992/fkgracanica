import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { RemoteImage } from '../RemoteImage';
import { POSITION_LABELS, type TeamPitchSlot } from './load-team-screen';
import { TeamPitchMarkings } from './TeamPitchMarkings';

type Props = {
  formation?: string;
  slots: TeamPitchSlot[];
};

export function TeamFormationPitch({ formation, slots }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  if (slots.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {t('teamStartingXi')}
      </Text>
      <View style={[styles.card, { borderColor: `${colors.primary}33`, backgroundColor: colors.background }]}>
        {formation ? (
          <View style={[styles.badge, { borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}18` }]}>
            <Text style={[styles.badgeText, { color: colors.link }]}>{formation}</Text>
          </View>
        ) : null}
        <View style={[styles.pitch, { shadowColor: colors.primary }]}>
          <TeamPitchMarkings />
          {slots.map((slot) => {
            const p = slot.player;
            const label = p
              ? `${p.firstName.slice(0, 1)}. ${p.lastName}`
              : POSITION_LABELS[slot.lineRole] ?? slot.lineRole;
            return (
              <Pressable
                key={slot.key}
                style={[styles.token, { left: `${slot.left}%`, top: `${slot.top}%` }]}
                onPress={() => (p ? router.push(`/player/${p.id}`) : undefined)}
                disabled={!p}
                accessibilityRole={p ? 'button' : undefined}
                accessibilityLabel={label}
              >
                {p?.photoPath ? (
                  <RemoteImage path={p.photoPath} variant="thumb" contentFit="cover" style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarNum, { color: colors.white }]}>
                      {p?.number ?? label.slice(0, 2)}
                    </Text>
                  </View>
                )}
                <Text style={styles.tokenName} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { ...typography.heading, fontSize: 20, fontWeight: '800' },
  card: { borderRadius: 22, borderWidth: 1, padding: spacing.md, gap: spacing.md },
  badge: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: { ...typography.caption, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  pitch: {
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  token: {
    position: 'absolute',
    width: 64,
    marginLeft: -32,
    marginTop: -28,
    alignItems: 'center',
    gap: 2,
    zIndex: 2,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff' },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarNum: { fontSize: 10, fontWeight: '800' },
  tokenName: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: 64,
  },
});
