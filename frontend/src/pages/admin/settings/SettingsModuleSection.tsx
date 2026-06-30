import { Switch } from '../../../components/ui/switch';
import { APP_MODULE_DEFINITIONS } from '../../../lib/module-definitions';
import { getModuleToggleBlockReason } from '../../../lib/module-settings-rules';

interface Props {
  scope: 'public' | 'private';
  values: Record<string, string>;
  draft: Record<string, string>;
  readOnly?: boolean;
  onDraft: (key: string, value: string) => void;
}

export function SettingsModuleSection({ scope, values, draft, readOnly, onDraft }: Props) {
  const modules = APP_MODULE_DEFINITIONS.filter((m) => m.scope === scope);
  const merged = { ...values, ...draft };

  return (
    <ul className="divide-y divide-[var(--border-subtle)]">
      {modules.map((mod) => {
        const current = draft[mod.key] ?? values[mod.key] ?? 'true';
        const enabled = current !== 'false';
        const blockOff = getModuleToggleBlockReason(mod.key, false, merged);
        const blockOn = getModuleToggleBlockReason(mod.key, true, merged);
        const disabled = readOnly || (enabled ? !!blockOff : !!blockOn);
        const hint = enabled ? blockOff : blockOn;

        return (
          <li
            key={mod.key}
            className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">{mod.label}</p>
              {mod.description && (
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{mod.description}</p>
              )}
              {hint && <p className="mt-2 text-xs text-amber-700">{hint}</p>}
            </div>
            <Switch
              checked={enabled}
              disabled={disabled}
              onCheckedChange={(checked) => onDraft(mod.key, String(checked))}
            />
          </li>
        );
      })}
    </ul>
  );
}
