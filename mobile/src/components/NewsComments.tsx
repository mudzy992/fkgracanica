import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { formatDateBs } from '../lib/format-date';
import { useTheme } from '../lib/theme-context';
import { spacing, typography } from '../lib/theme';
import type { NewsComment } from '../types/api';

type Props = {
  newsId: string;
};

export function NewsComments({ newsId }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const { data } = await api.get<NewsComment[]>(`/news/${newsId}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    }
  }, [newsId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handlePost = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await api.post(`/news/${newsId}/comments`, { content: trimmed });
      setContent('');
      Alert.alert(t('commentSent'));
      await loadComments();
    } catch {
      Alert.alert(t('error'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete(`/news/comments/${commentId}`);
      await loadComments();
    } catch {
      Alert.alert(t('error'));
    }
  };

  return (
    <View style={[styles.wrap, { borderTopColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.text }]}>{t('comments')}</Text>
      {comments.map((c) => {
        const name = [c.user?.firstName, c.user?.lastName].filter(Boolean).join(' ') || c.user?.email;
        const isOwn = user?.id === c.userId;
        return (
          <View key={c.id} style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.rowBody}>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {name} · {formatDateBs(c.createdAt)}
              </Text>
              <Text style={[styles.content, { color: colors.text }]}>{c.content}</Text>
            </View>
            {isOwn ? (
              <Pressable
                onPress={() => void handleDelete(c.id)}
                accessibilityRole="button"
                accessibilityLabel={t('deleteComment')}
              >
                <Text style={{ color: colors.accent }}>{t('deleteComment')}</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
      {isAuthenticated ? (
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            value={content}
            onChangeText={setContent}
            placeholder={t('writeComment')}
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Pressable
            style={[styles.postBtn, { backgroundColor: colors.primary }, sending && styles.disabled]}
            onPress={() => void handlePost()}
            disabled={sending}
            accessibilityRole="button"
          >
            <Text style={[styles.postLabel, { color: colors.white }]}>
              {sending ? t('loading') : t('sendComment')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Link href={{ pathname: '/login', params: { returnTo: `/(tabs)/news` } }} asChild>
          <Pressable accessibilityRole="button">
            <Text style={[styles.loginCta, { color: colors.accent }]}>{t('commentLogin')}</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1 },
  heading: { ...typography.heading, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowBody: { flex: 1 },
  meta: { ...typography.caption },
  content: { ...typography.body, marginTop: spacing.xs },
  form: { marginTop: spacing.md, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
    ...typography.body,
  },
  postBtn: { borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  postLabel: { fontWeight: '600' },
  disabled: { opacity: 0.7 },
  loginCta: { ...typography.body, fontWeight: '600', marginTop: spacing.md },
});
