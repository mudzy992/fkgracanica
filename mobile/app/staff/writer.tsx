import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../../src/components/primitives/PrimaryButton';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { RequirePermission } from '../../src/components/RequirePermission';
import { api } from '../../src/lib/api';
import { colors, spacing, typography } from '../../src/lib/theme';

export default function WriterScreen() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadPending = useCallback(async () => {
    try {
      const { data } = await api.get<unknown[]>('/news', { params: { status: 'PENDING' } });
      setPendingCount(data.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  const submit = async () => {
    setSaving(true);
    try {
      const created = await api.post('/news', { title, excerpt, content });
      await api.patch(`/news/${created.data.id}/submit`);
      setTitle('');
      setExcerpt('');
      setContent('');
      await loadPending();
      Alert.alert('Writer', 'Vijest je poslana na odobravanje.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequirePermission permission="news.submit" returnTo="/staff/writer">
      <Screen scroll>
        <SectionHeader title="Writer" subtitle={`Pending vijesti: ${pendingCount}`} />
        <View style={styles.card}>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Naslov" />
          <TextInput style={styles.input} value={excerpt} onChangeText={setExcerpt} placeholder="Sažetak" />
          <TextInput
            style={[styles.input, styles.content]}
            value={content}
            onChangeText={setContent}
            placeholder="Sadržaj vijesti"
            multiline
          />
          <PrimaryButton label="Sačuvaj i pošalji na review" onPress={() => void submit()} loading={saving} />
        </View>
      </Screen>
    </RequirePermission>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
  },
  content: { minHeight: 160, textAlignVertical: 'top', ...typography.body },
});
