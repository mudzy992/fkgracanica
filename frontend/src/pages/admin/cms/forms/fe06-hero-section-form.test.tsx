import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroSectionForm } from './HeroSectionForm';

const state = vi.hoisted(() => ({
  media: [] as { value: string; label?: string }[],
  changes: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, label, onChange }: { value: string; label?: string; onChange: (v: string) => void }) => {
    state.media.push({ value, label });
    return (
      <button type="button" onClick={() => onChange('hero-bg.jpg')}>
        pick-media
      </button>
    );
  },
}));

const last = () => state.changes[state.changes.length - 1];

/** Kontrolisana forma: izmjena se vraća kao nova konfiguracija (kao u stvarnoj stranici). */
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

const renderForm = (config: Record<string, unknown> = {}) => render(<Harness initial={config} />);

describe('HeroSectionForm', () => {
  beforeEach(() => {
    state.media = [];
    state.changes = [];
  });

  it('prazna konfiguracija dobija podrazumijevane vrijednosti', () => {
    renderForm();
    expect(screen.getByPlaceholderText('admin.cmsWidget.titleRequired')).toHaveProperty('value', '');
    expect(screen.getByRole('button', { name: 'pick-media' })).toBeTruthy();
    expect(state.media[0]).toMatchObject({ value: '', label: 'admin.cmsWidget.background' });
    expect(screen.getByRole('combobox')).toHaveProperty('value', 'all');
    expect(screen.getAllByRole('checkbox')[0]).toHaveProperty('checked', true);
    expect(screen.getAllByRole('checkbox')[1]).toHaveProperty('checked', true);
    expect(screen.getByText('+ Dugme')).toBeTruthy();
  });

  it('izmjena teksta čuva ostala polja', async () => {
    renderForm({ title: 'Dobrodošli', subtitle: 'U Gračanicu' });
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.titleRequired'), '!');
    expect(last()).toMatchObject({ title: 'Dobrodošli!', subtitle: 'U Gračanicu', showMatches: true });
  });

  it('birač medija mijenja pozadinu', async () => {
    renderForm({ backgroundImage: 'stara.jpg' });
    expect(state.media[0]).toMatchObject({ value: 'stara.jpg' });
    await userEvent.click(screen.getByRole('button', { name: 'pick-media' }));
    expect(last()).toMatchObject({ backgroundImage: 'hero-bg.jpg' });
  });

  it('promjena načina prikaza pozadine', async () => {
    renderForm();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'mobile');
    expect(last()).toMatchObject({ backgroundDisplay: 'mobile' });
  });

  it('isključivanje prikaza utakmica i rezultata', async () => {
    renderForm();
    const [matches, result] = screen.getAllByRole('checkbox');
    await userEvent.click(matches);
    expect(last()).toMatchObject({ showMatches: false });
    await userEvent.click(result);
    expect(last()).toMatchObject({ showLastResult: false });
  });

  it('poništava polja koja su u configu eksplicitno false', () => {
    renderForm({ showMatches: false, showLastResult: false, backgroundDisplay: 'none' });
    expect(screen.getAllByRole('checkbox')[0]).toHaveProperty('checked', false);
    expect(screen.getAllByRole('checkbox')[1]).toHaveProperty('checked', false);
    expect(screen.getByRole('combobox')).toHaveProperty('value', 'none');
  });

  it('dodaje novo dugme sa podrazumijevanim vrijednostima', async () => {
    renderForm({ title: 'Naslov' });
    await userEvent.click(screen.getByRole('button', { name: '+ Dugme' }));
    expect(last()).toMatchObject({
      title: 'Naslov',
      buttons: [{ label: '', url: '/', variant: 'primary' }],
    });
  });

  it('postojeća dugmad prikazuje i dozvoljava izmjenu svih polja', async () => {
    renderForm({ buttons: [{ label: 'Ulaznice', url: '/ulaznice', variant: 'primary' }] });
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.buttonLabel'), '!');
    expect(last()).toMatchObject({ buttons: [{ label: 'Ulaznice!', url: '/ulaznice', variant: 'primary' }] });
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.buttonUrl'), '/kupi');
    expect(last()).toMatchObject({ buttons: [{ label: 'Ulaznice!', url: '/ulaznice/kupi', variant: 'primary' }] });
  });

  it('mijenja varijantu dugmeta', async () => {
    renderForm({ buttons: [{ label: 'A', url: '/', variant: 'primary' }, { label: 'B', url: '/b', variant: 'primary' }] });
    // combobox 0 = način prikaza pozadine, 1 = varijanta prvog, 2 = varijanta drugog dugmeta
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[2], 'outline');
    expect(last()).toMatchObject({
      buttons: [{ label: 'A', url: '/', variant: 'primary' }, { label: 'B', url: '/b', variant: 'outline' }],
    });
  });

  it('briše pojedinačno dugme', async () => {
    renderForm({
      buttons: [
        { label: 'A', url: '/a', variant: 'primary' },
        { label: 'B', url: '/b', variant: 'outline' },
      ],
    });
    await userEvent.click(screen.getAllByRole('button', { name: 'actions.remove' })[0]);
    expect(last()).toMatchObject({ buttons: [{ label: 'B', url: '/b', variant: 'outline' }] });
  });

  it('dugme bez varijante prikazuje primary kao izabrano', () => {
    renderForm({ buttons: [{ label: 'Bez', url: '/x' }] });
    expect(screen.getAllByRole('combobox')[1]).toHaveProperty('value', 'primary');
  });

  it('dodavanje dugmeta bez prethodnih postavlja novi niz', async () => {
    renderForm({ buttons: undefined, title: 'X' });
    await userEvent.click(screen.getByRole('button', { name: '+ Dugme' }));
    expect((last().buttons as unknown[]).length).toBe(1);
  });

  it('izmjenjuje godinu osnivanja i podnaslov', async () => {
    renderForm({ title: 'Naslov', foundedYear: '1921', subtitle: 'Stari' });
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.foundedYear'), '9');
    expect(last()).toMatchObject({ foundedYear: '19219' });
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.subtitle'), '!');
    expect(last()).toMatchObject({ subtitle: 'Stari!', foundedYear: '19219' });
  });
});
