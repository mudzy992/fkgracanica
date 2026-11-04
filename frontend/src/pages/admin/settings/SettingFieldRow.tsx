import { Switch } from '../../../components/ui/switch';
import { Input } from '../../../components/ui/input';
import { SettingMediaField } from '../../../components/admin/SettingMediaField';
import { isMediaSettingKey, settingInputPlaceholder } from '../../../lib/setting-field-utils';
import { settingDescription, settingLabel } from '../../../lib/settings-labels';

interface Props {
  keyName: string;
  value: string;
  draftValue?: string;
  readOnly?: boolean;
  invalid?: boolean;
  errorId?: string;
  onDraft: (v: string) => void;
}

export function SettingFieldControl({ keyName, value, draftValue, readOnly, onDraft, invalid, errorId }: Props) {
  const current = draftValue ?? value;

  if (value === 'true' || value === 'false') {
    return (
      <Switch
        checked={current === 'true'}
        disabled={readOnly}
        onCheckedChange={(checked) => onDraft(String(checked))}
      />
    );
  }

  if (isMediaSettingKey(keyName)) {
    return (
      <SettingMediaField settingKey={keyName} value={current} onChange={onDraft} readOnly={readOnly} />
    );
  }

  return (
    <Input
      aria-label={settingLabel(keyName)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId : undefined}
      value={current}
      disabled={readOnly}
      placeholder={settingInputPlaceholder(keyName)}
      onChange={(e) => onDraft(e.target.value)}
    />
  );
}

interface RowProps extends Props {
  layout?: 'row' | 'stack';
}

export function SettingFieldRow({ keyName, layout = 'row', ...props }: RowProps) {
  if (isMediaSettingKey(keyName)) {
    return (
      <div className="px-5 py-5">
        <SettingFieldControl keyName={keyName} {...props} />
      </div>
    );
  }

  const label = settingLabel(keyName);
  const desc = settingDescription(keyName);

  if (layout === 'stack') {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-sm font-medium text-text">{label}</label>
          {desc && <p className="mt-0.5 text-xs text-text-muted">{desc}</p>}
        </div>
        <SettingFieldControl keyName={keyName} {...props} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-5 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{label}</p>
        {desc && <p className="mt-1 text-xs leading-relaxed text-text-muted">{desc}</p>}
      </div>
      <div className="w-full shrink-0 sm:max-w-sm">
        <SettingFieldControl keyName={keyName} {...props} />
      </div>
    </div>
  );
}
