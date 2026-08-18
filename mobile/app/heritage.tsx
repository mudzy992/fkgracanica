import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HeritageHofTab } from '../src/components/heritage/HeritageHofTab';
import { HeritageMuseumTab } from '../src/components/heritage/HeritageMuseumTab';
import { HeritageSponsorsTab } from '../src/components/heritage/HeritageSponsorsTab';
import { HeritageTabs } from '../src/components/heritage/HeritageTabs';
import { HeritageTimelineTab } from '../src/components/heritage/HeritageTimelineTab';
import { HeritageTrophiesTab } from '../src/components/heritage/HeritageTrophiesTab';
import { loadHeritage, parseHeritageTab, type HeritageData, type HeritageTab } from '../src/components/heritage/load-heritage';
import { ListSkeleton } from '../src/components/ListSkeleton';
import { ScreenEmpty } from '../src/components/ScreenEmpty';
import { useTheme } from '../src/lib/theme-context';
import { spacing } from '../src/lib/theme';

const EMPTY: HeritageData = { sponsors: [], trophies: [], timeline: [], hall: [], museum: [] };

export default function HeritageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<HeritageTab>(() => parseHeritageTab(tabParam));
  const [data, setData] = useState<HeritageData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await loadHeritage());
    } catch {
      setData(EMPTY);
      setError(t('error'));
    }
  }, [t]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ListSkeleton />;
  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: t('heritage') }} />
        <ScreenEmpty
          message={error}
          icon="alert-circle-outline"
          actionLabel={t('retry')}
          onAction={() => {
            setLoading(true);
            void load().finally(() => setLoading(false));
          }}
        />
      </>
    );
  }

  const items = data[tab];
  const isFilm = tab === 'timeline' || tab === 'hall';

  return (
    <>
      <Stack.Screen options={{ title: t('heritage') }} />
      <View style={[styles.shell, { backgroundColor: colors.surface }]}>
        <View style={styles.tabs}>
          <HeritageTabs active={tab} onChange={setTab} />
        </View>
        {isFilm ? (
          items.length === 0 ? (
            <ScreenEmpty message={t('searchNoResults')} icon="file-tray-outline" compact />
          ) : tab === 'timeline' ? (
            <HeritageTimelineTab items={items} />
          ) : (
            <HeritageHofTab items={items} />
          )
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {items.length === 0 ? <ScreenEmpty message={t('searchNoResults')} icon="file-tray-outline" compact /> : null}
            {tab === 'sponsors' ? <HeritageSponsorsTab items={items} /> : null}
            {tab === 'trophies' ? <HeritageTrophiesTab items={items} /> : null}
            {tab === 'museum' ? <HeritageMuseumTab items={items} /> : null}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  tabs: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  content: { padding: spacing.md, gap: spacing.md },
});
