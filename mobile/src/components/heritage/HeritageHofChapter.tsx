import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { extractYears } from './heritage-utils';
import { HeritageFilmPhoto } from './HeritageFilmPhoto';
import { HeritageTimelineShade } from './HeritageTimelineShade';

type Props = {
  item: HeritageItem;
  height: number;
};

export function HeritageHofChapter({ item, height }: Props) {
  const { colors } = useTheme();
  const ghost = extractYears(item.years)[0] ?? item.title[0];

  return (
    <View style={[styles.chapter, { height, backgroundColor: colors.background }]}>
      <HeritageFilmPhoto path={item.imagePath} />
      <HeritageTimelineShade />
      <Text style={styles.ghost}>{ghost}</Text>
      <View style={styles.copy}>
        {item.years ? (
          <Text style={[styles.kicker, { color: colors.primaryLight }]}>{item.years}</Text>
        ) : null}
        <Text style={styles.name}>{item.title}</Text>
        {item.role ? <Text style={[styles.role, { color: colors.primaryLight }]}>{item.role}</Text> : null}
        {item.description ? (
          <Text style={styles.bio} numberOfLines={5}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chapter: { overflow: 'hidden', justifyContent: 'flex-end' },
  ghost: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    fontSize: 72,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.25)',
  },
  copy: { padding: spacing.lg, paddingRight: 72, gap: spacing.sm, zIndex: 1 },
  kicker: { ...typography.caption, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  name: { ...typography.title, color: '#fff', fontWeight: '800' },
  role: { ...typography.caption, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  bio: { ...typography.body, lineHeight: 22, color: 'rgba(255,255,255,0.7)' },
});
