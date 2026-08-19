import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/api-error';
import { asArray, asRecord, asString } from '../../lib/content-helpers';
import { mediaUrl } from '../../lib/media';
import { slugify } from '../../lib/slugify';
import { uploadMedia } from '../../lib/upload-media';
import {
  emptyWriterArticle,
  mapWriterArticle,
  writerWritePayload,
  type WriterArticle,
  type WriterCategory,
} from './writer-article';

export function useWriterEditor(id: string | undefined) {
  const { t } = useTranslation();
  const isNew = !id || id === 'new';
  const [article, setArticle] = useState<WriterArticle>(emptyWriterArticle());
  const [categories, setCategories] = useState<WriterCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const slugLocked = useRef(false);

  const patch = useCallback((next: Partial<WriterArticle>) => {
    setArticle((prev) => {
      const merged = { ...prev, ...next };
      if (next.title !== undefined && !slugLocked.current) merged.slug = slugify(next.title);
      if (next.slug !== undefined && next.title === undefined) slugLocked.current = true;
      return merged;
    });
  }, []);

  useEffect(() => {
    void api.get('/news-categories').then(({ data }) => {
      setCategories(asArray(data).map((c) => ({ id: asString(asRecord(c).id), name: asString(asRecord(c).name, '—') })));
    });
    if (isNew) return;
    void api
      .get(`/news/${id}`)
      .then(({ data }) => {
        const mapped = mapWriterArticle(data);
        slugLocked.current = Boolean(mapped.slug);
        setArticle(mapped);
      })
      .catch((err) => Alert.alert(t('writer'), getApiErrorMessage(err, t('error'))));
  }, [id, isNew, t]);

  const save = async (): Promise<string | null> => {
    if (!article.title.trim()) {
      Alert.alert(t('writer'), t('validationRequired'));
      return null;
    }
    setSaving(true);
    try {
      const body = writerWritePayload(article);
      if (isNew) {
        const { data } = await api.post('/news', body);
        const created = mapWriterArticle(data);
        setArticle(created);
        slugLocked.current = true;
        Alert.alert(t('writer'), t('writerSaved'));
        return created.id;
      }
      await api.patch(`/news/${article.id}`, body);
      Alert.alert(t('writer'), t('writerSaved'));
      return article.id;
    } catch (err) {
      Alert.alert(t('writer'), getApiErrorMessage(err, t('error')));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const submit = async (): Promise<boolean> => {
    const savedId = await save();
    if (!savedId) return false;
    setSaving(true);
    try {
      await api.patch(`/news/${savedId}/submit`);
      Alert.alert(t('writer'), t('writerSubmitted'));
      return true;
    } catch (err) {
      Alert.alert(t('writer'), getApiErrorMessage(err, t('error')));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const archive = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        t('writer'),
        t('writerArchiveConfirm'),
        [
          { text: t('close'), style: 'cancel', onPress: () => resolve(false) },
          {
            text: t('writerArchive'),
            style: 'destructive',
            onPress: async () => {
              setSaving(true);
              try {
                await api.patch(`/news/${article.id}/archive`);
                resolve(true);
              } catch (err) {
                Alert.alert(t('writer'), getApiErrorMessage(err, t('error')));
                resolve(false);
              } finally {
                setSaving(false);
              }
            },
          },
        ],
      );
    });
  };

  const pickCoverPaths = (paths: string[]) => patch({ coverPath: paths[0] ?? null });

  const requestBodyImage = async (): Promise<string | null> => {
    try {
      const path = await uploadMedia();
      return mediaUrl(path, 'medium') ?? path;
    } catch (err) {
      if (err instanceof Error && err.message === 'cancelled') return null;
      Alert.alert(t('writer'), t('error'));
      return null;
    }
  };

  return { article, categories, saving, coverOpen, setCoverOpen, patch, save, submit, archive, pickCoverPaths, requestBodyImage, isNew };
}
