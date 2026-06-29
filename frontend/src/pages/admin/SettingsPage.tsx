import { useState } from 'react';
import {
  usePrivateSettings,
  usePublicSettings,
  useUpdatePrivateSettings,
  useUpdatePublicSettings,
} from '../../hooks';
import { SettingMediaField } from '../../components/admin/SettingMediaField';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';
import { isMediaSettingKey, isTicketingManagedSetting, settingInputPlaceholder } from '../../lib/setting-field-utils';
import { settingLabel, settingDescription } from '../../lib/settings-labels';

function SettingField({
  keyName,
  value,
  draftValue,
  onDraft,
}: {
  keyName: string;
  value: string;
  draftValue?: string;
  onDraft: (v: string) => void;
}) {
  const current = draftValue ?? value;

  if (value === 'true' || value === 'false') {
    return (
      <Switch checked={current === 'true'} onCheckedChange={(checked) => onDraft(String(checked))} />
    );
  }

  if (isMediaSettingKey(keyName)) {
    return <SettingMediaField settingKey={keyName} value={current} onChange={onDraft} />;
  }

  return (
    <Input
      value={current}
      placeholder={settingInputPlaceholder(keyName)}
      onChange={(e) => onDraft(e.target.value)}
    />
  );
}

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
    if (tab === 'private' && !window.confirm('Spremiti privatne postavke?')) return;
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
          {Object.entries(values ?? {})
            .filter(([key]) => !isTicketingManagedSetting(key))
            .map(([key, value]) => (
            <div key={key} className="flex flex-col gap-2">
              {!isMediaSettingKey(key) && (
                <div>
                  <label className="text-sm font-medium text-text">{settingLabel(key)}</label>
                  {settingDescription(key) && (
                    <p className="mt-0.5 text-xs text-text-muted">{settingDescription(key)}</p>
                  )}
                </div>
              )}
              <SettingField
                keyName={key}
                value={value}
                draftValue={draft[key]}
                onDraft={(v) => setDraft((d) => ({ ...d, [key]: v }))}
              />
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
