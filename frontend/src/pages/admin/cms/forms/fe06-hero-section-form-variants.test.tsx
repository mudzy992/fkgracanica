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
