import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HomeLeagueRow } from './load-home-extras';
import { HomeLeagueRowItem } from './HomeLeagueRowItem';
import { homeSurface } from './home-surface';

type Props = { rows: HomeLeagueRow[] };

export function HomeLeagueSnippet({ rows }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  if (rows.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('leagueTable')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('homeLeagueSubtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.seeAllBtn,
            { backgroundColor: colors.background, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={() => router.push('/league')}
          accessibilityRole="button"
          accessibilityLabel={t('homeSeeAll')}
        >
          <Text style={[styles.seeAll, { color: colors.link }]}>{t('homeSeeAll')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      </View>

      <View style={[homeSurface(colors), styles.table]}>
        <View style={[styles.accent, { backgroundColor: colors.primary }]} />
        <View style={styles.head}>
          <Text style={[styles.headCell, styles.headPos, { color: colors.textMuted }]}>#</Text>
          <Text style={[styles.headCell, styles.headClub, { color: colors.textMuted }]}>{t('club')}</Text>
          <Text style={[styles.headCell, styles.headForm, { color: colors.textMuted }]}>{t('homeForm')}</Text>
          <Text style={[styles.headCell, styles.headPts, { color: colors.textMuted }]}>{t('points')}</Text>
        </View>
        <View style={styles.list}>
          {rows.map((row) => (
            <HomeLeagueRowItem key={row.id} row={row} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerCopy: { flex: 1 },
  title: { ...typography.heading, fontSize: 22, fontWeight: '800' },
  subtitle: { ...typography.caption, marginTop: spacing.xs },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  seeAll: { ...typography.caption, fontWeight: '700' },
  table: { overflow: 'hidden', position: 'relative', paddingTop: spacing.md + 2 },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, marginBottom: spacing.xs },
  headCell: { ...typography.caption, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  headPos: { width: 26, textAlign: 'center' },
  headClub: { flex: 1, marginLeft: 40 },
  headForm: { width: 47, textAlign: 'center' },
  headPts: { width: 28, textAlign: 'right' },
  list: { gap: spacing.xs },
});
