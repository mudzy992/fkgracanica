import { createRef } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaPageFileInputs } from './MediaPageFileInputs';

describe('skriveni odabiri medija', () => {
  it('prosljeđuje sve upload fajlove i omogućava ponovni izbor istog fajla', () => {
    const onUpload = vi.fn();
    const upload = createRef<HTMLInputElement>();
    const replace = createRef<HTMLInputElement>();
    render(<MediaPageFileInputs uploadRef={upload} replaceRef={replace} replaceId={null} onUpload={onUpload} onReplace={() => {}} />);
    const files = [new File(['x'], 'one.jpg', { type: 'image/jpeg' }), new File(['y'], 'two.jpg', { type: 'image/jpeg' })];
    fireEvent.change(upload.current!, { target: { files } });
    expect(onUpload).toHaveBeenCalledWith(files);
    expect(upload.current?.value).toBe('');
    fireEvent.change(upload.current!, { target: { files } });
    expect(onUpload).toHaveBeenCalledTimes(2);
  });
  it('zamjenu prosljeđuje samo uz odabran ID i resetuje input', () => {
    const onReplace = vi.fn();
    const upload = createRef<HTMLInputElement>();
    const replace = createRef<HTMLInputElement>();
    const props = { uploadRef: upload, replaceRef: replace, onUpload: () => {}, onReplace };
    const { rerender } = render(<MediaPageFileInputs {...props} replaceId={null} />);
    const file = new File(['x'], 'one.jpg', { type: 'image/jpeg' });
    fireEvent.change(replace.current!, { target: { files: [file] } });
    expect(onReplace).not.toHaveBeenCalled();
    rerender(<MediaPageFileInputs {...props} replaceId="id" />);
    fireEvent.change(replace.current!, { target: { files: [file] } });
    expect(onReplace).toHaveBeenCalledWith(file);
    expect(replace.current?.value).toBe('');
  });
});
