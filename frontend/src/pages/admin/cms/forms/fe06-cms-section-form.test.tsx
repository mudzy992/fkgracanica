import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsSectionForm } from './CmsSectionForm';

const state = vi.hoisted(() => ({
  media: [] as { value: string; label?: string }[],
  htmlEditor: [] as string[],
  richEditor: [] as string[],
  entity: [] as Record<string, unknown>[],
  changes: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, label, onChange }: { value: string; label?: string; onChange: (v: string) => void }) => {
    state.media.push({ value, label });
    return (
      <button type="button" onClick={() => onChange('picked.jpg')}>
        media::{label}
      </button>
    );
  },
}));
vi.mock('../../../../components/admin/CustomHtmlEditor', () => ({
  CustomHtmlEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    state.htmlEditor.push(value);
    return (
      <button type="button" onClick={() => onChange('<p>html</p>')}>
        custom-html
      </button>
    );
  },
}));
vi.mock('../../../../components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    state.richEditor.push(value);
    return (
      <button type="button" onClick={() => onChange('<p>rich</p>')}>
        rich-text
      </button>
    );
  },
}));
vi.mock('../../../../components/admin/EntitySelect', () => ({
  EntitySelect: (props: Record<string, unknown>) => {
    state.entity.push(props);
    return <div data-testid="entity-select">{String(props.endpoint)}</div>;
  },
}));

const config = {};
const onChange = (next: Record<string, unknown>) => state.changes.push(next);

const renderForm = (widgetType: string, cfg: Record<string, unknown> = config) =>
  render(<CmsSectionForm widgetType={widgetType} config={cfg} onChange={onChange} />);

describe('CmsSectionForm', () => {
  beforeEach(() => {
    state.media = [];
    state.richEditor = [];
    state.htmlEditor = [];
    state.entity = [];
    state.changes = [];
  });

  it('prikazuje labelu widgeta iz meta podataka', () => {
    renderForm('hero');
    expect(screen.getByText('Widget: Hero baner')).toBeTruthy();
  });

  it('nepoznat tip koristi sam naziv tipa kao labelu', () => {
    renderForm('nepostojeci');
    expect(screen.getByText('Widget: nepostojeci')).toBeTruthy();
  });

  it('hero prikazuje polja hero forme', () => {
    renderForm('hero');
    expect(screen.getByPlaceholderText('admin.cmsWidget.titleRequired')).toBeTruthy();
    expect(state.media[0]).toMatchObject({ value: '', label: 'admin.cmsWidget.background' });
  });

  it('news-feed prikazuje broj vijesti sa podrazumijevanom vrijednošću', () => {
    renderForm('news-feed');
    expect(screen.getByPlaceholderText('admin.cmsWidget.newsCount')).toBeTruthy();
  });

  it('rich-text prosljeđuje html u editor i vraća izmjenu', async () => {
    renderForm('rich-text', { html: '<p>staro</p>' });
    expect(state.richEditor).toEqual(['<p>staro</p>']);
    await userEvent.click(screen.getByRole('button', { name: 'rich-text' }));
    expect(state.changes[0]).toEqual({ html: '<p>rich</p>' });
  });

  it('custom-html prosljeđuje html u editor i vraća izmjenu', async () => {
    renderForm('custom-html');
    expect(state.htmlEditor).toEqual(['']);
    await userEvent.click(screen.getByRole('button', { name: 'custom-html' }));
    expect(state.changes[0]).toEqual({ html: '<p>html</p>' });
  });

  it('footer-about prikazuje tekst i emituje izmjenu', async () => {
    renderForm('footer-about', { text: 'O klubu' });
    const area = screen.getByPlaceholderText('admin.cmsSection.aboutPlaceholder');
    expect((area as HTMLTextAreaElement).value).toBe('O klubu');
    await userEvent.type(area, '!');
    expect(state.changes[0]).toEqual({ text: 'O klubu!' });
  });

  it('next-match prikazuje naslov i birač pozadine', () => {
    renderForm('next-match');
    expect(screen.getByPlaceholderText('admin.cmsNextMatch.titlePlaceholder')).toBeTruthy();
    expect(state.media[0].label).toBe('admin.cmsNextMatch.stadiumBackground');
  });

  it('club-about-cta prikazuje obavijest o automatizaciji', () => {
    renderForm('club-about-cta');
    expect(screen.getByText(/Ovaj widget je potpuno automatizovan/)).toBeTruthy();
  });

  it('nepoznati tip pada na generičku formu sa naslovom', () => {
    renderForm('sponsors', { title: 'Sponzori' });
    expect(screen.getByPlaceholderText('admin.cmsWidget.sectionTitle')).toBeTruthy();
    expect(screen.getByDisplayValue('Sponzori')).toBeTruthy();
  });
});
