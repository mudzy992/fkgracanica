import { isImageMime, toPublicUrl, variantPath } from './upload.util';

describe('upload.util', () => {
  it('detects image mime types', () => {
    expect(isImageMime('image/jpeg')).toBe(true);
    expect(isImageMime('image/svg+xml')).toBe(false);
    expect(isImageMime('application/pdf')).toBe(false);
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
