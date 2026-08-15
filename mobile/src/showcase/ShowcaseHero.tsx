import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme-context';
import { mediaUrl } from '../lib/media';
import { spacing, typography } from '../lib/theme';
import type { ShowcaseClub } from './types';

export function ShowcaseHero({ club, percent }: { club: ShowcaseClub; percent: number }) {
  const { colors } = useTheme();
  const crest = mediaUrl(club.crestUrl, 'thumb');

  return (
    <View style={styles.wrap}>
      {crest ? <Image source={{ uri: crest }} style={styles.crest} /> : null}
      <Text style={[styles.kicker, { color: colors.primaryLight }]}>U IZRADI</Text>
      <Text style={[styles.title, { color: colors.text }]}>{club.name}</Text>
      {club.tagline ? <Text style={[styles.tag, { color: colors.textMuted }]}>{club.tagline}</Text> : null}
      <Text style={[styles.percent, { color: colors.primary }]}>{percent}%</Text>
      <Text style={[styles.caption, { color: colors.textMuted }]}>spremnost za lansiranje</Text>
      {club.launchNote ? (
        <Text style={[styles.note, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}>
          {club.launchNote}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.lg },
  crest: { height: 64, width: 64, resizeMode: 'contain' },
  kicker: { ...typography.caption, fontWeight: '700', letterSpacing: 1.5 },
  title: { ...typography.heading, fontSize: 28 },
  tag: { ...typography.body },
  percent: { fontSize: 36, fontWeight: '800' },
  caption: { ...typography.caption },
  note: { ...typography.caption, borderRadius: 12, borderWidth: 1, marginTop: spacing.sm, padding: spacing.md },
});
