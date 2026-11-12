import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroSectionForm } from './HeroSectionForm';
import { useState } from 'react';

const state = vi.hoisted(() => ({ changes: [] as Record<string, unknown>[] }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value }: { value: string }) => <div data-testid="media">{value}</div>,
}));

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

/** Batch 35 — pokriva 4 grane: foundedYear, subtitle, backgroundImage, variant fallback */
describe('HeroSectionForm — grane (batch 35)', () => {
  it('sa popunjenim foundedYear prikazuje vrijednost', () => {
    render(<Harness initial={{ foundedYear: '1923' }} />);
    expect(screen.getByPlaceholderText('admin.cmsWidget.foundedYear')).toHaveProperty('value', '1923');
  });

  it('sa subtitle prikazuje vrijednost', () => {
    render(<Harness initial={{ subtitle: 'Podnaslov' }} />);
    expect(screen.getByPlaceholderText('admin.cmsWidget.subtitle')).toHaveProperty('value', 'Podnaslov');
  });

  it('sa backgroundImage prikazuje vrijednost u MediaPickeru', () => {
    render(<Harness initial={{ backgroundImage: 'hero.jpg' }} />);
    expect(screen.getByTestId('media').textContent).toBe('hero.jpg');
  });

  it('dugme bez varijante koristi primary kao fallback', () => {
    render(<Harness initial={{ buttons: [{ label: 'Test', url: '/' }] } as never} />);
    const selects = screen.getAllByRole('combobox');
    // last combobox is variant select inside buttons
    const sel = selects[selects.length - 1] as HTMLSelectElement;
    expect(sel.value).toBe('primary');
  });
});

/** Batch 38 — pokriva 4 grane: buttons ?? [], label ?? '', url ?? '', backgroundDisplay ?? 'all' fallback */
describe('HeroSectionForm — fallback grane (batch 38)', () => {
  it('bez foundedYear/subtitle/backgroundImage prikazuje prazno', () => {
    render(<Harness initial={{ title: 'Naslov' }} />);
    expect(screen.getByPlaceholderText('admin.cmsWidget.foundedYear')).toHaveProperty('value', '');
    expect(screen.getByPlaceholderText('admin.cmsWidget.subtitle')).toHaveProperty('value', '');
    expect(screen.getByTestId('media').textContent).toBe('');
  });

  it('prazna lista dugmadi nema combobox za varijantu', () => {
    render(<Harness initial={{}} />);
    // samo backgroundDisplay combobox
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(selects).toHaveLength(1);
    expect(selects[0].value).toBe('all');
  });

  it('dugme sa praznim label/url koristi prazan string fallback', () => {
    render(<Harness initial={{ buttons: [{} as never] }} />);
    const inputs = screen.getAllByPlaceholderText('admin.cmsWidget.buttonLabel');
    expect(inputs[0]).toHaveProperty('value', '');
    const urlInputs = screen.getAllByPlaceholderText('admin.cmsWidget.buttonUrl');
    expect(urlInputs[0]).toHaveProperty('value', '');
  });

  it('backgroundDisplay fallback je all kad nije postavljen', () => {
    render(<Harness initial={{ backgroundDisplay: undefined } as never} />);
    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    expect(selects[0].value).toBe('all');
  });
});
