import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaUploadZone } from './MediaUploadZone';

describe('responzivna upload zona', () => {
  it('prihvata drop u odabranoj mapi i klik otvara izbor', () => {
    const onFiles = vi.fn();
    const onTrigger = vi.fn();
    const file = new File(['x'], 'image.jpg', { type: 'image/jpeg' });
    render(<MediaUploadZone folderId="folder" onFiles={onFiles} onTrigger={onTrigger} />);
    const button = screen.getByRole('button', { name: 'Dodaj slike (galerija ili kamera)' });
    fireEvent.click(button);
    fireEvent.drop(button, { dataTransfer: { files: [file] } });
    expect(onTrigger).toHaveBeenCalledOnce();
    expect(onFiles).toHaveBeenCalledWith([file]);
  });
  it('bez mape ili dok je zona eksplicitno zaključana ne šalje drop', () => {
    const onFiles = vi.fn();
    const { rerender } = render(<MediaUploadZone onFiles={onFiles} onTrigger={() => {}} />);
    const button = screen.getByRole('button', { name: 'Prvo odaberite mapu' });
    expect(button).toBeDisabled();
    fireEvent.drop(button, { dataTransfer: { files: [new File(['x'], 'x.jpg')] } });
    rerender(<MediaUploadZone folderId="folder" disabled onFiles={onFiles} onTrigger={() => {}} />);
    fireEvent.drop(button, { dataTransfer: { files: [new File(['x'], 'x.jpg')] } });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
