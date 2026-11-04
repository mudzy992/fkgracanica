import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../../lib/api-error';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';

type UploadMeta = { apkPath: string; apkSha256: string; apkSizeBytes: number };

type Props = {
  uploading: boolean;
  creating: boolean;
  onUpload: (file: File) => Promise<UploadMeta>;
  onCreate: (body: {
    version: string;
    versionCode: number;
    minSupportedVersionCode: number;
    forceUpdate: boolean;
    apkPath: string;
    apkSha256: string;
    apkSizeBytes: number;
    releaseNotes?: string;
  }) => Promise<void>;
};

export function AppReleaseCreateForm({ uploading, creating, onUpload, onCreate }: Props) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<UploadMeta | null>(null);
  const [version, setVersion] = useState('');
  const [versionCode, setVersionCode] = useState('1');
  const [minCode, setMinCode] = useState('1');
  const [notes, setNotes] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  /** FE-04b/P-FE04-7: upload i kreiranje su prije padali bez ikakve poruke. */
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    try {
      setMeta(await onUpload(file));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload APK-a nije uspio.'));
    }
  };

  const handleCreate = async () => {
    if (!meta) return;
    setError('');
    try {
      await onCreate({
        version,
        versionCode: Number(versionCode),
        minSupportedVersionCode: Number(minCode),
        forceUpdate,
        ...meta,
        releaseNotes: notes || undefined,
      });
      setFile(null);
      setMeta(null);
      setVersion('');
      setNotes('');
      setForceUpdate(false);
    } catch (err) {
      setError(getApiErrorMessage(err, t('admin.releases.createError')));
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] p-4">
      <h2 className="text-lg font-semibold">{t('admin.releases.new')}</h2>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Input type="file" accept=".apk" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Button
        type="button"
        size="sm"
        disabled={!file || uploading}
        onClick={() => void handleUpload()}
      >
        {uploading ? t('admin.releases.uploading') : t('admin.releases.uploadApk')}
      </Button>
      {meta ? (
        <p className="text-xs text-text-muted">
          SHA256 {meta.apkSha256.slice(0, 16)}… · {meta.apkSizeBytes} B
        </p>
      ) : null}
      <Input
        placeholder={t('admin.releases.version')}
        value={version}
        onChange={(e) => setVersion(e.target.value)}
      />
      <Input
        placeholder={t('admin.releases.versionCode')}
        type="number"
        value={versionCode}
        onChange={(e) => setVersionCode(e.target.value)}
      />
      <Input
        placeholder={t('admin.releases.minVersionCode')}
        type="number"
        value={minCode}
        onChange={(e) => setMinCode(e.target.value)}
      />
      <Input
        placeholder={t('admin.releases.notes')}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Switch id="force" checked={forceUpdate} onCheckedChange={setForceUpdate} />
        <label htmlFor="force" className="text-sm">
          {t('admin.releases.forceUpdate')}
        </label>
      </div>
      <Button
        type="button"
        disabled={!meta || !version || creating}
        onClick={() => void handleCreate()}
      >
        {creating ? 'Spremanje…' : 'Kreiraj draft'}
      </Button>
    </div>
  );
}
