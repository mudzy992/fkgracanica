import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import type { HeritageItem } from './load-heritage';
import { extractYears } from './heritage-utils';
import { HeritageHofChapter } from './HeritageHofChapter';
import { HeritageTimelineYearRail } from './HeritageTimelineYearRail';

type Props = { items: HeritageItem[] };

function railLabel(item: HeritageItem): string {
  return extractYears(item.years)[0] ?? item.title.trim().split(/\s+/).pop() ?? item.title;
}

export function HeritageHofTab({ items }: Props) {
  const listRef = useRef<FlatList<HeritageItem>>(null);
  const [height, setHeight] = useState(0);
  const [active, setActive] = useState(0);
  const ticks = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: railLabel(item),
        headline: item.years || railLabel(item),
      })),
    [items],
  );

  const syncActive = useCallback(
    (offsetY: number) => {
      if (!height) return;
      const index = Math.round(offsetY / height);
      setActive(Math.min(Math.max(index, 0), items.length - 1));
    },
    [height, items.length],
  );

  const onMomentum = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncActive(event.nativeEvent.contentOffset.y);
    },
    [syncActive],
  );

  const scrollToId = useCallback(
    (id: string) => {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return;
      setActive(index);
      listRef.current?.scrollToIndex({ index, animated: true });
    },
    [items],
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.root} onLayout={(event) => setHeight(Math.round(event.nativeEvent.layout.height))}>
      {height > 0 ? (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          disableIntervalMomentum
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onMomentumScrollEnd={onMomentum}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true }), 50);
          }}
          renderItem={({ item }) => <HeritageHofChapter item={item} height={height} />}
        />
      ) : null}
      <HeritageTimelineYearRail items={ticks} activeId={items[active]?.id} onSelect={scrollToId} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
