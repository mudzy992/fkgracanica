import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../lib/api';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { useTheme } from '../../lib/theme-context';
import { spacing, typography } from '../../lib/theme';
import { uploadMedia } from '../../lib/upload-media';
import { RemoteImage } from '../RemoteImage';
import { PrimaryButton } from '../primitives/PrimaryButton';

type Asset = { id: string; path: string; filename: string };

type Props = {
  visible: boolean;
  multiple?: boolean;
  selected?: string[];
  onClose: () => void;
  onConfirm: (paths: string[]) => void;
};

export function MediaPickerSheet({ visible, multiple, selected = [], onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [picked, setPicked] = useState<string[]>(selected);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPicked(selected);
    const timer = setTimeout(() => {
      setLoading(true);
      void api
        .get('/media/assets', { params: { search: query, limit: 60 } })
        .then(({ data }) => {
          setAssets(
            asArray(asRecord(data).data ?? data).map((row) => {
              const r = asRecord(row);
              return {
                id: asString(r.id),
                path: asString(r.originalPath || r.path),
                filename: asString(r.filename, '—'),
              };
            }),
          );
        })
        .catch(() => setAssets([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [visible, query, selected]);

  const toggle = (path: string) => {
    if (!multiple) {
      onConfirm([path]);
      onClose();
      return;
    }
    setPicked((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]));
  };

  const handleUpload = async () => {
    try {
      const path = await uploadMedia();
      if (multiple) setPicked((prev) => [...prev, path]);
      else {
        onConfirm([path]);
        onClose();
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <Text style={[typography.heading, { color: colors.text }]}>{t('pickFromLibrary')}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
          <ScrollView contentContainerStyle={styles.grid}>
            {assets.map((asset) => {
              const active = picked.includes(asset.path);
              return (
                <Pressable key={asset.id} onPress={() => toggle(asset.path)} style={[styles.cell, active && { borderColor: colors.primary }]}>
                  <RemoteImage path={asset.path} variant="thumb" style={styles.thumb} />
                </Pressable>
              );
            })}
          </ScrollView>
          <PrimaryButton label={t('galleryUploadPhone')} onPress={() => void handleUpload()} />
          {multiple ? <PrimaryButton label={t('save')} onPress={() => { onConfirm(picked); onClose(); }} /> : null}
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
  sheet: { maxHeight: '90%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.md, gap: spacing.sm },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '31%', borderWidth: 2, borderColor: 'transparent', borderRadius: 8, overflow: 'hidden' },
  thumb: { width: '100%', height: 88, borderRadius: 6 },
  close: { textAlign: 'center', paddingVertical: spacing.sm },
});
