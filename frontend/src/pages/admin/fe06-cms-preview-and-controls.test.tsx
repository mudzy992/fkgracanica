import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CmsPreviewPanel } from './cms/CmsPreviewPanel';
import { CommentatorControls } from './commentator/CommentatorControls';
import { ContactMessageSheet } from './ContactMessageSheet';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../cms/WidgetRenderer', () => ({
  WidgetRenderer: ({ section }: { section: { id: string; config: Record<string, unknown> } }) => (
    <div data-testid={`w-${section.id}`}>{JSON.stringify(section.config)}</div>
  ),
}));
vi.mock('./commentator/CommentatorClockBar', () => ({
  CommentatorClockBar: () => <div data-testid="clock" />,
}));
vi.mock('./commentator/CommentatorPenaltiesBoard', () => ({
  CommentatorPenaltiesBoard: () => <div data-testid="penalties" />,
}));
vi.mock('./commentator/CommentatorTeamBoard', () => ({
  CommentatorTeamColumn: ({ side, disabled }: { side: string; disabled?: boolean }) => (
    <div data-testid={`team-${side}`}>{disabled ? 'zaključano' : 'otvoreno'}</div>
  ),
}));
vi.mock('./commentator/CommentatorCommentPanel', () => ({
  CommentatorCommentPanel: () => <div data-testid="comments" />,
}));
vi.mock('./commentator/CommentatorEventLog', () => ({
  CommentatorEventLog: () => <div data-testid="log" />,
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    open ? (
      <section aria-label="sheet">
        <h2>{title}</h2>
        {children}
      </section>
    ) : null,
}));

const section = (over: Record<string, unknown> = {}) => ({
  id: 's1',
  pageId: 'p1',
  widgetType: 'hero',
  sortOrder: 0,
  config: { title: 'Naslov' },
  enabled: true,
  ...over,
});

describe('CmsPreviewPanel', () => {
  it('prikazuje samo uključene sekcije', () => {
    render(
      <CmsPreviewPanel
        sections={[section(), section({ id: 's2', enabled: false })] as never}
      />,
    );
    expect(screen.getByText('t:admin.cmsPreview.livePreview')).toBeInTheDocument();
    expect(screen.getByTestId('w-s1')).toBeInTheDocument();
    expect(screen.queryByTestId('w-s2')).toBeNull();
  });

  it('prazan prikaz ima poruku', () => {
    render(<CmsPreviewPanel sections={[]} />);
    expect(screen.getByText('t:admin.cmsPreview.empty')).toBeInTheDocument();
  });

  it('draft config zamjenjuje spremljenu konfiguraciju za sekciju u uređivanju', () => {
    render(
      <CmsPreviewPanel sections={[section()] as never} editingId="s1" draftConfig={{ title: 'Novo' }} />,
    );
    expect(screen.getByTestId('w-s1').textContent).toContain('Novo');
  });

  it('draft se ne primjenjuje bez editingId', () => {
    render(<CmsPreviewPanel sections={[section()] as never} draftConfig={{ title: 'Novo' }} />);
    expect(screen.getByTestId('w-s1').textContent).toContain('Naslov');
  });

  it('editing i highlight dobijaju prsten', () => {
    const { container } = render(
      <CmsPreviewPanel sections={[section(), section({ id: 's2' })] as never} highlightId="s2" />,
    );
    const wrappers = container.querySelectorAll('.ring-2');
    expect(wrappers).toHaveLength(1);
  });
});

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'LIVE',
  matchPeriod: 'FIRST_HALF',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  homeScore: 1,
  awayScore: 0,
  minute: 20,
  seasonId: 's1',
  homeClubId: 'k1',
  awayClubId: 'k2',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  ...over,
});

describe('CommentatorControls', () => {
  it('prikazuje sat, dvije kolone, komentare i dnevnik', () => {
    render(<CommentatorControls match={match() as never} />);
    expect(screen.getByTestId('clock')).toBeInTheDocument();
    expect(screen.getByTestId('team-home')).toHaveTextContent('otvoreno');
    expect(screen.getByTestId('team-away')).toHaveTextContent('otvoreno');
    expect(screen.getByTestId('comments')).toBeInTheDocument();
    expect(screen.getByTestId('log')).toBeInTheDocument();
    expect(screen.queryByTestId('penalties')).toBeNull();
  });

  it('penali zamjenjuju kolone', () => {
    render(<CommentatorControls match={match({ matchPeriod: 'PENALTIES' }) as never} />);
    expect(screen.getByTestId('penalties')).toBeInTheDocument();
    expect(screen.queryByTestId('team-home')).toBeNull();
  });

  it('bez LIVE statusa kolone su zaključane', () => {
    render(<CommentatorControls match={match({ status: 'HALFTIME' }) as never} />);
    expect(screen.getByTestId('team-home')).toHaveTextContent('zaključano');
  });
});

const message = {
  id: 'cm1',
  name: 'Amar',
  email: 'amar@example.com',
  subject: null,
  message: 'Tekst poruke',
  createdAt: '2026-05-02T10:00:00.000Z',
  isRead: false,
};

describe('ContactMessageSheet', () => {
  it('bez poruke ne renderira ništa', () => {
    const { container } = render(
      <ContactMessageSheet message={null} open onOpenChange={vi.fn()} onMarkRead={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje podatke i omogućava oznaku pročitanog', () => {
    const onMarkRead = vi.fn();
    render(
      <ContactMessageSheet message={message as never} open onOpenChange={vi.fn()} onMarkRead={onMarkRead} />,
    );
    expect(screen.getByRole('heading', { name: 'Kontakt poruka' })).toBeInTheDocument();
    expect(screen.getByText('Tekst poruke')).toBeInTheDocument();
    fireClick(screen.getByRole('button', { name: 'Označi kao pročitano' }));
    expect(onMarkRead).toHaveBeenCalledWith('cm1');
  });

  it('pročitana poruka nema dugme i naslov koristi subject', () => {
    render(
      <ContactMessageSheet
        message={{ ...message, isRead: true, subject: 'Pitanje' } as never}
        open
        onOpenChange={vi.fn()}
        onMarkRead={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Pitanje' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('zatvoren sheet ne prikazuje sadržaj', () => {
    render(
      <ContactMessageSheet message={message as never} open={false} onOpenChange={vi.fn()} onMarkRead={vi.fn()} />,
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });
});

function fireClick(el: HTMLElement) {
  el.click();
}
