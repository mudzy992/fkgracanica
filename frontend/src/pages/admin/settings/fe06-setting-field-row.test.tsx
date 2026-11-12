import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SettingFieldControl, SettingFieldRow } from './SettingFieldRow';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../components/ui/switch', async () => ({
  Switch: (await import('../../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));
vi.mock('../../../components/admin/SettingMediaField', () => ({
  SettingMediaField: ({ settingKey, value, onChange }: {
    settingKey: string; value: string; onChange: (v: string) => void;
  }) => (
    <button onClick={() => onChange('novi/put.jpg')}>medija:{settingKey}:{value}</button>
  ),
}));

const base = { keyName: 'club.name', value: 'FK', onDraft: () => undefined };

describe('SettingFieldControl', () => {
  it('boolean vrijednost ide u prekidač i mijenja draft', async () => {
    const onDraft = vi.fn();
    render(<SettingFieldControl {...base} keyName="feature.on" value="true" onDraft={onDraft} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(onDraft).toHaveBeenCalledWith('false');
  });

  it('readOnly prekidač je onemogućen', () => {
    render(<SettingFieldControl {...base} keyName="feature.on" value="false" readOnly />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('medijski ključ koristi media polje', async () => {
    const onDraft = vi.fn();
    render(<SettingFieldControl {...base} keyName="club.crestUrl" value="staro.png" onDraft={onDraft} />);
    await userEvent.click(screen.getByRole('button', { name: /medija:club\.crestUrl/ }));
    expect(onDraft).toHaveBeenCalledWith('novi/put.jpg');
  });

  it('tekstualno polje prijavljuje grešku i mijenja draft', async () => {
    const onDraft = vi.fn();
    render(
      <SettingFieldControl {...base} value="5000" draftValue="6000" onDraft={onDraft}
        invalid errorId="err-1" />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('6000');
    expect(input).toBeInvalid();
    expect(input).toHaveAttribute('aria-describedby', 'err-1');
    await userEvent.type(input, '0');
    expect(onDraft).toHaveBeenCalled();
  });
});

describe('SettingFieldRow', () => {
  it('medijski red ima svoj omotač i labelu iz postavki', () => {
    const { container } = render(
      <SettingFieldRow {...base} keyName="club.crestUrl" value="grb.png" />,
    );
    expect(container.firstElementChild?.className).toContain('px-5 py-5');
    expect(screen.getByRole('button', { name: /medija:club\.crestUrl:grb\.png/ })).toBeInTheDocument();
  });

  it('stack raspored slaže labelu iznad kontrole', () => {
    const { container } = render(
      <SettingFieldRow {...base} keyName="club.name" value="FK" layout="stack" />,
    );
    expect(container.firstElementChild?.className).toContain('flex-col');
    expect(screen.getByRole('textbox')).toHaveValue('FK');
  });

  it('row raspored prikazuje labelu lijevo od kontrole', () => {
    const { container } = render(<SettingFieldRow {...base} keyName="club.name" value="FK" />);
    expect(container.firstElementChild?.className).toContain('sm:flex-row');
  });
});
