import { useState } from 'react';
import {
  usePrivateSettings,
  usePublicSettings,
  useUpdatePrivateSettings,
  useUpdatePublicSettings,
} from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';

export function SettingsPage() {
  const [tab, setTab] = useState<'public' | 'private'>('public');
  const { data: publicData, isLoading: pl } = usePublicSettings();
  const { data: privateData, isLoading: prl } = usePrivateSettings();
  const updatePublic = useUpdatePublicSettings();
  const updatePrivate = useUpdatePrivateSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const data = tab === 'public' ? publicData : privateData;
  const isLoading = tab === 'public' ? pl : prl;

  const values = { ...data, ...draft };

  const handleSave = async () => {
    if (tab === 'public') await updatePublic.mutateAsync(draft);
    else await updatePrivate.mutateAsync(draft);
    setDraft({});
  };

  return (
    <div>
      <Seo title="Postavke" />
      <h1 className="mb-6 text-2xl font-bold">Postavke</h1>
      <div className="mb-6 flex gap-2">
        {(['public', 'private'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setDraft({});
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium',
              tab === t ? 'bg-primary text-white' : 'bg-surface text-text',
            )}
          >
            {t === 'public' ? 'Javne' : 'Privatne'}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="max-w-xl space-y-4">
          {Object.entries(values ?? {}).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text">{key}</label>
              {value === 'true' || value === 'false' ? (
                <Switch
                  checked={(draft[key] ?? value) === 'true'}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({ ...d, [key]: String(checked) }))
                  }
                />
              ) : (
                <Input
                  value={draft[key] ?? value}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          {Object.keys(draft).length > 0 && (
            <Button onClick={() => void handleSave()} disabled={updatePublic.isPending || updatePrivate.isPending}>
              Sačuvaj
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
