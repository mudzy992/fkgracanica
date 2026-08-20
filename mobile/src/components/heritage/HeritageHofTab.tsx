import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import type { HeritageItem } from './load-heritage';
import { groupHofByYear } from './heritage-utils';
import { HeritageHofCard } from './HeritageHofCard';
import { HeritageHofRail } from './HeritageHofRail';

type HofSection = { year: string; data: HeritageItem[] };

type Props = { items: HeritageItem[] };

export function HeritageHofTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const listRef = useRef<SectionList<HeritageItem, HofSection>>(null);
  const sections = useMemo(() => groupHofByYear(items).map(({ year, items: groupItems }) => ({ year, data: groupItems })), [items]);
  const [activeYear, setActiveYear] = useState(sections[0]?.year ?? '');

  const ticks = useMemo(() => sections.map(({ year }) => ({ id: year, label: year })), [sections]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const section = viewableItems[0]?.section as HofSection | undefined;
    if (section?.year) setActiveYear(section.year);
  }).current;

  const scrollToYear = useCallback(
    (year: string) => {
      const sectionIndex = sections.findIndex((section) => section.year === year);
      if (sectionIndex < 0) return;
      setActiveYear(year);
      const scroll = () =>
        listRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, viewPosition: 0.12, animated: true });
      scroll();
      setTimeout(scroll, 50);
    },
    [sections],
  );

  if (items.length === 0) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 55 }}
        ListHeaderComponent={
          <Text style={[styles.kicker, { color: colors.textMuted }]}>{t('legends')}</Text>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionYear, { color: colors.textMuted }]}>{section.year}</Text>
        )}
        renderItem={({ item }) => <HeritageHofCard item={item} />}
        SectionSeparatorComponent={SectionGap}
        ItemSeparatorComponent={ItemGap}
        contentContainerStyle={styles.list}
      />
      <HeritageHofRail items={ticks} activeId={activeYear} onSelect={scrollToYear} />
    </View>
  );
}

function SectionGap() {
  return <View style={styles.sectionGap} />;
}

function ItemGap() {
  return <View style={styles.itemGap} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingBottom: spacing.xl },
  sectionGap: { height: spacing.lg },
  itemGap: { height: spacing.md },
  kicker: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  sectionYear: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
