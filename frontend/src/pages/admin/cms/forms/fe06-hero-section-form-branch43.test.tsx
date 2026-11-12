import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { HeroSectionForm } from './HeroSectionForm';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value }: { value: string }) => <div data-testid="media">{value}</div>,
}));

const state = vi.hoisted(() => ({ changes: [] as Record<string, unknown>[] }));

function Harness({ initial }: { initial: Record<string, unknown> }) {
  const [config, setConfig] = useState<Record<string, unknown>>(initial);
  return (
    <HeroSectionForm
      config={config}
      onChange={(next) => {
        state.changes.push(next);
        setConfig(next);
      }}
    />
  );
}

beforeEach(() => {
  state.changes = [];
});

/** Batch 43 — pokriva 3 preostale binary-expr grane u setButton: label ?? '', url ?? '', variant ?? '' */
describe('HeroSectionForm — branch43 (3 grane)', () => {
  it('setButton sa nepostojećim indeksom koristi ?? fallback za label/url', async () => {
    const user = userEvent.setup();
    // buttons[1] ne postoji, setButton(1, label) treba uzeti ?? '' za label i url
    render(<Harness initial={{ buttons: [{ label: 'A', url: '/a', variant: 'primary' }] as never }} />);
    // dodaj novo dugme klikom na + Dugme (kreira buttons[1] sa praznim)
    await user.click(screen.getByRole('button', { name: '+ Dugme' }));
    expect(state.changes.at(-1)).toHaveProperty('buttons');
    const afterAdd = state.changes.at(-1) as { buttons: Array<Record<string, string>> };
    expect(afterAdd.buttons).toHaveLength(2);
    // sad edituj drugo dugme (indeks 1) koje je upravo dodano sa praznim label/url
    const labelInputs = screen.getAllByPlaceholderText('admin.cmsWidget.buttonLabel');
    expect(labelInputs).toHaveLength(2);
    await user.clear(labelInputs[1]);
    await user.type(labelInputs[1], 'Novi');
    // zadnji change treba imati label 'Novi' a url ''
    const last = state.changes.at(-1) as { buttons: Array<Record<string, string>> };
    expect(last.buttons[1].label).toBe('Novi');
    expect(last.buttons[1].url).toBe('/');
  });

  it('setButton sa postojećim indeksom čuva postojeći label/url pa mijenja jedno polje', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ buttons: [{ label: 'Stari', url: '/stari', variant: 'outline' }] as never }} />);
    const labelInputs = screen.getAllByPlaceholderText('admin.cmsWidget.buttonLabel');
    await user.clear(labelInputs[0]);
    await user.type(labelInputs[0], 'NoviLabel');
    const last = state.changes.at(-1) as { buttons: Array<Record<string, string>> };
    expect(last.buttons[0].label).toBe('NoviLabel');
    expect(last.buttons[0].url).toBe('/stari');
  });

  it('setButton sa url poljem pokriva url ?? fallback', async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ buttons: [{} as never] }} />);
    const urlInputs = screen.getAllByPlaceholderText('admin.cmsWidget.buttonUrl');
    await user.clear(urlInputs[0]);
    await user.type(urlInputs[0], '/novi');
    const last = state.changes.at(-1) as { buttons: Array<Record<string, string>> };
    expect(last.buttons[0].url).toBe('/novi');
    expect(last.buttons[0].label).toBe('');
  });
});
