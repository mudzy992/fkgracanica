import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequireAuth } from '../../src/components/RequireAuth';
import { ScreenEmpty } from '../../src/components/ScreenEmpty';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { CountStrip } from '../../src/components/staff/CountStrip';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { useAuth } from '../../src/lib/auth';
import { hasPermission } from '../../src/lib/permissions';
import { useTheme } from '../../src/lib/theme-context';
import { spacing, typography } from '../../src/lib/theme';

type PendingItem = { id: string; title: string };
type Kind = 'news' | 'gallery' | 'live';

function pendingTitle(raw: unknown, fallback: string): string {
  const item = asRecord(raw);
  const titled = asString(item.title);
  if (titled) return titled;
  const home = asString(asRecord(item.homeClub).name);
  const away = asString(asRecord(item.awayClub).name);
  return home || away ? `${home} ${String(item.homeScore ?? 0)}:${String(item.awayScore ?? 0)} ${away}` : fallback;
}

export default function ModerationScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
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
      setNews(asArray(newsRes.data).map((item, i) => ({ id: asString(asRecord(item).id, String(i)), title: pendingTitle(item, t('news')) })));
      setGallery(asArray(galleryRes.data).map((item, i) => ({ id: asString(asRecord(item).id, String(i)), title: pendingTitle(item, t('gallery')) })));
      setLive(asArray(liveRes.data).map((item, i) => ({ id: asString(asRecord(item).id, String(i)), title: pendingTitle(item, t('live')) })));
    } catch {
      setNews([]);
      setGallery([]);
      setLive([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (kind: Kind, id: string, status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED') => {
    if (kind === 'live') {
      if (status === 'PUBLISHED') await api.post(`/live/matches/${id}/approve`);
      return load();
    }
    const path = kind === 'news' ? `/news/${id}/status` : `/gallery/${id}/status`;
    await api.patch(path, { status });
    await load();
  };

  const canModerate =
    hasPermission(user, 'news.approve') ||
    hasPermission(user, 'gallery.approve') ||
    hasPermission(user, 'live.approve');

  if (!canModerate) {
    return (
      <RequireAuth returnTo="/staff/moderation">
        <ScreenEmpty message={t('noModeratorAccess')} icon="lock-closed-outline" />
      </RequireAuth>
    );
  }

  const Block = ({ title, items, kind }: { title: string; items: PendingItem[]; kind: Kind }) => (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {items.map((item) => (
        <View key={item.id} style={[styles.row, { borderTopColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>{item.title}</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => void setStatus(kind, item.id, 'PUBLISHED')}>
              <Text style={[styles.buttonText, { color: colors.white }]}>{t('approve')}</Text>
            </Pressable>
            {kind !== 'live' && (
              <>
                <Pressable style={[styles.button, { backgroundColor: colors.surface }]} onPress={() => void setStatus(kind, item.id, 'DRAFT')}>
                  <Text style={[styles.buttonText, { color: colors.text }]}>{t('reject')}</Text>
                </Pressable>
                <Pressable style={[styles.button, { backgroundColor: colors.surface }]} onPress={() => void setStatus(kind, item.id, 'ARCHIVED')}>
                  <Text style={[styles.buttonText, { color: colors.text }]}>{t('archive')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <RequireAuth returnTo="/staff/moderation">
      <Screen scroll>
        <SectionHeader title={t('moderator')} subtitle={t('pendingQueue')} />
        <CountStrip
          items={[
            { label: t('newsPending'), value: news.length },
            { label: t('galleryPending'), value: gallery.length },
            { label: t('livePending'), value: live.length },
          ]}
        />
        <Block title={`${t('newsPending')} (${news.length})`} items={news} kind="news" />
        <Block title={`${t('galleryPending')} (${gallery.length})`} items={gallery} kind="gallery" />
        <Block title={`${t('livePending')} (${live.length})`} items={live} kind="live" />
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  title: { ...typography.heading },
  row: { gap: spacing.sm, borderTopWidth: 1, paddingTop: spacing.sm },
  name: { ...typography.body },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: { borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
});
