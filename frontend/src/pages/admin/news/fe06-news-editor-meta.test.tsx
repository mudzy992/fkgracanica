import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { emptyNewsForm, type NewsFormData } from '../news-form-utils';
import { NewsEditorMeta } from './NewsEditorMeta';

type EntityProps = {
  endpoint: string;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  formatLabel?: (item: never) => string;
};

const state = vi.hoisted(() => ({ entity: [] as EntityProps[] }));

vi.mock('../../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: [{ id: 'c1', name: 'Vijesti' }, { id: 'c2', name: 'Kup' }] }),
}));
vi.mock('../../../components/admin/EntitySelect', () => ({
  EntitySelect: (props: EntityProps) => {
    state.entity.push(props);
    return <div>entity:{props.endpoint}</div>;
  },
}));
vi.mock('../../../components/admin/SlugField', () => ({
  SlugField: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <button onClick={() => onChange('novi-slug')}>slug:{value}</button>
  ),
}));

function Harness() {
  const { register, control, watch, setValue, formState } = useForm<NewsFormData>({
    defaultValues: { ...emptyNewsForm, slug: 'stari-slug' },
  });
  return (
    <NewsEditorMeta register={register} control={control} watch={watch}
      setValue={setValue} errors={formState.errors} />
  );
}

const entityFor = (endpoint: string) =>
  [...state.entity].reverse().find((p) => p.endpoint === endpoint)!;

beforeEach(() => {
  state.entity = [];
});

describe('NewsEditorMeta', () => {
  it('prikazuje kategorije iz hooka i slug polje', () => {
    render(<Harness />);
    expect(screen.getByRole('option', { name: 'Vijesti' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Kup' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'slug:stari-slug' })).toBeInTheDocument();
  });

  it('galerija prima samo string vrijednost', () => {
    render(<Harness />);
    const gallery = entityFor('/gallery');
    expect(() => gallery.onChange(['g1', 'g2'])).not.toThrow();
    expect(() => gallery.onChange('g1')).not.toThrow();
    expect(typeof gallery.value).toBe('string');
  });

  it('formatira oznake utakmica i igrača', () => {
    render(<Harness />);
    const matches = entityFor('/matches');
    const label = matches.formatLabel!({
      homeClub: { name: 'FK A' }, awayClub: { name: 'FK B' }, scheduledAt: '2026-11-06T18:00:00.000Z',
    } as never);
    expect(label).toContain('FK A vs FK B');
    const players = entityFor('/players');
    expect(players.formatLabel!({ firstName: 'Ana', lastName: 'Anić', number: 9 } as never))
      .toBe('Ana Anić (#9)');
    expect(players.formatLabel!({ firstName: 'Emir', lastName: 'Emić' } as never)).toBe('Emir Emić');
  });
});
