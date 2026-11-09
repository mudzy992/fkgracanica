import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaUploadProgress } from './MediaUploadProgress';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, params?: Record<string, unknown>) => {
      if (k === 'admin.mediaUpload.progressLabel') return 'Progress';
      if (k === 'admin.mediaUpload.progress') return `progress:${JSON.stringify(params)}`;
      if (k === 'admin.mediaUpload.refreshing') return 'refreshing';
      if (k === 'admin.mediaUpload.summary') return `summary:${JSON.stringify(params)}`;
      if (k.startsWith('admin.mediaUpload.')) return k;
      return k;
    },
  }),
}));

describe('MediaUploadProgress — branch48 (2 grane total ?? i folderName)', () => {
  const baseProgress = (over: Record<string, unknown> = {}) =>
    ({
      total: 10,
      done: 3,
      failed: 1,
      isRunning: true,
      isRefreshing: false,
      refreshFailed: false,
      failedFiles: [],
      rejectedFiles: [],
      ...over,
    }) as never;

  it('total=0 pokriva bid2 [6,0] percentage fallback 0', () => {
    const progress = baseProgress({ total: 0, done: 0, isRunning: true });
    const { container } = render(<MediaUploadProgress progress={progress} />);
    // hasReport true jer total 0 ali nema rejected/refreshFailed? actually hasReport = total>0 || rejected>0 || refreshFailed -> 0>0 false, rejected 0, refreshFailed false => false => null
    // pa se ne renderuje
    expect(container.firstChild).toBeNull();
    // ali percentage grana je dead u tom slučaju jer early return
    // test sa total>0 i done 0 da pokrije else?
  });

  it('total truthy i fallback folderName vs folderId (bid5 [2,0])', () => {
    const progress = baseProgress({
      total: 5,
      done: 5,
      failed: 2,
      isRunning: false,
      failedFiles: [
        { id: 'f1', name: 'a.jpg', folderName: 'Folder A', folderId: 'id1', reason: 'tooLarge' },
        { id: 'f2', name: 'b.jpg', folderName: null, folderId: 'id2', reason: 'badType' },
        { id: 'f3', name: 'c.jpg', folderName: undefined, folderId: 'id3', reason: 'tooLarge' },
      ],
      rejectedFiles: [],
    });
    render(<MediaUploadProgress progress={progress} onRetryRefresh={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText(/Folder A/)).toBeInTheDocument();
    expect(screen.getByText(/id2/)).toBeInTheDocument();
    expect(screen.getByText(/id3/)).toBeInTheDocument();
  });

  it('percentage izračun i isRefreshing', () => {
    const progress = baseProgress({ total: 10, done: 5, isRunning: true, isRefreshing: true });
    render(<MediaUploadProgress progress={progress} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/refreshing/)).toBeInTheDocument();
  });

  it('rejectedFiles i refreshFailed + clear', () => {
    const progress = baseProgress({
      total: 0,
      done: 0,
      isRunning: false,
      refreshFailed: true,
      rejectedFiles: [{ id: 'r1', name: 'x.png', reason: 'badType' }],
    } as never);
    const onRetry = vi.fn();
    const onClear = vi.fn();
    render(<MediaUploadProgress progress={progress} onRetryRefresh={onRetry} onClear={onClear} />);
    expect(screen.getByText('admin.mediaUpload.rejected')).toBeInTheDocument();
    expect(screen.getByText('admin.mediaUpload.refreshFailed')).toBeInTheDocument();
    screen.getByText('admin.mediaUpload.retryRefresh').click();
    expect(onRetry).toHaveBeenCalled();
    screen.getByText('admin.mediaUpload.clearReport').click();
    expect(onClear).toHaveBeenCalled();
  });

  it('bez hasReport return null (total 0 i prazno)', () => {
    const progress = baseProgress({ total: 0, rejectedFiles: [], refreshFailed: false }) as never;
    const { container } = render(<MediaUploadProgress progress={progress} />);
    expect(container.firstChild).toBeNull();
  });

  it('isRunning false sa total>0 prikazuje summary', () => {
    const progress = baseProgress({ total: 4, done: 4, isRunning: false });
    render(<MediaUploadProgress progress={progress} />);
    expect(screen.getByText(/summary/)).toBeInTheDocument();
  });
});
