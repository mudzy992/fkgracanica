import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../../i18n';
import { useConfirm } from '../../../hooks/use-confirm';
import { installDialogPolyfill } from '../../../test/dialog-polyfill';
import { MediaFolderSheet } from './MediaFolderSheet';

installDialogPolyfill();

function Example({ onSelect, onDelete }: { onSelect: (id?: string) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <button onClick={() => setOpen(true)}>Otvori mape</button>
      <MediaFolderSheet
        open={open}
        onOpenChange={setOpen}
        folders={[{ id: 'folder-1', name: 'Fotografije' }]}
        onSelect={onSelect}
        newName=""
        onNewNameChange={() => undefined}
        onDelete={() => void confirm({ title: 'Obrisati mapu?', variant: 'danger' }).then((ok) => ok && onDelete())}
      />
      {dialog}
    </>
  );
}

describe('MediaFolderSheet', () => {
  it('bira mapu, poziva callback i zatvara Sheet', async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    render(<Example onSelect={select} onDelete={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Otvori mape' });
    await user.click(trigger);
    const sheet = screen.getByRole('dialog', { name: 'Mape medija' });
    await user.click(within(sheet).getByRole('button', { name: /^Fotografije/ }));
    expect(select).toHaveBeenCalledWith('folder-1');
    expect(screen.queryByRole('dialog', { name: 'Mape medija' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('omogućava ugniježđenu potvrdu bez zatvaranja liste mapa', async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    render(<Example onSelect={vi.fn()} onDelete={remove} />);
    await user.click(screen.getByRole('button', { name: 'Otvori mape' }));
    const sheet = screen.getByRole('dialog', { name: 'Mape medija' });
    await user.click(within(sheet).getByRole('button', { name: 'Obriši: Fotografije' }));
    const confirmation = screen.getByRole('dialog', { name: 'Obrisati mapu?' });
    expect(confirmation.tagName).toBe('DIALOG');
    const confirmButton = within(confirmation).getByRole('button', { name: 'Potvrdi' });
    expect(confirmButton).toHaveClass('bg-danger', 'text-background');
    await user.click(confirmButton);
    expect(remove).toHaveBeenCalledOnce();
    expect(sheet).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });
});

describe('MediaFolderSheet — zatvaranje', () => {
  it('X u zaglavlju zatvara sheet bez odabira mape', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Example onSelect={onSelect} onDelete={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Otvori mape' }));
    const sheet = await screen.findByRole('dialog');
    await user.click(within(sheet).getAllByRole('button', { name: 'Zatvori' }).find((b) => !b.className.includes('inset-0'))!);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onSelect).not.toHaveBeenCalled();
  });
});
