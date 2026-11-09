import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaUploadProgress } from './MediaUploadProgress';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, p?: Record<string, unknown>) => {
      if (k === 'admin.mediaUpload.progressLabel') return 'Progress';
      if (k === 'admin.mediaUpload.progress') return `progress:${JSON.stringify(p)}`;
      if (k === 'admin.mediaUpload.refreshing') return 'refreshing';
      if (k === 'admin.mediaUpload.summary') return `summary:${JSON.stringify(p)}`;
      if (k.startsWith('admin.mediaUpload.')) return k;
      return k;
    },
  }),
}));

describe('MediaUploadProgress — branch49 (preostali total percentage i folderName)', () => {
  it('total 0 ali hasReport true preko refreshFailed pokriva percentage 0 granu', () => {
    const progress = {
      total: 0,
      done: 0,
      failed: 0,
      isRunning: false,
      isRefreshing: false,
      refreshFailed: true,
      failedFiles: [],
      rejectedFiles: [],
    } as never;
    const { container } = render(<MediaUploadProgress progress={progress} onRetryRefresh={vi.fn()} onClear={vi.fn()} />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('admin.mediaUpload.refreshFailed')).toBeInTheDocument();
  });

  it('total 0 ali hasReport true preko rejectedFiles pokriva percentage 0', () => {
    const progress = {
      total: 0,
      done: 0,
      failed: 0,
      isRunning: false,
      isRefreshing: false,
      refreshFailed: false,
      failedFiles: [],
      rejectedFiles: [{ id: 'r1', name: 'a.png', reason: 'badType' }],
    } as never;
    const { container } = render(<MediaUploadProgress progress={progress} onRetryRefresh={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('admin.mediaUpload.rejected')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Progress/);
  });

  it('total truthy percentage izračun 50%', () => {
    const progress = {
      total: 4,
      done: 2,
      failed: 0,
      isRunning: true,
      isRefreshing: false,
      refreshFailed: false,
      failedFiles: [],
      rejectedFiles: [],
    } as never;
    render(<MediaUploadProgress progress={progress} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('failedFiles folderName truthy vs fallback folderId', () => {
    const progress = {
      total: 2,
      done: 2,
      failed: 2,
      isRunning: false,
      isRefreshing: false,
      refreshFailed: false,
      failedFiles: [
        { id: 'f1', name: 'x.jpg', folderName: 'FolderX', folderId: 'id1', reason: 'tooLarge' },
        { id: 'f2', name: 'y.jpg', folderName: null as unknown as string, folderId: 'id2', reason: 'badType' },
        { id: 'f3', name: 'z.jpg', folderName: undefined as unknown as string, folderId: 'id3', reason: 'tooLarge' },
      ],
      rejectedFiles: [],
    } as never;
    render(<MediaUploadProgress progress={progress} onClear={vi.fn()} />);
    expect(screen.getByText(/FolderX/)).toBeInTheDocument();
    expect(screen.getByText(/id2/)).toBeInTheDocument();
    expect(screen.getByText(/id3/)).toBeInTheDocument();
  });
});
