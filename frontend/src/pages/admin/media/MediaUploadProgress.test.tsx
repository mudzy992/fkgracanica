import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../../i18n';
import type { UploadQueueState } from '../../../hooks/use-media-upload-queue';
import { MediaUploadProgress } from './MediaUploadProgress';

const empty: UploadQueueState = {
  total: 0, done: 0, failed: 0, isRunning: false, isRefreshing: false,
  refreshFailed: false, failedFiles: [], rejectedFiles: [],
};
afterEach(async () => { await i18n.changeLanguage('bs'); });

describe('pristupačni izvještaj medijskog reda', () => {
  it('prazan red ne prikazuje izvještaj', () => {
    const { container } = render(<MediaUploadProgress progress={empty} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prikazuje broj završnih, grešaka i fazu osvježavanja bez prekidanja reda', () => {
    const progress = { ...empty, total: 3, done: 2, failed: 1, isRunning: true, isRefreshing: true };
    render(<MediaUploadProgress progress={progress} />);
    expect(screen.getByRole('progressbar', { name: 'Napredak uploada' })).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '3');
    expect(screen.getByRole('status')).toHaveTextContent('2/3 završeno, 1 neuspješno');
    expect(screen.getByRole('status')).toHaveTextContent('Osvježavanje biblioteke');
    expect(screen.queryByRole('button', { name: 'Zatvori izvještaj' })).not.toBeInTheDocument();
  });

  it('imenom i mapom razlikuje neizvjestan upload, promijenjenu sesiju i odbijenu ne-sliku', async () => {
    const clear = vi.fn();
    const progress: UploadQueueState = {
      ...empty, total: 2, done: 2, failed: 2,
      failedFiles: [
        { id: 1, name: 'failed.jpg', folderId: 'a', folderName: 'Klub', reason: 'unconfirmed' },
        { id: 2, name: 'not-sent.jpg', folderId: 'b', reason: 'sessionChanged' },
      ],
      rejectedFiles: [{ id: 3, name: 'notes.txt', reason: 'notImage' }],
    };
    render(<MediaUploadProgress progress={progress} onClear={clear} />);
    expect(screen.getByRole('status')).toHaveTextContent('0/2 uspješno, 2 neuspješno');
    expect(screen.getAllByRole('alert')[0]).toHaveTextContent('failed.jpg — Klub — ishod nije potvrđen');
    expect(screen.getAllByRole('alert')[0]).toHaveTextContent('not-sent.jpg — b — nije poslano');
    expect(screen.getAllByRole('alert')[1]).toHaveTextContent('notes.txt — nije slika');
    await userEvent.click(screen.getByRole('button', { name: 'Zatvori izvještaj' }));
    expect(clear).toHaveBeenCalledOnce();
  });

  it('engleski prikazuje upozorenje i ručno osvježavanje bez tvrdnje o uspjehu', async () => {
    await i18n.changeLanguage('en');
    const retry = vi.fn();
    render(<MediaUploadProgress progress={{ ...empty, total: 1, done: 1, refreshFailed: true }} onRetryRefresh={retry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('The library refresh could not be confirmed');
    await userEvent.click(screen.getByRole('button', { name: 'Refresh library' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
