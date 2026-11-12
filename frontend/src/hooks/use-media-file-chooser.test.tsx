import { createRef } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMediaFileChooser } from './use-media-file-chooser';

const files = [new File(['x'], 'selected.jpg', { type: 'image/jpeg' })] as unknown as FileList;
describe('odabir medijskih fajlova', () => {
  it('veže mapu za trenutak otvaranja odabira čak i ako se trenutna mapa promijeni', () => {
    const input = createRef<HTMLInputElement>();
    const element = document.createElement('input');
    Object.defineProperty(input, 'current', { value: element });
    const click = vi.spyOn(element, 'click');
    const enqueue = vi.fn();
    const { result, rerender } = renderHook(
      ({ folder, name }: { folder: string | undefined; name: string | undefined }) => useMediaFileChooser(input, folder, name, enqueue),
      { initialProps: { folder: 'a', name: 'Fotografije' } },
    );
    act(() => { result.current.choose(); });
    expect(click).toHaveBeenCalledOnce();
    rerender({ folder: 'b', name: 'Arhiva' });
    act(() => { result.current.onUpload(files); });
    expect(enqueue).toHaveBeenCalledWith(files, 'a', 'Fotografije');
    act(() => { result.current.choose(); result.current.onUpload(files); });
    expect(enqueue).toHaveBeenLastCalledWith(files, 'b', 'Arhiva');
  });

  it('neočekivan izbor bez mape prosljeđuje na vidljivo odbijanje umjesto tihog gubitka', () => {
    const enqueue = vi.fn();
    const input = createRef<HTMLInputElement>();
    const { result } = renderHook(() => useMediaFileChooser(input, undefined, undefined, enqueue));
    act(() => { result.current.choose(); result.current.onUpload(files); });
    expect(enqueue).toHaveBeenCalledWith(files, '', undefined);
  });
});
