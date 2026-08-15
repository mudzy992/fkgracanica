import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/primitives/Screen';
import { ScreenLoading } from '../components/ScreenLoading';
import { useTheme } from '../lib/theme-context';
import { spacing } from '../lib/theme';
import { CatalogBlock } from './CatalogBlock';
import { RoadmapBlock } from './RoadmapBlock';
import { RolesBlock } from './RolesBlock';
import { ShowcaseCta } from './ShowcaseCta';
import { ShowcaseHero } from './ShowcaseHero';
import { useShowcase } from './use-showcase';
import type { ShowcaseSection } from './types';

const IDS = [
  'surfaces',
  'fan',
  'identity',
  'competition',
  'membership-tickets',
  'content',
  'admin',
  'mobile',
  'club-needs',
];

function pick(sections: ShowcaseSection[], id: string) {
  return sections.find((s) => s.id === id);
}

export function ShowcaseScreen() {
  const { colors } = useTheme();
  const { data, loading, error } = useShowcase();

  if (loading) return <ScreenLoading />;

  if (error || !data) {
    return (
      <Screen>
        <Text style={{ color: colors.danger }}>Prezentacija trenutno nije dostupna.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.top}>
        <Text style={[styles.flag, { color: colors.primary }]}>U izradi</Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text style={[styles.login, { color: colors.primary }]}>Prijava</Text>
          </Pressable>
        </Link>
      </View>
      <ShowcaseHero club={data.club} percent={data.overallPercent} />
      {IDS.map((id) => {
        const section = pick(data.sections, id);
        if (!section) return null;
        return <CatalogBlock key={id} section={section} modules={data.modules} />;
      })}
      <RolesBlock roles={data.roles} />
      <RoadmapBlock modules={data.modules} />
      <ShowcaseCta club={data.club} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  flag: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  login: { fontSize: 14, fontWeight: '600' },
});
