import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import type { HeritageItem } from './load-heritage';
import { sortStoryChapters } from './heritage-utils';
import { HeritageTimelineChapter } from './HeritageTimelineChapter';
import { HeritageTimelineCoda } from './HeritageTimelineCoda';
import { HeritageTimelineYearRail } from './HeritageTimelineYearRail';

type Page = { key: string; item?: HeritageItem };

type Props = { items: HeritageItem[] };

export function HeritageTimelineTab({ items }: Props) {
  const listRef = useRef<FlatList<Page>>(null);
  const [height, setHeight] = useState(0);
  const [active, setActive] = useState(0);
  const chapters = useMemo(() => sortStoryChapters(items), [items]);
  const pages = useMemo<Page[]>(
    () => [...chapters.map((item) => ({ key: item.id, item })), { key: 'coda' }],
    [chapters],
  );

  const syncActive = useCallback(
    (offsetY: number) => {
      if (!height) return;
      const index = Math.round(offsetY / height);
      setActive(Math.min(Math.max(index, 0), chapters.length - 1));
    },
    [chapters.length, height],
  );

  const onMomentum = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncActive(event.nativeEvent.contentOffset.y);
    },
    [syncActive],
  );

  const scrollToId = useCallback(
    (id: string) => {
      const index = chapters.findIndex((chapter) => chapter.id === id);
      if (index < 0) return;
      setActive(index);
      listRef.current?.scrollToIndex({ index, animated: true });
    },
    [chapters],
  );

  if (chapters.length === 0) return null;

  return (
    <View style={styles.root} onLayout={(event) => setHeight(Math.round(event.nativeEvent.layout.height))}>
      {height > 0 ? (
        <FlatList
          ref={listRef}
          data={pages}
          keyExtractor={(page) => page.key}
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
          renderItem={({ item }) =>
            item.item ? (
              <HeritageTimelineChapter item={item.item} height={height} />
            ) : (
              <HeritageTimelineCoda height={height} />
            )
          }
        />
      ) : null}
      <HeritageTimelineYearRail
        items={chapters.map((chapter) => ({ id: chapter.id, label: String(chapter.year ?? '') }))}
        activeId={chapters[active]?.id}
        onSelect={scrollToId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
