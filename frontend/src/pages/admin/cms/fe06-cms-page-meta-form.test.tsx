import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CmsPage } from '../../../cms/types';
import { CmsPageMetaForm } from './CmsPageMetaForm';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const page = (over: Partial<CmsPage> = {}) =>
  ({ id: 'p1', title: 'O nama', slug: 'o-nama', isSystem: false, ...over }) as CmsPage;

const meta = { title: 'O nama', slug: 'o-nama', status: 'DRAFT' };

const renderForm = (over: Partial<React.ComponentProps<typeof CmsPageMetaForm>> = {}) => {
  const onChange = vi.fn();
  const onSave = vi.fn();
  render(
    <CmsPageMetaForm page={page()} meta={meta} onChange={onChange} onSave={onSave} {...over} />,
  );
  return { onChange, onSave };
};

describe('CmsPageMetaForm', () => {
  it('prikazuje naslov sa imenom stranice i vrijednosti polja', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'admin.cmsMeta.editTitle' })).toBeTruthy();
    expect(screen.getByDisplayValue('O nama')).toBeTruthy();
    expect(screen.getByDisplayValue('o-nama')).toBeTruthy();
    expect(screen.getByDisplayValue('admin.cmsMeta.draft')).toBeTruthy();
  });

  it('izmjena naslova i sluga emituje novi objekat', async () => {
    const { onChange } = renderForm();
    await userEvent.type(screen.getByPlaceholderText('admin.cmsMeta.title'), 'X');
    expect(onChange).toHaveBeenLastCalledWith({ ...meta, title: 'O namaX' });
    await userEvent.type(screen.getByPlaceholderText('admin.slug.label'), 'Y');
    expect(onChange).toHaveBeenLastCalledWith({ ...meta, slug: 'o-namaY' });
  });

  it('promjena statusa emituje novi status', async () => {
    const { onChange } = renderForm();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'PUBLISHED');
    expect(onChange).toHaveBeenLastCalledWith({ ...meta, status: 'PUBLISHED' });
  });

  it('sistemska stranica zaključava slug', () => {
    renderForm({ page: page({ isSystem: true }) });
    expect(screen.getByPlaceholderText('admin.slug.label')).toHaveProperty('disabled', true);
  });

  it('dugme za čuvanje zove onSave i gasi se dok je zahtjev u toku', async () => {
    const { onSave } = renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'admin.cmsMeta.save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('objavljeno prikazuje javni URL', () => {
    renderForm({ meta: { ...meta, status: 'PUBLISHED' } });
    const link = screen.getByRole('link', { name: '/p/o-nama' });
    expect(link.getAttribute('href')).toBe('/p/o-nama');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('naslovna stranica nikada ne prikazuje javni URL', () => {
    renderForm({ page: page({ slug: 'home' }), meta: { ...meta, slug: 'home', status: 'PUBLISHED' } });
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('nacrt ne prikazuje javni URL', () => {
    renderForm();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('isPending onemogućava dugme', () => {
    renderForm({ isPending: true });
    expect(screen.getByRole('button', { name: 'admin.cmsMeta.save' })).toHaveProperty('disabled', true);
  });
});
