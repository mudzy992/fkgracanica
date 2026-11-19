import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsCategoriesDialog } from './NewsCategoriesDialog';

const state = vi.hoisted(() => ({
  categories: { data: [] as unknown[], isFetching: false },
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  remove: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/as-array', () => ({ asArray: (x: unknown) => (Array.isArray(x) ? x : []) }));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: state.categories.data, isFetching: state.categories.isFetching }),
  useCreateNewsCategory: () => state.create,
  useDeleteNewsCategory: () => state.remove,
}));
vi.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/ui/button', () => ({ Button: ({ children, ...props }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) => <button {...props}>{children}</button> }));
vi.mock('../../components/ui/input', () => ({ Input: (props: Record<string, unknown>) => <input {...props} /> }));
vi.mock('../../lib/action-errors', () => ({ runAction: (p: Promise<unknown>) => p.catch(() => {}) }));

beforeEach(() => {
  state.categories = { data: [{ id: 'c1', name: 'Opšte', slug: 'opste' }] as unknown[], isFetching: false };
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.create;
  state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.remove;
});

describe('B05 NewsCategoriesDialog — P1/P2', () => {
  it('aria-busy kad isFetching', () => {
    state.categories = { data: [] as unknown[], isFetching: true };
    render(<NewsCategoriesDialog open onOpenChange={vi.fn()} />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('bez fetching nema aria-busy', () => {
    state.categories = { data: [] as unknown[], isFetching: false };
    render(<NewsCategoriesDialog open onOpenChange={vi.fn()} />);
    expect(document.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it('Dodaj disabled kad prazno trim', async () => {
    render(<NewsCategoriesDialog open onOpenChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('admin.newsCategories.newPlaceholder');
    await userEvent.clear(input);
    await userEvent.type(input, '   ');
    expect(screen.getByRole('button', { name: 'Dodaj' })).toBeDisabled();
  });

  it('Dodaj disabled kad isPending global', () => {
    state.create = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.create;
    render(<NewsCategoriesDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Dodaj' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Obriši' })).toBeDisabled();
  });

  it('Obriši disabled kad remove isPending', () => {
    state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.remove;
    render(<NewsCategoriesDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Obriši' })).toBeDisabled();
  });

  it('greška pri kreiranju ima role=alert', async () => {
    state.create = { mutateAsync: vi.fn(async () => { throw new Error('x'); }), isPending: false } as unknown as typeof state.create;
    render(<NewsCategoriesDialog open onOpenChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('admin.newsCategories.newPlaceholder');
    await userEvent.type(input, 'Nova');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Greška pri kreiranju kategorije');
  });
});
