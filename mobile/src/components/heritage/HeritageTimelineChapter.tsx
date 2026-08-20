import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState((item.description?.length ?? 0) > 300);

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    if (expanded) return;
    const lineCount = e.nativeEvent.lines.length;
    if (lineCount < 5) {
      setCanExpand(false);
    } else if (lineCount === 5) {
      setCanExpand((item.description?.length ?? 0) > 300);
    }
  };

  return (
    <View style={[styles.chapter, { height, backgroundColor: colors.background }]}>
      <HeritageFilmPhoto path={item.imagePath} />
      <HeritageTimelineShade />
      <Text style={styles.yearGhost}>{item.year}</Text>
      <View style={styles.copy}>
        <Text style={[styles.year, { color: colors.primaryLight }]}>{item.year}</Text>
        <Text style={[styles.title, { color: colors.white }]}>{item.title}</Text>
        {item.description ? (
          <>
            <Text
              style={styles.body}
              numberOfLines={expanded ? undefined : 5}
              onTextLayout={handleTextLayout}
            >
              {item.description}
            </Text>
            {canExpand && !expanded ? (
              <Pressable
                onPress={() => setExpanded(true)}
                accessibilityRole="button"
                accessibilityLabel={t('readMore')}
              >
                <Text style={[styles.readMore, { color: colors.primaryLight }]}>{t('readMore')}</Text>
              </Pressable>
            ) : null}
          </>
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
  readMore: { ...typography.caption, fontWeight: '700', marginTop: spacing.xs },
});
