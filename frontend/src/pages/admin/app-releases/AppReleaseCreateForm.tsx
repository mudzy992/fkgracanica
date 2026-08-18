import { useState } from 'react';
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
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<UploadMeta | null>(null);
  const [version, setVersion] = useState('');
  const [versionCode, setVersionCode] = useState('1');
  const [minCode, setMinCode] = useState('1');
  const [notes, setNotes] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setMeta(await onUpload(file));
  };

  const handleCreate = async () => {
    if (!meta) return;
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
  };

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] p-4">
      <h2 className="text-lg font-semibold">Novi Android release</h2>
      <Input type="file" accept=".apk" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Button type="button" size="sm" disabled={!file || uploading} onClick={() => void handleUpload()}>
        {uploading ? 'Upload…' : 'Upload APK'}
      </Button>
      {meta ? <p className="text-xs text-text-muted">SHA256 {meta.apkSha256.slice(0, 16)}… · {meta.apkSizeBytes} B</p> : null}
      <Input placeholder="Verzija (1.0.1)" value={version} onChange={(e) => setVersion(e.target.value)} />
      <Input placeholder="versionCode" type="number" value={versionCode} onChange={(e) => setVersionCode(e.target.value)} />
      <Input placeholder="minSupportedVersionCode" type="number" value={minCode} onChange={(e) => setMinCode(e.target.value)} />
      <Input placeholder="Napomene" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex items-center gap-2">
        <Switch id="force" checked={forceUpdate} onCheckedChange={setForceUpdate} />
        <label htmlFor="force" className="text-sm">Obavezno ažuriranje</label>
      </div>
      <Button type="button" disabled={!meta || !version || creating} onClick={() => void handleCreate()}>
        {creating ? 'Spremanje…' : 'Kreiraj draft'}
      </Button>
    </div>
  );
}
