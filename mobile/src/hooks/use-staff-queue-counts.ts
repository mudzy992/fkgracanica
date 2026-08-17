import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { asArray, asRecord, asString } from '../lib/content-helpers';
import { deskCounts } from '../lib/desk-counts';
import { hasPermission } from '../lib/permissions';
import type { User } from '../types/api';

export type StaffQueueCounts = {
  drafts: number;
  newsPending: number;
  galleryPending: number;
  livePending: number;
  liveNow: number;
  scheduled: number;
  reports: number;
};

const EMPTY: StaffQueueCounts = {
  drafts: 0,
  newsPending: 0,
  galleryPending: 0,
  livePending: 0,
  liveNow: 0,
  scheduled: 0,
  reports: 0,
};

async function listLen(path: string, params?: Record<string, string>): Promise<number> {
  try {
    const { data } = await api.get(path, { params });
    return asArray(data).length;
  } catch {
    return 0;
  }
}

export function useStaffQueueCounts(user: User | null) {
  const [counts, setCounts] = useState<StaffQueueCounts>(EMPTY);

  const load = useCallback(async () => {
    const writer = hasPermission(user, 'news.submit') || hasPermission(user, 'news.manage');
    const moderator =
      hasPermission(user, 'news.approve') ||
      hasPermission(user, 'gallery.approve') ||
      hasPermission(user, 'live.approve');
    const commentator = hasPermission(user, 'live.manage');
    const next = { ...EMPTY };
    const jobs: Promise<void>[] = [];
    if (writer) {
      jobs.push(listLen('/news', { status: 'DRAFT' }).then((n) => { next.drafts = n; }));
      jobs.push(listLen('/news', { status: 'PENDING' }).then((n) => { next.newsPending = n; }));
    }
    if (moderator) {
      if (!writer) jobs.push(listLen('/news', { status: 'PENDING' }).then((n) => { next.newsPending = n; }));
      jobs.push(listLen('/gallery', { status: 'PENDING' }).then((n) => { next.galleryPending = n; }));
      jobs.push(listLen('/live/pending').then((n) => { next.livePending = n; }));
    }
    if (commentator) {
      jobs.push(
        api.get('/matches').then(({ data }) => {
          const mapped = asArray(data).map((raw) => {
            const m = asRecord(raw);
            return { status: asString(m.status), reportStatus: asString(m.reportStatus) };
          });
          const desk = deskCounts(mapped);
          next.liveNow = desk.live;
          next.scheduled = desk.scheduled;
          next.reports = desk.reports;
        }).catch(() => undefined),
      );
    }
    await Promise.all(jobs);
    setCounts({ ...next });
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return counts;
}
