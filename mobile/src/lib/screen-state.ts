export type ScreenStatus = 'idle' | 'loading' | 'empty' | 'error';

export function resolveListStatus(params: {
  loading: boolean;
  error: string | null;
  itemCount: number;
}): ScreenStatus {
  if (params.loading) return 'loading';
  if (params.error) return 'error';
  if (params.itemCount === 0) return 'empty';
  return 'idle';
}
