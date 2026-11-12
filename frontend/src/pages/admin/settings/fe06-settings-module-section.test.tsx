import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { APP_MODULE_DEFINITIONS } from '../../../lib/module-definitions';
import { SettingsModuleSection } from './SettingsModuleSection';

const publicModules = APP_MODULE_DEFINITIONS.filter((m) => m.scope === 'public');
const privateModules = APP_MODULE_DEFINITIONS.filter((m) => m.scope === 'private');

describe('SettingsModuleSection', () => {
  it('prikazuje samo module traženog scopea sa opisom', () => {
    render(<SettingsModuleSection scope="private" values={{}} draft={{}} onDraft={vi.fn()} />);
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(privateModules.length);
    for (const mod of privateModules) expect(screen.getByText(mod.label)).toBeInTheDocument();
    expect(screen.queryByText(publicModules[0]!.label)).toBeNull();
    expect(screen.getByText('Komentator i live odobrenje')).toBeInTheDocument();
  });

  it('klik na prekidač šalje novu vrijednost u draft', async () => {
    const user = userEvent.setup();
    const onDraft = vi.fn();
    render(<SettingsModuleSection scope="public" values={{}} draft={{}} onDraft={onDraft} />);
    const first = screen.getAllByRole('switch')[0]!;
    expect(first).toHaveAttribute('aria-checked', 'true');
    await user.click(first);
    expect(onDraft).toHaveBeenCalledWith(publicModules[0]!.key, 'false');
  });

  it('draft vrijednost pobjeđuje nad spremljenom i pali prekidač', async () => {
    const user = userEvent.setup();
    const onDraft = vi.fn();
    render(
      <SettingsModuleSection
        scope="public"
        values={{ [publicModules[0]!.key]: 'false' }}
        draft={{ [publicModules[0]!.key]: 'true' }}
        onDraft={onDraft}
      />,
    );
    const first = screen.getAllByRole('switch')[0]!;
    expect(first).toHaveAttribute('aria-checked', 'true');
    await user.click(first);
    expect(onDraft).toHaveBeenCalledWith(publicModules[0]!.key, 'false');
  });

  it('readOnly isključuje sve prekidače', () => {
    render(<SettingsModuleSection scope="public" values={{}} draft={{}} readOnly onDraft={vi.fn()} />);
    for (const sw of screen.getAllByRole('switch')) expect(sw).toBeDisabled();
  });

  it('modul sa aktivnim zavisnim modulom prikazuje razlog blokade', () => {
    render(
      <SettingsModuleSection
        scope="public"
        values={{ 'feature.live': 'true', 'modules.competitions': 'true' }}
        draft={{}}
        onDraft={vi.fn()}
      />,
    );
    expect(screen.getByText(/Isključite prvo „Live centar”/)).toBeInTheDocument();
  });
});
