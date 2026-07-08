import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { MediaAsset } from './use-media-admin';

type ItemStatus = 'pending' | 'uploading' | 'done' | 'error';

interface QueueItem {
  id: string;
  file: File;
  status: ItemStatus;
}

export interface UploadQueueState {
  total: number;
  done: number;
  failed: number;
  isRunning: boolean;
  summary: string | null;
}

function isImage(file: File) {
  return file.type.startsWith('image/');
}

async function uploadOne(file: File, folderId: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('folderId', folderId);
  return (await api.post<MediaAsset>('/media/upload', form, {
    headers: { 'Content-Type': undefined },
  })).data;
}

export function useMediaUploadQueue() {
  const qc = useQueryClient();
  const runningRef = useRef(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  const updateItem = useCallback((id: string, status: ItemStatus) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }, []);

  const processQueue = useCallback(
    async (items: QueueItem[], folderId: string) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setSummary(null);
      let done = 0;
      let failed = 0;

      for (const item of items) {
        updateItem(item.id, 'uploading');
        try {
          await uploadOne(item.file, folderId);
          updateItem(item.id, 'done');
          done += 1;
        } catch {
          updateItem(item.id, 'error');
          failed += 1;
        }
      }

      await qc.invalidateQueries({ queryKey: ['media', 'assets'] });
      await qc.invalidateQueries({ queryKey: ['media', 'folders'] });

      const total = items.length;
      if (failed === 0) {
        setSummary(`${done}/${total} uspješno uploadovano`);
      } else {
        setSummary(`${done}/${total} uspješno, ${failed} neuspješno`);
      }

      setTimeout(() => {
        setQueue([]);
        setSummary(null);
      }, 4000);

      runningRef.current = false;
    },
    [qc, updateItem],
  );

  const enqueue = useCallback(
    (files: FileList | File[], folderId: string) => {
      const list = Array.from(files).filter(isImage);
      if (!list.length) return;

      const items: QueueItem[] = list.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: 'pending' as const,
      }));

      setQueue(items);
      void processQueue(items, folderId);
    },
    [processQueue],
  );

  const done = queue.filter((i) => i.status === 'done' || i.status === 'error').length;
  const failed = queue.filter((i) => i.status === 'error').length;
  const isRunning = queue.some((i) => i.status === 'pending' || i.status === 'uploading');

  const state: UploadQueueState = {
    total: queue.length,
    done,
    failed,
    isRunning,
    summary,
  };

  return { enqueue, state };
}
