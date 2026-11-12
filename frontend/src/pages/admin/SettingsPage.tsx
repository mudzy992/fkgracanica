import { useEffect, useId, useMemo, useState } from 'react';
import {
  usePrivateSettings,
  usePublicSettings,
  useUpdatePrivateSettings,
  useUpdatePublicSettings,
} from '../../hooks';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { getApiErrorMessage } from '../../lib/api-error';
import { isInvalidChangedYouTubeUrl } from '../../lib/youtube';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { getSettingsTabs } from '../../lib/settings-sections';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminPageShell } from '../../components/admin/AdminPageShell';
import { SettingsModuleSection } from './settings/SettingsModuleSection';
import { hasSettingsFieldGroup, SettingsFieldGroupPanel } from './settings/SettingsFieldGroupPanel';
import { useTranslation } from 'react-i18next';

type Scope = 'public' | 'private';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'public', label: 'Javne' },
  { key: 'private', label: 'Privatne' },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canUpdate = hasPermission(user?.permissions, 'settings.update');
  const [scope, setScope] = useState<Scope>('public');
  const [groupTab, setGroupTab] = useState('modules');
  const { data: publicData, isLoading: pl } = usePublicSettings();
  const { data: privateData, isLoading: prl } = usePrivateSettings();
  const updatePublic = useUpdatePublicSettings();
  const updatePrivate = useUpdatePrivateSettings();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [audioError, setAudioError] = useState('');
  const audioErrorId = useId();

  const isLoading = scope === 'public' ? pl : prl;
  const values = (scope === 'public' ? publicData : privateData) ?? {};
  const allValues = { ...publicData, ...privateData, ...draft };
  const saveError = scope === 'public' ? updatePublic.error : updatePrivate.error;

  const tabs = useMemo(
    () =>
      getSettingsTabs(
        scope,
        (group) => hasSettingsFieldGroup(group, values),
        isModuleEnabled(allValues, 'feature.live'),
      ),
    [scope, values, allValues],
  );

  const activeTab = tabs.find((t) => t.id === groupTab) ?? tabs[0];

  useEffect(() => {
    if (!tabs.some((t) => t.id === groupTab)) {
      setGroupTab(tabs[0]?.id ?? 'modules');
    }
  }, [tabs, groupTab]);

  const setDraftKey = (key: string, value: string) => {
    if (!canUpdate) return;
    if (key === 'live.prematchAudioUrl') setAudioError('');
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleSave = async () => {
    if (scope === 'private' && !window.confirm('Spremiti privatne postavke?')) return;
    if (scope === 'public' && isInvalidChangedYouTubeUrl(draft['live.prematchAudioUrl'], publicData?.['live.prematchAudioUrl'])) {
      setAudioError(t('video.invalidInput'));
      setGroupTab('live');
      return;
    }
    setAudioError('');
    try {
      if (scope === 'public') await updatePublic.mutateAsync(draft);
      else await updatePrivate.mutateAsync(draft);
      setDraft({});
    } catch {
      /* mutation error */
    }
  };

  const switchScope = (next: Scope) => {
    setScope(next);
    setDraft({});
    setAudioError('');
    setGroupTab('modules');
  };

  return (
    <>
      <Seo title={t('admin.settings')} />
      <AdminPageShell
        title={t('admin.settings')}
        isLoading={isLoading}
        actions={
          <div className="flex flex-wrap gap-2">
            {SCOPES.map((s) => (
              <Button
                key={s.key}
                size="sm"
                variant={scope === s.key ? 'default' : 'outline'}
                onClick={() => switchScope(s.key)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        }
      >
        <div className="border-b border-[var(--border-subtle)] bg-surface/40 px-3 py-2 sm:px-4">
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab?.id === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGroupTab(tab.id)}
                className="shrink-0"
              >
                {tab.title}
              </Button>
            ))}
          </div>
        </div>

        {activeTab?.description && activeTab.kind === 'modules' && (
          <p className="border-b border-[var(--border-subtle)] px-5 py-3 text-xs leading-relaxed text-text-muted">
            {activeTab.description}. Modul koji ovisi o drugom ne može biti uključen bez roditelja,
            niti roditelj isključen dok je ovisni modul aktivan.
          </p>
        )}

        {activeTab?.kind === 'modules' && (
          <SettingsModuleSection
            scope={scope}
            values={values}
            draft={draft}
            readOnly={!canUpdate}
            onDraft={setDraftKey}
          />
        )}

        {activeTab?.kind === 'fields' && activeTab.group && (
          <SettingsFieldGroupPanel
            group={activeTab.group}
            values={values}
            draft={draft}
            readOnly={!canUpdate}
            invalidKey={audioError ? 'live.prematchAudioUrl' : undefined}
            errorId={audioErrorId}
            onDraft={setDraftKey}
          />
        )}

        {(saveError || (canUpdate && Object.keys(draft).length > 0)) && (
          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[var(--border-subtle)] bg-background/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            {audioError && <p id={audioErrorId} role="alert" className="text-sm text-danger">{audioError}</p>}
            {saveError && (
              <p role="alert" className="text-sm text-danger">
                {getApiErrorMessage(saveError, 'Spremanje postavki nije uspjelo.')}
              </p>
            )}
            {canUpdate && Object.keys(draft).length > 0 && (
              <Button
                className="sm:ml-auto"
                onClick={() => void handleSave()}
                disabled={updatePublic.isPending || updatePrivate.isPending}
              >
                Sačuvaj promjene
              </Button>
            )}
          </div>
        )}
      </AdminPageShell>
    </>
  );
}
