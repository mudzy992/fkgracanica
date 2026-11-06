import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { installDialogPolyfill } from '../../test/dialog-polyfill';
import { CmsHubPage } from './cms/CmsHubPage';
import { RoundCascadeDeleteDialog } from './competition-hub/RoundCascadeDeleteDialog';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => <div data-testid="seo" /> }));
vi.mock('./cms/CmsPagesList', () => ({
  CmsPagesList: ({ onCreate }: { onCreate: () => void }) => (
    <button onClick={onCreate}>lista-stranica</button>
  ),
}));
vi.mock('./cms/CmsMenuEditor', () => ({ CmsMenuEditor: () => <div data-testid="menu-editor" /> }));
vi.mock('./cms/CmsPageCreateDialog', () => ({
  CmsPageCreateDialog: ({ open }: { open: boolean }) => (
    <div data-testid="create-dialog">{open ? 'otvoren' : 'zatvoren'}</div>
  ),
}));
vi.mock('../../components/admin/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    description,
    confirmDisabled,
    onOpenChange,
    onConfirm,
  }: {
    open: boolean;
    description: React.ReactNode;
    confirmDisabled?: boolean;
    onOpenChange: (v: boolean) => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="dialog">
        {description}
        <button disabled={confirmDisabled} onClick={onConfirm}>
          potvrdi
        </button>
        <button onClick={() => onOpenChange(false)}>zatvori</button>
      </div>
    ) : null,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

beforeAll(() => installDialogPolyfill());

describe('CmsHubPage', () => {
  it('podrazumijevano prikazuje stranice i prebacuje na meni', async () => {
    wrap(<CmsHubPage />);
    expect(screen.getByTestId('seo')).toBeInTheDocument();
    expect(screen.getByText('lista-stranica')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Meni' }));
    expect(screen.getByTestId('menu-editor')).toBeInTheDocument();
  });

  it('otvara dijalog za novu stranicu', async () => {
    wrap(<CmsHubPage />);
    expect(screen.getByTestId('create-dialog')).toHaveTextContent('zatvoren');
    await userEvent.click(screen.getByText('lista-stranica'));
    expect(screen.getByTestId('create-dialog')).toHaveTextContent('otvoren');
  });
});

describe('RoundCascadeDeleteDialog', () => {
  const impact = {
    matchCount: 9,
    approvedReportCount: 2,
    eventCount: 30,
    lineupCount: 18,
    commentCount: 4,
    ticketCount: 100,
  };

  it('zatvoren dijalog ne renderira sadržaj', () => {
    wrap(
      <RoundCascadeDeleteDialog
        open={false}
        roundLabel="5. kolo"
        impact={impact as never}
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('dialog')).toBeNull();
  });

  it('prikazuje brojke i blokira potvrdu do oznake', async () => {
    const onConfirm = vi.fn();
    wrap(
      <RoundCascadeDeleteDialog
        open
        roundLabel="5. kolo"
        impact={impact as never}
        isPending={false}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText('5. kolo')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('2 odobrenih izvještaja')).toBeInTheDocument();
    expect(screen.getByText('100 ulaznica')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: 'potvrdi' });
    expect(confirmBtn).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox'));
    expect(confirmBtn).toBeEnabled();
    await userEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('zatvaranje resetuje oznaku', async () => {
    const onOpenChange = vi.fn();
    wrap(
      <RoundCascadeDeleteDialog
        open
        roundLabel="5. kolo"
        impact={impact as never}
        isPending={false}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'zatvori' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
