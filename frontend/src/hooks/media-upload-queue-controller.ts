import type { QueryClient } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import { api } from '../lib/api';
import { cancelMediaRefresh, refreshMediaQueries } from './media-upload-refresh';
import { mediaOwnerMatches, MediaSessionChanged } from './media-upload-session';

type ItemStatus = 'pending' | 'uploading' | 'done' | 'error' | 'notSent';
type RejectReason = 'notImage' | 'noFolder' | 'noSession';
interface QueueItem { id: number; name: string; file: File | null; folderId: string; folderName?: string; status: ItemStatus }
export interface RejectedUpload { id: number; name: string; reason: RejectReason }
export interface FailedUpload { id: number; name: string; folderId: string; folderName?: string; reason: 'unconfirmed' | 'sessionChanged' }
export interface UploadQueueState {
  total: number;
  done: number;
  failed: number;
  isRunning: boolean;
  isRefreshing: boolean;
  refreshFailed: boolean;
  failedFiles: FailedUpload[];
  rejectedFiles: RejectedUpload[];
}

const initial: UploadQueueState = {
  total: 0, done: 0, failed: 0, isRunning: false, isRefreshing: false,
  refreshFailed: false, failedFiles: [], rejectedFiles: [],
};

async function uploadOne(file: File, folderId: string, ownerId: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('folderId', folderId);
  // Zajednički interceptor bi ponovio POST na 401; ni taj retry ovdje nije siguran.
  const config: AxiosRequestConfig & { _retry: boolean } = {
    headers: { 'Content-Type': undefined }, _retry: true,
    transformRequest: [(data: FormData) => {
      if (!mediaOwnerMatches(ownerId)) throw new MediaSessionChanged();
      return data;
    }],
  };
  await api.post('/media/upload', form, config);
}

/** Jedan red po QueryClientu: ostaje živ pri SPA navigaciji u istom tabu. */
export class MediaUploadQueueController {
  private items: QueueItem[] = [];
  private rejected: RejectedUpload[] = [];
  private listeners = new Set<() => void>();
  private snapshot = initial;
  private nextId = 0;
  private running = false;
  private refreshing = false;
  private refreshFailed = false;

  private readonly client: QueryClient;
  private readonly ownerId: string;

  constructor(client: QueryClient, ownerId: string) { this.client = client; this.ownerId = ownerId; }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  getSnapshot = () => this.snapshot;

  private publish() {
    const failedFiles: FailedUpload[] = this.items.filter((item) => item.status === 'error' || item.status === 'notSent')
      .map(({ id, name, folderId, folderName, status }) => ({
        id, name, folderId, folderName, reason: status === 'notSent' ? 'sessionChanged' : 'unconfirmed',
      }));
    this.snapshot = {
      total: this.items.length,
      done: this.items.filter((item) => item.status === 'done' || item.status === 'error' || item.status === 'notSent').length,
      failed: failedFiles.length,
      isRunning: this.running,
      isRefreshing: this.refreshing,
      refreshFailed: this.refreshFailed,
      failedFiles,
      rejectedFiles: [...this.rejected],
    };
    this.listeners.forEach((listener) => listener());
  }

  enqueue = (files: FileList | File[], folderId: string, folderName?: string) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;
    let added = false;
    for (const file of incoming) {
      const id = ++this.nextId;
      if (!mediaOwnerMatches(this.ownerId) || !folderId || !file.type.startsWith('image/')) {
        const reason = !mediaOwnerMatches(this.ownerId) ? 'noSession' : !folderId ? 'noFolder' : 'notImage';
        this.rejected.push({ id, name: file.name, reason });
      } else {
        this.items.push({ id, name: file.name, file, folderId, folderName, status: 'pending' });
        added = true;
      }
    }
    if (added && !this.running) this.start();
    else {
      this.publish();
      // Novi prihvaćeni fajl ne treba čekati zapeli završni GET.
      if (added && this.refreshing) void cancelMediaRefresh(this.client).catch(() => undefined);
    }
  };

  retryRefresh = () => {
    if (!this.running && this.refreshFailed && mediaOwnerMatches(this.ownerId)) this.start();
  };

  clearReport = () => {
    if (this.running) return;
    this.items = [];
    this.rejected = [];
    this.refreshFailed = false;
    this.publish();
  };

  private start() {
    this.running = true;
    this.publish();
    void this.process();
  }

  private async process() {
    try {
      while (true) {
        const item = this.items.find((row) => row.status === 'pending');
        if (item) {
          this.refreshing = false;
          item.status = 'uploading';
          this.publish();
          try {
            if (!mediaOwnerMatches(this.ownerId)) throw new MediaSessionChanged();
            if (!item.file) throw new Error('Missing queued file');
            await uploadOne(item.file, item.folderId, this.ownerId);
            item.status = 'done';
          } catch (error) {
            // Ne ponavljati automatski: server je možda već upisao medij.
            item.status = error instanceof MediaSessionChanged ? 'notSent' : 'error';
          } finally {
            item.file = null;
          }
          this.publish();
          continue;
        }
        this.refreshing = true;
        this.publish();
        this.refreshFailed = !mediaOwnerMatches(this.ownerId) || !(await refreshMediaQueries(this.client));
        if (this.items.some((row) => row.status === 'pending')) continue;
        this.running = false;
        this.refreshing = false;
        this.publish();
        return;
      }
    } catch {
      // Nepredviđena greška mora ostaviti vidljiv izvještaj, ne tihi gubitak izbora.
      this.items.forEach((item) => {
        if (item.status === 'pending' || item.status === 'uploading') {
          item.status = 'error';
          item.file = null;
        }
      });
      this.running = false;
      this.refreshing = false;
      this.refreshFailed = true;
      this.publish();
    }
  }
}

const controllers = new WeakMap<QueryClient, Map<string, MediaUploadQueueController>>();
export function mediaUploadQueueFor(client: QueryClient, ownerId: string) {
  let users = controllers.get(client);
  if (!users) { users = new Map(); controllers.set(client, users); }
  let controller = users.get(ownerId);
  if (!controller) {
    controller = new MediaUploadQueueController(client, ownerId);
    users.set(ownerId, controller);
  }
  return controller;
}
