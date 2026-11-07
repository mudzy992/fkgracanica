import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsFeedSectionForm } from './NewsFeedSectionForm';
import { NextMatchSectionForm } from './NextMatchSectionForm';
import { ClubAboutCtaSectionForm } from './ClubAboutCtaSectionForm';

const state = vi.hoisted(() => ({
  media: [] as { value: string; label?: string }[],
  changes: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../../components/admin/MediaPicker', () => ({
  MediaPicker: ({ value, label, onChange }: { value: string; label?: string; onChange: (v: string) => void }) => {
    state.media.push({ value, label });
    return (
      <button type="button" onClick={() => onChange('stadion.jpg')}>
        pick-media
      </button>
    );
  },
}));

const last = () => state.changes[state.changes.length - 1];

function Harness({
  Comp,
  initial,
}: {
  Comp: (props: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) => React.ReactElement;
  initial: Record<string, unknown>;
}) {
  const [config, setConfig] = useState(initial);
  return (
    <Comp
      config={config}
      onChange={(next) => {
        state.changes.push(next);
        setConfig(next);
      }}
    />
  );
}

describe('NewsFeedSectionForm', () => {
  beforeEach(() => {
    state.changes = [];
  });

  it('prazna konfiguracija dobija podrazumijevani limit i način rada', async () => {
    render(<Harness Comp={NewsFeedSectionForm} initial={{}} />);
    const limit = screen.getByPlaceholderText('admin.cmsWidget.newsCount');
    expect(limit).toHaveProperty('value', '3');
    await userEvent.type(limit, '4');
    expect(last()).toMatchObject({ limit: 34, mode: 'latest' });
  });

  it('izmjenom naslova čuva ostala polja', async () => {
    render(<Harness Comp={NewsFeedSectionForm} initial={{ title: 'Vijesti', limit: 5 }} />);
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.sectionTitleShort'), '!');
    expect(last()).toMatchObject({ title: 'Vijesti!', limit: 5, mode: 'latest' });
  });

  it('link i oznaka „vidi sve“ se upisuju', async () => {
    render(<Harness Comp={NewsFeedSectionForm} initial={{}} />);
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.viewAllLink'), '/vijesti');
    expect(last()).toMatchObject({ viewAllUrl: '/vijesti' });
    await userEvent.type(screen.getByPlaceholderText('admin.cmsWidget.viewAllLabel'), 'Sve');
    expect(last()).toMatchObject({ viewAllLabel: 'Sve', viewAllUrl: '/vijesti' });
  });
});

describe('NextMatchSectionForm', () => {
  beforeEach(() => {
    state.changes = [];
    state.media = [];
  });

  it('prikazuje naslov, birač pozadine i uključen prikaz rezultata', () => {
    render(<Harness Comp={NextMatchSectionForm} initial={{ title: 'Sljedeća' }} />);
    expect(screen.getByDisplayValue('Sljedeća')).toBeTruthy();
    expect(state.media[0]).toMatchObject({ value: '', label: 'admin.cmsNextMatch.stadiumBackground' });
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
  });

  it('birač medija upisuje pozadinu', async () => {
    render(<Harness Comp={NextMatchSectionForm} initial={{}} />);
    await userEvent.click(screen.getByRole('button', { name: 'pick-media' }));
    expect(last()).toMatchObject({ backgroundImage: 'stadion.jpg' });
  });

  it('isključivanje zadnjeg rezultata upisuje false', async () => {
    render(<Harness Comp={NextMatchSectionForm} initial={{}} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(last()).toMatchObject({ showLastResult: false });
  });

  it('eksplicitno false ostaje isključeno', () => {
    render(<Harness Comp={NextMatchSectionForm} initial={{ showLastResult: false }} />);
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', false);
  });
});

describe('ClubAboutCtaSectionForm', () => {
  beforeEach(() => {
    state.changes = [];
  });

  it('prikazuje obavijest i čisti postojeću konfiguraciju', () => {
    render(<Harness Comp={ClubAboutCtaSectionForm} initial={{ title: 'X' }} />);
    expect(screen.getByText(/potpuno automatizovan/)).toBeTruthy();
    expect(state.changes).toEqual([{}]);
  });

  it('prazna konfiguracija ne izaziva beskonačnu petlju', () => {
    render(<Harness Comp={ClubAboutCtaSectionForm} initial={{}} />);
    expect(state.changes).toEqual([]);
  });
});

describe('NextMatchSectionForm — izmjena naslova', () => {
  it('unos u naslov čuva ostala polja sekcije', async () => {
    render(<Harness Comp={NextMatchSectionForm} initial={{ title: 'Sljedeća', showResult: true }} />);
    await userEvent.type(screen.getByDisplayValue('Sljedeća'), '!');
    expect(last()).toMatchObject({ title: 'Sljedeća!', showResult: true });
  });
});
