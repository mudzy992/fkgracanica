import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SeasonClubPicker } from './SeasonClubPicker';
import { SlugField } from './SlugField';
import { AdminBreadcrumbs, adminRootCrumbs } from './AdminBreadcrumbs';
import { SettingMediaField } from './SettingMediaField';

const state = vi.hoisted(() => ({ media: [] as Record<string, unknown>[] }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: Record<string, unknown>) => (o ? `${k}:${JSON.stringify(o)}` : k),
  }),
}));
vi.mock('./MediaPicker', () => ({
  MediaPicker: (props: Record<string, unknown>) => {
    state.media.push(props);
    return <div data-testid="media-picker" />;
  },
}));

const club = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  name: `Klub ${id}`,
  isOwnClub: false,
  ...over,
});

describe('SeasonClubPicker', () => {
  it('bez klubova prikazuje prazno stanje', () => {
    render(<SeasonClubPicker clubs={[]} value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('admin.season.emptyClubs')).toBeTruthy();
    expect(screen.getByText(/admin.season.selected:\{"count":0\}/)).toBeTruthy();
  });

  it('označava odabrane klubove i vlastiti klub', () => {
    render(
      <SeasonClubPicker
        clubs={[club('a'), club('b', { isOwnClub: true })]}
        value={['a']}
        onChange={vi.fn()}
      />,
    );
    const boxes = screen.getAllByRole('switch');
    expect(boxes[0].getAttribute('aria-checked')).toBe('true');
    expect(boxes[1].getAttribute('aria-checked')).toBe('false');
    expect(screen.getByText('admin.season.ownClub')).toBeTruthy();
  });

  it('klik dodaje i uklanja klub iz izbora', async () => {
    const onChange = vi.fn();
    render(<SeasonClubPicker clubs={[club('a'), club('b')]} value={['a']} onChange={onChange} />);
    const boxes = screen.getAllByRole('switch');
    await userEvent.click(boxes[1]);
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    await userEvent.click(boxes[0]);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('odaberi sve i očisti rade nad cijelom listom', async () => {
    const onChange = vi.fn();
    render(<SeasonClubPicker clubs={[club('a'), club('b')]} value={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'admin.season.selectAll' }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    await userEvent.click(screen.getByRole('button', { name: 'admin.season.clear' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('broj odabranih se prikazuje u zaglavlju', () => {
    render(<SeasonClubPicker clubs={[club('a'), club('b'), club('c')]} value={['a', 'c']} onChange={vi.fn()} />);
    expect(screen.getByText(/admin.season.selected:\{"count":2\}/)).toBeTruthy();
  });
});

describe('SlugField', () => {
  it('automatski izvodi slug iz naslova', async () => {
    const onChange = vi.fn();
    render(<SlugField title="Novi Klub" value="" onChange={onChange} />);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('novi-klub'));
  });

  it('normalizuje dijakritike', async () => {
    const onChange = vi.fn();
    render(<SlugField title="Gračanica Šuma" value="" onChange={onChange} />);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('gracanica-suma'));
  });

  it('ručni unos gasi automatsko izvođenje', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SlugField title="Naslov" value="" onChange={onChange} />);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('naslov'));
    await userEvent.type(screen.getByRole('textbox'), 'x');
    expect(onChange).toHaveBeenLastCalledWith('x');
    onChange.mockClear();
    rerender(<SlugField title="Drugi naslov" value="x" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disabled polje ne izvodi slug i onemogućeno je', () => {
    const onChange = vi.fn();
    render(<SlugField title="Naslov" value="rucno" onChange={onChange} disabled />);
    expect(onChange).not.toHaveBeenCalled();
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
  });
});

const renderCrumbs = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('AdminBreadcrumbs', () => {
  it('prazna lista ne renderira navigaciju', () => {
    const { container } = renderCrumbs(<AdminBreadcrumbs items={[]} />);
    expect(container.textContent).toBe('');
  });

  it('zadnja stavka nosi aria-current i nije link', () => {
    renderCrumbs(
      <AdminBreadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Klub X' }]} />,
    );
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('admin.breadcrumb:"Putanja"');
    expect(screen.getByRole('link', { name: 'Admin' }).getAttribute('href')).toBe('/admin');
    const current = screen.getByText('Klub X');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(nav.querySelectorAll('a')).toHaveLength(1);
  });

  it('stavka bez cilja nije link i nema aria-current ako nije zadnja', () => {
    renderCrumbs(
      <AdminBreadcrumbs
        items={[{ label: 'Grupa' }, { label: 'Stranica', to: '/x' }, { label: 'Kraj' }]}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Grupa' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Stranica' }).getAttribute('href')).toBe('/x');
    expect(screen.getByText('Grupa').getAttribute('aria-current')).toBeNull();
  });

  it('adminRootCrumbs pravi prva dva nivoa', () => {
    expect(adminRootCrumbs()).toEqual([{ label: 'Admin', to: '/admin' }]);
    expect(adminRootCrumbs('Mediji')).toEqual([
      { label: 'Admin', to: '/admin' },
      { label: 'Mediji' },
    ]);
  });
});

describe('SettingMediaField', () => {
  it('prosljeđuje oznaku, vrijednost i readOnly', () => {
    state.media = [];
    render(
      <SettingMediaField settingKey="club.crestUrl" value="" onChange={vi.fn()} readOnly />,
    );
    expect(screen.getByTestId('media-picker')).toBeTruthy();
    expect(state.media[0]).toMatchObject({ value: null, readOnly: true });
    expect(String(state.media[0].label)).toMatch(/[a-zA-Z]/);
  });

  it('postojeća vrijednost se prosljeđuje kao string', () => {
    state.media = [];
    render(<SettingMediaField settingKey="club.crestUrl" value="originals/c.png" onChange={vi.fn()} />);
    expect(state.media[0].value).toBe('originals/c.png');
    expect(state.media[0].readOnly).toBeUndefined();
  });
});
