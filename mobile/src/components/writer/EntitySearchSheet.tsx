import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { filterEntityHits, loadEntityHits, type EntityKind } from './entity-search';
import type { EntityHit } from './writer-article';

type Props = {
  visible: boolean;
  kind: EntityKind;
  multiple: boolean;
  selected: EntityHit[];
  onClose: () => void;
  onChange: (next: EntityHit[]) => void;
};

export function EntitySearchSheet({ visible, kind, multiple, selected, onClose, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [all, setAll] = useState<EntityHit[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    void loadEntityHits(kind).then(setAll).catch(() => setAll([]));
  }, [visible, kind]);

  const hits = useMemo(() => filterEntityHits(all, debounced), [all, debounced]);
  const selectedIds = new Set(selected.map((s) => s.id));

  const toggle = (hit: EntityHit) => {
    if (!multiple) {
      onChange(selectedIds.has(hit.id) ? [] : [hit]);
      onClose();
      return;
    }
    onChange(selectedIds.has(hit.id) ? selected.filter((s) => s.id !== hit.id) : [...selected, hit]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t('writerSearch')}</Text>
          <ScrollView horizontal contentContainerStyle={styles.chips}>
            {selected.map((hit) => (
              <Pressable key={hit.id} onPress={() => toggle(hit)} style={[styles.chip, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.white }}>{hit.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('writerSearchHint')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
          <ScrollView style={styles.list}>
            {hits.length === 0 ? (
              <Text style={[typography.body, { color: colors.textMuted }]}>{t('writerNoResults')}</Text>
            ) : (
              hits.map((hit) => {
                const active = selectedIds.has(hit.id);
                return (
                  <Pressable
                    key={hit.id}
                    onPress={() => toggle(hit)}
                    style={[styles.row, { borderColor: colors.border, backgroundColor: active ? colors.primary : colors.surface }]}
                  >
                    <Text style={{ color: active ? colors.white : colors.text }}>{hit.label}</Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={[styles.close, { color: colors.textMuted }]}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.md, gap: spacing.sm },
  chips: { gap: spacing.xs, paddingVertical: spacing.xs },
  chip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  list: { maxHeight: 320 },
  row: { borderWidth: 1, borderRadius: 10, padding: spacing.md, marginBottom: spacing.xs },
  close: { textAlign: 'center', paddingVertical: spacing.sm },
});
