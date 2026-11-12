import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaFolderTree } from './MediaFolderTree';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));

const folder = (over: Record<string, unknown> = {}) => ({
  id: 'f1',
  name: 'Galerija',
  parentId: null,
  _count: { assets: 4 },
  ...over,
});

const base = {
  selectedId: undefined as string | undefined,
  onSelect: vi.fn(),
  newName: '',
  onNewNameChange: vi.fn(),
};

describe('MediaFolderTree', () => {
  it('prikazuje "sve" dugme i korijenske foldere bez djece', () => {
    render(
      <MediaFolderTree
        {...base}
        folders={[folder(), folder({ id: 'f2', name: 'Dijete', parentId: 'f1' })] as never}
      />,
    );
    expect(screen.getByRole('button', { name: 't:admin.mediaFolders.all' })).toBeInTheDocument();
    expect(screen.getByText('Galerija')).toBeInTheDocument();
    expect(screen.queryByText('Dijete')).toBeNull();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('prikazuje djecu rekurzivno i označava odabrani folder', () => {
    render(
      <MediaFolderTree
        {...base}
        selectedId="f2"
        folders={
          [
            folder({
              children: [folder({ id: 'f2', name: 'Dijete', parentId: 'f1', _count: undefined })],
            }),
          ] as never
        }
      />,
    );
    const child = screen.getByRole('button', { name: /Dijete/ });
    expect(child.className).toContain('bg-primary/10');
    expect(child.textContent).toContain('0');
  });

  it('odabir foldera i "sve" emituju callback', async () => {
    const onSelect = vi.fn();
    render(<MediaFolderTree {...base} onSelect={onSelect} folders={[folder()] as never} />);
    await userEvent.click(screen.getByRole('button', { name: 't:admin.mediaFolders.all' }));
    expect(onSelect).toHaveBeenCalledWith(undefined);
    await userEvent.click(screen.getByRole('button', { name: /Galerija/ }));
    expect(onSelect).toHaveBeenCalledWith('f1');
  });

  it('prazan spisak prikazuje samo "sve" i nema akcija', () => {
    render(<MediaFolderTree {...base} folders={null as never} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('kreiranje foldera je onemogućeno za prazno ime i emituje akciju', async () => {
    const onCreate = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(
      <MediaFolderTree
        {...base}
        folders={[]}
        onNewNameChange={onChange}
        onCreate={onCreate}
        isCreating={false}
      />,
    );
    const create = screen.getByRole('button', {
      name: 't:actions.create: t:admin.mediaPicker.newFolder',
    });
    expect(create).toBeDisabled();
    await userEvent.type(screen.getByPlaceholderText('t:admin.mediaPicker.newFolder'), 'A');
    expect(onChange).toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
    rerender(
      <MediaFolderTree
        {...base}
        newName="Novi"
        folders={[]}
        onCreate={onCreate}
        isCreating={false}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 't:actions.create: t:admin.mediaPicker.newFolder' }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('tokom kreiranja dugme je onemogućeno', () => {
    render(
      <MediaFolderTree {...base} newName="Novi" folders={[]} onCreate={vi.fn()} isCreating />,
    );
    expect(screen.getByRole('button', { name: 't:actions.create: t:admin.mediaPicker.newFolder' })).toBeDisabled();
  });

  it('preimenovanje šalje novi naziv, prazno ili nepromijenjeno ne šalje', async () => {
    const onRename = vi.fn();
    render(<MediaFolderTree {...base} folders={[folder()] as never} onRename={onRename} />);
    await userEvent.click(screen.getByRole('button', { name: 't:actions.edit: Galerija' }));
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Nova galerija');
    await userEvent.tab();
    expect(onRename).toHaveBeenCalledWith('f1', 'Nova galerija');
  });

  it('preimenovanje na isto ime ne šalje promjenu', async () => {
    const onRename = vi.fn();
    render(<MediaFolderTree {...base} folders={[folder()] as never} onRename={onRename} />);
    await userEvent.click(screen.getByRole('button', { name: 't:actions.edit: Galerija' }));
    await userEvent.tab();
    expect(onRename).not.toHaveBeenCalled();
  });

  it('brisanje emituje id i naziv foldera', async () => {
    const onDelete = vi.fn();
    render(<MediaFolderTree {...base} folders={[folder()] as never} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: 't:actions.delete: Galerija' }));
    expect(onDelete).toHaveBeenCalledWith('f1', 'Galerija');
  });

  it('bez akcija nema dugmadi za uređivanje i brisanje', () => {
    render(<MediaFolderTree {...base} folders={[folder()] as never} className="custom" />);
    expect(screen.queryByRole('button', { name: /t:actions.edit/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /t:actions.delete/ })).toBeNull();
  });
});
