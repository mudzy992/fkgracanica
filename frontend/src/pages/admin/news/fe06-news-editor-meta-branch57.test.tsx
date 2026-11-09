import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  useNewsCategories: () => ({ data: [{ id: 'c1', name: 'Vijesti' }] }),
}));
vi.mock('../../../components/admin/EntitySelect', () => ({
  EntitySelect: (props: EntityProps) => {
    state.entity.push(props);
    return <div>entity:{props.endpoint}</div>;
  },
}));
vi.mock('../../../components/admin/SlugField', () => ({
  SlugField: ({ value }: { value: string }) => <div>slug:{value}</div>,
}));

function Harness() {
  const { register, control, watch, setValue, formState } = useForm<NewsFormData>({
    defaultValues: { ...emptyNewsForm, slug: 's1' },
  });
  return <NewsEditorMeta register={register} control={control} watch={watch} setValue={setValue} errors={formState.errors} />;
}

const entityFor = (endpoint: string) => [...state.entity].reverse().find((p) => p.endpoint === endpoint)!;

beforeEach(() => { state.entity = []; });

describe('fe06 NewsEditorMeta branch57 ?? fallback', () => {
  it('homeClub null → ?? "?"', () => {
    render(<Harness />);
    const matches = entityFor('/matches');
    const label = matches.formatLabel!({
      homeClub: null, awayClub: { name: 'FK B' }, scheduledAt: '2026-11-06T18:00:00.000Z',
    } as never);
    expect(label).toContain('? vs FK B');
  });
  it('awayClub null → ?? "?"', () => {
    render(<Harness />);
    const matches = entityFor('/matches');
    const label = matches.formatLabel!({
      homeClub: { name: 'FK A' }, awayClub: null, scheduledAt: '2026-11-06T18:00:00.000Z',
    } as never);
    expect(label).toContain('FK A vs ?');
  });
  it('oba null → ?? "?" oba', () => {
    render(<Harness />);
    const matches = entityFor('/matches');
    const label = matches.formatLabel!({
      homeClub: null, awayClub: null, scheduledAt: '2026-11-06T18:00:00.000Z',
    } as never);
    expect(label).toContain('? vs ?');
  });
});
