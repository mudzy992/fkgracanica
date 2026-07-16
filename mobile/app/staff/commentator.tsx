import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { RequirePermission } from '../../src/components/RequirePermission';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { colors, spacing, typography } from '../../src/lib/theme';

type MatchRow = { id: string; title: string };

export default function CommentatorScreen() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches');
      const items = asArray(data).slice(0, 10).map((match, index) => {
        const item = asRecord(match);
        return {
          id: asString(item.id, String(index)),
          title: `${asString(asRecord(item.homeClub).name, 'Domaći')} vs ${asString(asRecord(item.awayClub).name, 'Gosti')}`,
        };
      });
      setMatches(items);
      setSelectedId((current) => current || items[0]?.id || '');
    } catch {
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (path: string, body?: Record<string, unknown>) => {
    if (!selectedId) return;
    await api.post(`/live/matches/${selectedId}/${path}`, body);
  };

  const sendComment = async () => {
    if (!selectedId || !message.trim()) return;
    await api.post(`/live/matches/${selectedId}/comments`, { message: message.trim() });
    setMessage('');
    Alert.alert('Komentator', 'Komentar je poslan.');
  };

  return (
    <RequirePermission permission="live.manage" returnTo="/staff/commentator">
      <Screen scroll>
        <SectionHeader title="Komentator" subtitle="Live desk kontrole i komentari." />
        <View style={styles.card}>
          {matches.map((match) => (
            <Pressable
              key={match.id}
              style={[styles.chip, selectedId === match.id && styles.chipActive]}
              onPress={() => setSelectedId(match.id)}
            >
              <Text style={[styles.chipText, selectedId === match.id && styles.chipTextActive]}>{match.title}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Brze akcije</Text>
          <View style={styles.actions}>
            {[
              ['start', 'Start'],
              ['halftime', 'HT'],
              ['resume', 'Resume'],
              ['end', 'End'],
            ].map(([path, label]) => (
              <Pressable key={path} style={styles.actionBtn} onPress={() => void act(path)}>
                <Text style={styles.actionText}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[styles.input, styles.message]}
            value={message}
            onChangeText={setMessage}
            placeholder="Dodaj live komentar"
            multiline
          />
          <Pressable style={styles.submit} onPress={() => void sendComment()}>
            <Text style={styles.submitText}>Pošalji komentar</Text>
          </Pressable>
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
  chip: { padding: spacing.sm, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: colors.white },
  label: { ...typography.heading, color: colors.text },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionBtn: { backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  actionText: { color: colors.text, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
  },
  message: { minHeight: 120, textAlignVertical: 'top' },
  submit: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  submitText: { color: colors.white, fontWeight: '600' },
});
