import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericSectionForm } from './GenericSectionForm';

const state = vi.hoisted(() => ({
  entity: [] as Record<string, unknown>[],
  changes: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/EntitySelect', () => ({
  EntitySelect: (props: Record<string, unknown>) => {
    state.entity.push(props);
    return (
      <button type="button" onClick={() => (props.onChange as (v: string) => void)('gal-1')}>
        entity-select
      </button>
    );
  },
}));

const last = () => state.changes[state.changes.length - 1];

function Harness({ widgetType, initial }: { widgetType: string; initial: Record<string, unknown> }) {
  const [config, setConfig] = useState(initial);
  return (
    <GenericSectionForm
      widgetType={widgetType}
      config={config}
      onChange={(next) => {
        state.changes.push(next);
        setConfig(next);
      }}
    />
  );
}

const renderForm = (widgetType: string, initial: Record<string, unknown> = {}) =>
  render(<Harness widgetType={widgetType} initial={initial} />);

describe('GenericSectionForm', () => {
  beforeEach(() => {
    state.entity = [];
    state.changes = [];
  });

  it('uvijek prikazuje naslov sekcije', () => {
    renderForm('sponsors', { title: 'Sponzori' });
    expect(screen.getByDisplayValue('Sponzori')).toBeTruthy();
  });

  it('limit prikazuju samo widgeti koji ga podržavaju', () => {
    renderForm('sponsors');
    expect(screen.getByPlaceholderText('admin.cmsWidget.limit')).toHaveProperty('value', '3');
    expect(screen.queryByPlaceholderText('admin.cmsWidget.viewAllLink')).toBeTruthy();
  });

  it('news-feed ima limit ali nema link „vidi sve“', () => {
    renderForm('news-feed');
    expect(screen.getByPlaceholderText('admin.cmsWidget.limit')).toBeTruthy();
    expect(screen.queryByPlaceholderText('admin.cmsWidget.viewAllLink')).toBeNull();
  });

  it('widget bez limita i bez linka prikazuje samo naslov', () => {
    renderForm('footer-about');
    expect(screen.queryByPlaceholderText('admin.cmsWidget.limit')).toBeNull();
    expect(screen.queryByPlaceholderText('admin.cmsWidget.viewAllLink')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('galerija ima izbor načina rada', async () => {
    renderForm('gallery');
    const select = screen.getByRole('combobox');
    expect(select).toHaveProperty('value', 'latest');
    await userEvent.selectOptions(select, 'single');
    expect(last()).toMatchObject({ mode: 'single' });
  });

  it('način „single“ prikazuje birač galerije i prima odabir', async () => {
    renderForm('gallery', { mode: 'single' });
    expect(state.entity[0]).toMatchObject({ endpoint: '/gallery', labelKey: 'title', valueKey: 'id' });
    await userEvent.click(screen.getByRole('button', { name: 'entity-select' }));
    expect(last()).toMatchObject({ galleryId: 'gal-1' });
  });

  it('birač galerije ignoriše niz vrijednosti', async () => {
    renderForm('gallery', { mode: 'single' });
    (state.entity[0].onChange as (v: string | string[]) => void)(['a', 'b']);
    expect(last()).toMatchObject({ galleryId: '' });
  });

  it('Cta widget prikazuje tekst i oba dugmeta', async () => {
    renderForm('club-cta');
    expect(screen.getByPlaceholderText('admin.cmsWidget.description')).toBeTruthy();
    expect(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel')).toBeTruthy();
    expect(screen.getByPlaceholderText('admin.cmsWidget.buttonUrlFull')).toBeTruthy();
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.description'), 'Opis');
    expect(last()).toMatchObject({ text: 'Opis' });
  });

  it('newsletter tekst upisuje i u text i u description', async () => {
    renderForm('newsletter');
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.description'), 'Prijava');
    expect(last()).toMatchObject({ text: 'Prijava', description: 'Prijava' });
  });

  it('promjena limita pretvara unos u broj', async () => {
    renderForm('trophies', { limit: 4 });
    const input = screen.getByPlaceholderText('admin.cmsWidget.limit');
    await userEvent.clear(input);
    await userEvent.type(input, '8');
    expect(last()).toMatchObject({ limit: 8 });
  });

  it('link „vidi sve“ mijenja viewAllUrl', async () => {
    renderForm('featured-players');
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.viewAllLink'), 'https://x.ba');
    expect(last()).toMatchObject({ viewAllUrl: 'https://x.ba' });
  });
});
