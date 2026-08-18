import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { HeritageFilmPhoto } from './HeritageFilmPhoto';
import { HeritageTimelineShade } from './HeritageTimelineShade';

type Props = {
  item: HeritageItem;
  height: number;
};

export function HeritageTimelineChapter({ item, height }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.chapter, { height, backgroundColor: colors.background }]}>
      <HeritageFilmPhoto path={item.imagePath} />
      <HeritageTimelineShade />
      <Text style={styles.yearGhost}>{item.year}</Text>
      <View style={styles.copy}>
        <Text style={[styles.year, { color: colors.primaryLight }]}>{item.year}</Text>
        <Text style={[styles.title, { color: colors.white }]}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.body} numberOfLines={5}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chapter: { overflow: 'hidden', justifyContent: 'flex-end' },
  yearGhost: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    fontSize: 72,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.25)',
  },
  copy: { padding: spacing.lg, paddingRight: 72, gap: spacing.sm, zIndex: 1 },
  year: { ...typography.caption, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  title: { ...typography.title, fontWeight: '800' },
  body: { ...typography.body, lineHeight: 22, color: 'rgba(255,255,255,0.7)' },
});
