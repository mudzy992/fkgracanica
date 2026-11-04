import { describe, expect, it } from 'vitest';
import { emptyNewsForm, formToNewsBody } from './news-form-utils';

describe('video polje pri spremanju vijesti', () => {
  it('prazno polje eksplicitno uklanja prethodni video', () => {
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }).videoUrl).toBeNull();
  });
  it('čuva i neizmijenjeni prazni string iz starog zapisa', () => {
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }, '').videoUrl).toBe('');
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }, null).videoUrl).toBeNull();
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: '' }, 'https://legacy.invalid').videoUrl).toBeNull();
  });
  it('ne prepisuje neizmijenjeni legacy URL na klijentu', () => {
    const legacy = ' https://notyoutube.com/watch?v=abc123XYZ01 ';
    expect(formToNewsBody({ ...emptyNewsForm, videoUrl: legacy }).videoUrl).toBe(legacy);
  });
});
