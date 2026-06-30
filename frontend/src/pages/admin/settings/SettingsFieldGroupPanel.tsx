import { SETTINGS_FIELD_GROUPS } from '../../../lib/settings-sections';
import { isModuleSettingKey, isTicketingManagedSetting } from '../../../lib/setting-field-utils';
import { SettingFieldRow } from './SettingFieldRow';
import type { SettingsFieldGroup } from '../../../lib/settings-sections';

interface Props {
  group: SettingsFieldGroup;
  values: Record<string, string>;
  draft: Record<string, string>;
  readOnly?: boolean;
  onDraft: (key: string, value: string) => void;
}

export function keysForSettingsGroup(
  group: SettingsFieldGroup,
  values: Record<string, string>,
): string[] {
  return Object.keys(values).filter((key) => {
    if (isModuleSettingKey(key) || isTicketingManagedSetting(key)) return false;
    return group.keyPrefixes.some((p) => key === p || key.startsWith(p));
  });
}

export function SettingsFieldGroupPanel({ group, values, draft, readOnly, onDraft }: Props) {
  const keys = keysForSettingsGroup(group, values);
  if (!keys.length) return null;

  return (
    <div className="divide-y divide-[var(--border-subtle)]">
      {group.description && (
        <p className="px-5 pb-1 pt-4 text-xs text-text-muted">{group.description}</p>
      )}
      {keys.map((key) => (
        <SettingFieldRow
          key={key}
          keyName={key}
          value={values[key] ?? ''}
          draftValue={draft[key]}
          readOnly={readOnly}
          onDraft={(v) => onDraft(key, v)}
        />
      ))}
    </div>
  );
}

export function hasSettingsFieldGroup(
  group: SettingsFieldGroup,
  values: Record<string, string>,
): boolean {
  return keysForSettingsGroup(group, values).length > 0;
}

export const ALL_SETTINGS_FIELD_GROUPS = SETTINGS_FIELD_GROUPS;
