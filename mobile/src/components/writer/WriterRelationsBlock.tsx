import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { EntitySearchSheet } from './EntitySearchSheet';
import type { EntityKind } from './entity-search';
import type { EntityHit, WriterArticle } from './writer-article';

type Props = {
  article: WriterArticle;
  onChange: (patch: Partial<WriterArticle>) => void;
};

type Sheet = EntityKind | null;

export function WriterRelationsBlock({ article, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [sheet, setSheet] = useState<Sheet>(null);

  const chips = (items: EntityHit[], clear: (id: string) => void) =>
    items.map((hit) => (
      <Pressable key={hit.id} onPress={() => clear(hit.id)} style={[styles.chip, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.white, fontSize: 13 }}>{hit.label}</Text>
      </Pressable>
    ));

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('writerGalleryLink')}</Text>
      <View style={styles.chips}>{article.gallery ? chips([article.gallery], () => onChange({ gallery: null })) : null}</View>
      <Pressable onPress={() => setSheet('gallery')} style={[styles.btn, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text }}>{t('searchGallery')}</Text>
      </Pressable>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('writerRelatedPlayers')}</Text>
      <View style={styles.chips}>
        {chips(article.relatedPlayers, (id) => onChange({ relatedPlayers: article.relatedPlayers.filter((p) => p.id !== id) }))}
      </View>
      <Pressable onPress={() => setSheet('player')} style={[styles.btn, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text }}>{t('searchPlayers')}</Text>
      </Pressable>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('writerRelatedMatches')}</Text>
      <View style={styles.chips}>
        {chips(article.relatedMatches, (id) => onChange({ relatedMatches: article.relatedMatches.filter((m) => m.id !== id) }))}
      </View>
      <Pressable onPress={() => setSheet('match')} style={[styles.btn, { borderColor: colors.border }]}>
        <Text style={{ color: colors.text }}>{t('searchMatches')}</Text>
      </Pressable>
      <EntitySearchSheet
        visible={sheet === 'gallery'}
        kind="gallery"
        multiple={false}
        selected={article.gallery ? [article.gallery] : []}
        onClose={() => setSheet(null)}
        onChange={(next) => onChange({ gallery: next[0] ?? null })}
      />
      <EntitySearchSheet
        visible={sheet === 'player'}
        kind="player"
        multiple
        selected={article.relatedPlayers}
        onClose={() => setSheet(null)}
        onChange={(relatedPlayers) => onChange({ relatedPlayers })}
      />
      <EntitySearchSheet
        visible={sheet === 'match'}
        kind="match"
        multiple
        selected={article.relatedMatches}
        onClose={() => setSheet(null)}
        onChange={(relatedMatches) => onChange({ relatedMatches })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.caption, fontWeight: '600', marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btn: { borderWidth: 1, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
});
