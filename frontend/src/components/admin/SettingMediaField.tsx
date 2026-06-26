import { MediaPicker } from './MediaPicker';
import { settingLabel } from '../../lib/settings-labels';

interface Props {
  settingKey: string;
  value: string;
  onChange: (value: string) => void;
}

export function SettingMediaField({ settingKey, value, onChange }: Props) {
  return (
    <MediaPicker
      label={settingLabel(settingKey)}
      value={value || null}
      onChange={onChange}
    />
  );
}
