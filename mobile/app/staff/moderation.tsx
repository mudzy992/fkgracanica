import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useAuth } from '../../src/lib/auth';
import { hasPermission } from '../../src/lib/permissions';
import { colors, spacing, typography } from '../../src/lib/theme';

type PendingItem = { id: string; title: string };

export default function ModerationScreen() {
  const { user } = useAuth();
  const [news, setNews] = useState<PendingItem[]>([]);
  const [gallery, setGallery] = useState<PendingItem[]>([]);
  const [live, setLive] = useState<PendingItem[]>([]);

  const load = useCallback(async () => {
    try {
      const [newsRes, galleryRes, liveRes] = await Promise.all([
        api.get('/news', { params: { status: 'PENDING' } }),
        api.get('/gallery', { params: { status: 'PENDING' } }),
        api.get('/live/pending'),
      ]);
      setNews(asArray(newsRes.data).map((item, index) => ({ id: asString(asRecord(item).id, String(index)), title: asString(asRecord(item).title, 'Vijest') })));
      setGallery(asArray(galleryRes.data).map((item, index) => ({ id: asString(asRecord(item).id, String(index)), title: asString(asRecord(item).title, 'Galerija') })));
      setLive(asArray(liveRes.data).map((item, index) => ({ id: asString(asRecord(item).id, String(index)), title: asString(asRecord(item).title, 'Live report') })));
    } catch {
      setNews([]);
      setGallery([]);
      setLive([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (kind: 'news' | 'gallery' | 'live', id: string) => {
    if (kind === 'live') await api.post(`/live/matches/${id}/approve`);
    if (kind === 'news') await api.patch(`/news/${id}/status`, { status: 'PUBLISHED' });
    if (kind === 'gallery') await api.patch(`/gallery/${id}/status`, { status: 'PUBLISHED' });
    await load();
  };

  const Block = ({ title, items, kind }: { title: string; items: PendingItem[]; kind: 'news' | 'gallery' | 'live' }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.name}>{item.title}</Text>
          <Pressable style={styles.button} onPress={() => void approve(kind, item.id)}>
            <Text style={styles.buttonText}>Approve</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );

  const canModerate =
    hasPermission(user, 'news.approve') ||
    hasPermission(user, 'gallery.approve') ||
    hasPermission(user, 'live.approve');

  if (!canModerate) {
    return (
      <RequireAuth returnTo="/staff/moderation">
        <ScreenEmpty message="Nemate moderator pristup." icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnTo="/staff/moderation">
      <Screen scroll>
        <SectionHeader title="Moderator" subtitle="Pending queue za sadržaj i live report." />
        <Block title="Vijesti" items={news} kind="news" />
        <Block title="Galerije" items={gallery} kind="gallery" />
        <Block title="Live reporti" items={live} kind="live" />
      </Screen>
    </RequireAuth>
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
  title: { ...typography.heading, color: colors.text },
  row: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  name: { ...typography.body, color: colors.text },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '600' },
});
