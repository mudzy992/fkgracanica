import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SettingsFieldGroup } from '../../../lib/settings-sections';
import { ALL_SETTINGS_FIELD_GROUPS, hasSettingsFieldGroup, SettingsFieldGroupPanel } from './SettingsFieldGroupPanel';

const group: SettingsFieldGroup = {
  id: 'identity',
  title: 'Identitet kluba',
  description: 'Prikaz na javnom sajtu',
  keyPrefixes: ['club.'],
  scope: 'public',
};

const renderPanel = (values: Record<string, string>, over: Partial<Parameters<typeof SettingsFieldGroupPanel>[0]> = {}) => {
  const onDraft = vi.fn();
  const utils = render(
    <SettingsFieldGroupPanel
      group={group}
      values={values}
      draft={{}}
      onDraft={onDraft}
      {...over}
    />,
  );
  return { ...utils, onDraft };
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('SettingsFieldGroupPanel', () => {
  it('prikazuje samo ključeve koji pripadaju grupi, uz opis grupe', () => {
    const { container } = renderPanel({ 'club.name': 'FK', 'seo.title': 'SEO', 'contact.email': 'a@b' });
    expect(screen.getByText('Prikaz na javnom sajtu')).toBeInTheDocument();
    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(screen.getByLabelText('Naziv kluba')).toHaveValue('FK');
  });

  it('izostavlja module i ključeve kojima upravlja blagajna', () => {
    const { container } = renderPanel({ 'modules.news': 'true', 'ticketing.enabled': 'true', 'club.name': 'FK' });
    expect(container.querySelectorAll('input, [role="switch"]')).toHaveLength(1);
    expect(screen.getByLabelText('Naziv kluba')).toHaveValue('FK');
  });

  it('grupa bez prepoznatih ključeva ne renderuje ništa', () => {
    const { container } = renderPanel({ 'seo.title': 'SEO' });
    expect(container).toBeEmptyDOMElement();
  });

  it('izmjena polja šalje ključ i vrijednost u draft', async () => {
    const { container, onDraft } = renderPanel({ 'club.name': 'FK' }, { draft: {} });
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'FK Gračanica' } });
    expect(onDraft).toHaveBeenCalledWith('club.name', 'FK Gračanica');
  });

  it('readOnly onemogućuje polja', () => {
    const { container } = renderPanel({ 'club.name': 'FK' }, { readOnly: true });
    expect(container.querySelector('input')).toBeDisabled();
  });
});

describe('hasSettingsFieldGroup', () => {
  it('prepoznaje grupu samo kad ima preostalih ključeva', () => {
    expect(hasSettingsFieldGroup(group, { 'club.name': 'FK' })).toBe(true);
    expect(hasSettingsFieldGroup(group, { 'seo.title': 'SEO', 'modules.news': 'true' })).toBe(false);
    expect(ALL_SETTINGS_FIELD_GROUPS.length).toBeGreaterThan(0);
  });
});
