import { useTranslation } from 'react-i18next';
import type { UploadQueueState } from '../../../hooks/use-media-upload-queue';
import { Button } from '../../../components/ui/button';

interface Props {
  progress: UploadQueueState;
  onRetryRefresh?: () => void;
  onClear?: () => void;
}

export function MediaUploadProgress({ progress, onRetryRefresh, onClear }: Props) {
  const { t } = useTranslation();
  const { total, done, failed, isRunning, isRefreshing, refreshFailed, failedFiles, rejectedFiles } = progress;
  const hasReport = total > 0 || rejectedFiles.length > 0 || refreshFailed;
  if (!hasReport) return null;
  const percentage = total ? Math.round((done / total) * 100) : 0;
  const counts = { done, total, failed, succeeded: done - failed };
  return (
    <div className="space-y-2">
      {isRunning && total > 0 ? (
        <div className="space-y-1">
          <div
            role="progressbar"
            aria-label={t('admin.mediaUpload.progressLabel')}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            className="h-1.5 overflow-hidden rounded-full bg-surface"
          >
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percentage}%` }} />
          </div>
          <p role="status" className="text-xs text-text-muted">
            {t('admin.mediaUpload.progress', counts)} {isRefreshing ? t('admin.mediaUpload.refreshing') : ''}
          </p>
        </div>
      ) : null}
      {!isRunning && total > 0 ? (
        <p role="status" className="text-sm text-text">{t('admin.mediaUpload.summary', counts)}</p>
      ) : null}
      {failedFiles.length > 0 ? (
        <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
          <p>{t('admin.mediaUpload.failed')}</p>
          <ul className="list-inside list-disc">
            {failedFiles.map((file) => <li key={file.id}>{file.name} — {file.folderName ?? file.folderId} — {t(`admin.mediaUpload.${file.reason}`)}</li>)}
          </ul>
        </div>
      ) : null}
      {rejectedFiles.length > 0 ? (
        <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
          <p>{t('admin.mediaUpload.rejected')}</p>
          <ul className="list-inside list-disc">
            {rejectedFiles.map((file) => <li key={file.id}>{file.name} — {t(`admin.mediaUpload.${file.reason}`)}</li>)}
          </ul>
        </div>
      ) : null}
      {refreshFailed && !isRunning ? (
        <div role="alert" className="space-y-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
          <p>{t('admin.mediaUpload.refreshFailed')}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetryRefresh}>
            {t('admin.mediaUpload.retryRefresh')}
          </Button>
        </div>
      ) : null}
      {!isRunning ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>{t('admin.mediaUpload.clearReport')}</Button>
      ) : null}
    </div>
  );
}
