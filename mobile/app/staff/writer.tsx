import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RequirePermission } from '../../src/components/RequirePermission';
import { Screen } from '../../src/components/primitives/Screen';
import { SectionHeader } from '../../src/components/primitives/SectionHeader';
import { WriterForm, type NewsCategory } from '../../src/components/writer/WriterForm';
import { WriterList, type WriterNewsItem } from '../../src/components/writer/WriterList';
import { api } from '../../src/lib/api';
import { asArray, asRecord, asString } from '../../src/lib/content-helpers';
import { uploadMedia } from '../../src/lib/upload-media';

type Mode = 'list' | 'form';

function mapNews(raw: unknown): WriterNewsItem {
  const r = asRecord(raw);
  return {
    id: asString(r.id),
    title: asString(r.title, '—'),
    status: asString(r.status, 'DRAFT'),
    excerpt: typeof r.excerpt === 'string' ? r.excerpt : null,
    content: typeof r.content === 'string' ? r.content : '',
    coverPath: typeof r.coverPath === 'string' ? r.coverPath : null,
    categoryId: typeof r.categoryId === 'string' ? r.categoryId : null,
  };
}

export default function WriterScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('list');
  const [items, setItems] = useState<WriterNewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [drafts, pending, cats] = await Promise.all([
        api.get('/news', { params: { status: 'DRAFT' } }),
        api.get('/news', { params: { status: 'PENDING' } }),
        api.get('/news-categories'),
      ]);
      setItems([...asArray(drafts.data).map(mapNews), ...asArray(pending.data).map(mapNews)]);
      setCategories(
        asArray(cats.data).map((c) => {
          const r = asRecord(c);
          return { id: asString(r.id), name: asString(r.name, '—') };
        }),
      );
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategoryId(null);
    setCoverPath(null);
  };

  const openCreate = () => {
    resetForm();
    setMode('form');
  };

  const openEdit = (item: WriterNewsItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setExcerpt(item.excerpt ?? '');
    setContent(item.content ?? '');
    setCategoryId(item.categoryId ?? null);
    setCoverPath(item.coverPath ?? null);
    setMode('form');
  };

  const payload = () => ({
    title: title.trim(),
    excerpt: excerpt.trim() || undefined,
    content: content.trim(),
    categoryId: categoryId || undefined,
    coverPath: coverPath || undefined,
  });

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t('writer'), t('validationRequired'));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/news/${editingId}`, payload());
      } else {
        const { data } = await api.post('/news', payload());
        const created = mapNews(data);
        setEditingId(created.id);
      }
      await load();
      Alert.alert(t('writer'), t('writerSaved'));
    } catch {
      Alert.alert(t('writer'), t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await api.patch(`/news/${editingId}`, payload());
      await api.patch(`/news/${editingId}/submit`);
      resetForm();
      setMode('list');
      await load();
      Alert.alert(t('writer'), t('writerSubmitted'));
    } catch {
      Alert.alert(t('writer'), t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handlePickCover = async () => {
    try {
      const path = await uploadMedia();
      setCoverPath(path);
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return;
      Alert.alert(t('writer'), t('error'));
    }
  };

  return (
    <RequirePermission permission="news.submit" returnTo="/staff/writer">
      <Screen scroll>
        <SectionHeader title={t('writer')} subtitle={t('writerHint')} />
        {mode === 'list' ? (
          <WriterList items={items} onSelect={openEdit} onCreate={openCreate} />
        ) : (
          <WriterForm
            title={title}
            excerpt={excerpt}
            content={content}
            categoryId={categoryId}
            coverPath={coverPath}
            categories={categories}
            saving={saving}
            isEdit={Boolean(editingId)}
            onChangeTitle={setTitle}
            onChangeExcerpt={setExcerpt}
            onChangeContent={setContent}
            onChangeCategory={setCategoryId}
            onPickCover={() => void handlePickCover()}
            onSave={() => void handleSave()}
            onSubmit={() => void handleSubmit()}
            onCancel={() => {
              resetForm();
              setMode('list');
            }}
          />
        )}
      </Screen>
    </RequirePermission>
  );
}
