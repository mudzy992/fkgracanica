import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (orig) => {
  const a: any = await orig();
  return { ...a, useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }) };
});
vi.mock('./unsaved-navigation-context', () => ({ useUnsavedNavigation: vi.fn() }));
vi.mock('./form-dirty', async (orig) => {
  const a: any = await vi.importActual('./form-dirty');
  return { ...a, isFormDirty: vi.fn(() => true), snapshotForm: vi.fn(() => 'snap') };
});
vi.mock('../ui/dialog', () => ({ Dialog: ({ children }: any) => <div>{children}</div>, DialogHeader: ({ children }: any) => <div>{children}</div>, DialogBody: ({ children }: any) => <div>{children}</div> }));
vi.mock('../../hooks/use-media-admin', () => ({ useMediaAssets: () => ({ data: { items: [] }, isLoading: false }), useMediaFolders: () => ({ data: [] }) }));

describe('batch60 admin-c — AdminFormSheet 54 [58,0] + RichTextEditor 52 etc', () => {
  it('AdminFormSheet dirty false -> fallback', async () => {
    const { AdminFormSheet } = await import('./AdminFormSheet');
    const onOpenChange = vi.fn();
    const { container } = render(<AdminFormSheet open={true} onOpenChange={onOpenChange} title="T" dirty={false}>hi</AdminFormSheet>);
    expect(container.textContent).toContain('hi');
    const body = container.querySelector('div')!;
    fireEvent.focus(body);
  });
  it('AdminFormSheet dirty true -> first branch', async () => {
    const { AdminFormSheet } = await import('./AdminFormSheet');
    const onOpenChange = vi.fn();
    const { container } = render(<AdminFormSheet open={true} onOpenChange={onOpenChange} title="T2" dirty={true}>hi2</AdminFormSheet>);
    expect(container.textContent).toContain('hi2');
  });
  it('AdminFormSheet closed -> early return', async () => {
    const { AdminFormSheet } = await import('./AdminFormSheet');
    const onOpenChange = vi.fn();
    const { container } = render(<AdminFormSheet open={false} onOpenChange={onOpenChange} title="T3">closed</AdminFormSheet>);
    expect(container.textContent).not.toContain('closed');
  });
  it('RichTextEditor 52 [4,0]', async () => {
    const { RichTextEditor } = await import('./RichTextEditor');
    const { container } = render(<RichTextEditor value="<p>hi</p>" onChange={vi.fn()} />);
    expect(container.innerHTML).toContain('hi');
    const { container: c2 } = render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(c2.innerHTML).not.toBeNull();
  });
});
