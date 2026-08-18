import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  decideUpdate,
  downloadAndInstallApk,
  fetchLatestAndroidRelease,
  getLocalVersionCode,
  isAndroid,
  markSoftPromptShownToday,
  wasSoftPromptShownToday,
  type LatestAndroidRelease,
  type UpdatePhase,
} from './apk-update';
import { ApkUpdateModal } from './ApkUpdateModal';

export function ApkUpdateHost() {
  const { t } = useTranslation();
  const [release, setRelease] = useState<LatestAndroidRelease | null>(null);
  const [force, setForce] = useState(false);
  const [phase, setPhase] = useState<UpdatePhase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const startDownload = useCallback(
    async (row: LatestAndroidRelease) => {
      setPhase('download');
      setProgress(0);
      setError(null);
      try {
        await downloadAndInstallApk(row, setProgress, setPhase);
      } catch {
        setError(t('appUpdateDownloadError'));
        setPhase('idle');
      }
    },
    [t],
  );

  useEffect(() => {
    if (!isAndroid() || started.current) return;
    started.current = true;
    void (async () => {
      try {
        const latest = await fetchLatestAndroidRelease();
        if (!latest) return;
        const decision = decideUpdate(getLocalVersionCode(), latest);
        if (decision.kind === 'none') return;
        if (decision.kind === 'soft' && (await wasSoftPromptShownToday())) return;
        setForce(decision.kind === 'force');
        setRelease(decision.release);
      } catch {
        return;
      }
    })();
  }, []);

  if (!release) return null;
  return (
    <ApkUpdateModal
      release={release}
      force={force}
      phase={phase}
      progress={progress}
      error={error}
      onUpdate={() => void startDownload(release)}
      onLater={() => {
        void markSoftPromptShownToday().then(() => setRelease(null));
      }}
    />
  );
}
