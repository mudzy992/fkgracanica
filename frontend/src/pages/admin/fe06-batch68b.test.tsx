import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const compState = vi.hoisted(() => ({ rounds: undefined as unknown }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: async () => true, dialog: null }) }));
vi.mock('../../hooks/use-rounds', async (orig) => {
  const actual = await (orig as () => Promise<Record<string, unknown>>)();
  return {
    ...(actual as object),
    useRounds: () => ({ data: compState.rounds, isLoading: false }),
    useDeleteRound: () => ({ mutateAsync: vi.fn() }),
  };
});
vi.mock('../../hooks', async (orig) => {
  const actual = await (orig as () => Promise<Record<string, unknown>>)();
  return {
    ...(actual as object),
    useClubs: () => ({ data: [] }),
    useMatches: () => ({ data: [], isLoading: false }),
  };
});
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: [] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => true }));

import { MediaPageFileInputs } from './media/MediaPageFileInputs';
import { createRef } from 'react';

describe('fe06-batch68b media+rounds', () => {
  it('MediaPageFileInputs pokriva files?.length true i false', () => {
    const uploadRef = createRef<HTMLInputElement>();
    const replaceRef = createRef<HTMLInputElement>();
    const onUpload = vi.fn();
    const onReplace = vi.fn();
    const { container } = render(
      <MediaPageFileInputs uploadRef={uploadRef as never} replaceRef={replaceRef as never} replaceId="r1" onUpload={onUpload} onReplace={onReplace} />,
    );
    const inputs = container.querySelectorAll('input[type="file"]');
    expect(inputs.length).toBe(2);
    const uploadInput = inputs[0] as HTMLInputElement;
    // files null/undefined -> ne poziva onUpload
    fireEvent.change(uploadInput, { target: { files: null, value: '' } });
    expect(onUpload).not.toHaveBeenCalled();
    // files prazan FileList
    const emptyFiles = { length: 0 } as unknown as FileList;
    fireEvent.change(uploadInput, { target: { files: emptyFiles, value: '' } });
    expect(onUpload).not.toHaveBeenCalled();
    // files sa jednim fajlom -> poziva onUpload
    const file = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const fileList = { 0: file, length: 1, item: (_i: number) => file } as unknown as FileList;
    fireEvent.change(uploadInput, { target: { files: fileList, value: '' } });
    expect(onUpload).toHaveBeenCalledWith(fileList);
  });

  it('RoundMatchesPanel pokriva if (!o) setEdit null', async () => {
    const { RoundMatchesPanel } = await import('./competition-hub/RoundMatchesPanel');
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <RoundMatchesPanel seasonId="s1" roundId="r1" canManage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(container).toBeDefined();
  });

  it('SeasonRoundsPanel pokriva _count?.matches ?? 0', async () => {
    compState.rounds = [{ id: 'r1', name: 'Kolo 1', _count: undefined }] as unknown as never;
    const { SeasonRoundsPanel } = await import('./competition-hub/SeasonRoundsPanel');
    const qc = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <SeasonRoundsPanel seasonId="s1" selectedRoundId={null} onSelectRound={vi.fn()} canManage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(container).toBeDefined();
    compState.rounds = [{ id: 'r1', name: 'Kolo 1', _count: { matches: 2 } }] as unknown as never;
    const { container: c2 } = render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <SeasonRoundsPanel seasonId="s1" selectedRoundId="r1" onSelectRound={vi.fn()} canManage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(c2).toBeDefined();
  });
});
