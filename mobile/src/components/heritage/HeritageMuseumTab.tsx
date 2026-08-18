import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { NativePhotoPager } from '../gallery/NativePhotoPager';
import type { PagerPhoto } from '../gallery/photo-pager-types';
import { ScreenEmpty } from '../ScreenEmpty';
import { spacing, typography } from '../../lib/theme';
import { useTheme } from '../../lib/theme-context';
import { HeritageMuseumExhibit } from './HeritageMuseumExhibit';
import { HeritageMuseumFilters } from './HeritageMuseumFilters';
import { HeritageMuseumKpis } from './HeritageMuseumKpis';
import type { HeritageItem } from './load-heritage';
import { filterMuseum, museumCategories, museumYears, splitFeaturedMuseum } from './museum-filter';

type Props = { items: HeritageItem[] };

export function HeritageMuseumTab({ items }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [year, setYear] = useState<number | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [pagerIndex, setPagerIndex] = useState<number | null>(null);

  const years = useMemo(() => museumYears(items), [items]);
  const categories = useMemo(() => museumCategories(items), [items]);
  const filtered = useMemo(() => filterMuseum(items, year, category), [items, year, category]);
  const { featured, rest } = splitFeaturedMuseum(filtered);
  const photos = useMemo((): PagerPhoto[] => {
    return filtered
      .filter((item) => item.imagePath)
      .map((item) => ({ id: item.id, path: item.imagePath, caption: item.title }));
  }, [filtered]);

  const openItem = (item: HeritageItem) => {
    const index = photos.findIndex((photo) => photo.id === item.id);
    if (index >= 0) setPagerIndex(index);
  };

  return (
    <View style={styles.wrap}>
      <HeritageMuseumKpis items={items.length} years={years.length} categories={categories.length} />
      <HeritageMuseumFilters
        years={years}
        categories={categories}
        year={year}
        category={category}
        onYear={setYear}
        onCategory={setCategory}
      />
      <Text style={[styles.heading, { color: colors.text }]}>{t('museumCollection')}</Text>
      {featured ? (
        <HeritageMuseumExhibit
          item={featured}
          featured
          onPress={featured.imagePath ? () => openItem(featured) : undefined}
        />
      ) : (
        <ScreenEmpty message={t('museumEmpty')} icon="file-tray-outline" compact />
      )}
      {rest.length > 0 ? (
        <View style={styles.grid}>
          {rest.map((item) => (
            <View key={item.id} style={styles.cell}>
              <HeritageMuseumExhibit
                item={item}
                onPress={item.imagePath ? () => openItem(item) : undefined}
              />
            </View>
          ))}
        </View>
      ) : null}
      <NativePhotoPager
        visible={pagerIndex != null}
        photos={photos}
        index={pagerIndex ?? 0}
        onClose={() => setPagerIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  heading: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  cell: { width: '48.5%' },
});
