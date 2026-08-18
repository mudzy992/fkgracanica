import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { extractYears } from './heritage-utils';
import { HeritageHofChapter } from './HeritageHofChapter';
import { HeritageHofRail } from './HeritageHofRail';

type Props = { items: HeritageItem[] };

function yearTick(item: HeritageItem): string {
  return extractYears(item.years)[0] ?? item.title.trim().split(/\s+/).pop() ?? item.title;
}

export function HeritageHofTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const listRef = useRef<FlatList<HeritageItem>>(null);
  const [active, setActive] = useState(0);
  const ticks = useMemo(
    () => items.map((item) => ({ id: item.id, label: yearTick(item) })),
    [items],
  );

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const index = viewableItems[0]?.index;
    if (typeof index === 'number') setActive(index);
  }).current;

  const scrollToId = useCallback(
    (id: string) => {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return;
      setActive(index);
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.12 });
    },
    [items],
  );

  if (items.length === 0) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 55 }}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true }), 50);
        }}
        ListHeaderComponent={
          <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('legends')}</Text>
        }
        renderItem={({ item }) => <HeritageHofChapter item={item} />}
        ItemSeparatorComponent={HofGap}
        contentContainerStyle={styles.list}
      />
      <HeritageHofRail items={ticks} activeId={items[active]?.id} onSelect={scrollToId} />
    </View>
  );
}

function HofGap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingBottom: spacing.xl },
  gap: { height: spacing.xl },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: spacing.md,
  },
});
