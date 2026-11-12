import { isImageMime, toPublicUrl, variantPath } from './upload.util';

describe('upload.util', () => {
  it('detects image mime types', () => {
    expect(isImageMime('image/jpeg')).toBe(true);
    expect(isImageMime('image/svg+xml')).toBe(false);
    expect(isImageMime('application/pdf')).toBe(false);
  });

  it('BE-09b/P-B09b-11: allowlist tačnih tipova (case/space tolerantno)', () => {
    expect(isImageMime('IMAGE/PNG')).toBe(true);
    expect(isImageMime(' image/webp ')).toBe(true);
    expect(isImageMime('image/gif')).toBe(true);
    expect(isImageMime('image/avif')).toBe(true);
    expect(isImageMime('image/tiff')).toBe(false);
    expect(isImageMime('image/x-icon')).toBe(false);
    expect(isImageMime('text/html')).toBe(false);
  });

  it('builds public url', () => {
    expect(toPublicUrl('originals/abc.jpg')).toBe(
      '/api/v1/uploads/files/originals/abc.jpg',
    );
  });

  it('maps variant paths', () => {
    expect(variantPath('originals/abc.jpg', 'thumb')).toBe('thumbs/abc.webp');
    expect(variantPath('originals/abc.jpg', 'medium')).toBe('medium/abc.webp');
  });
});
