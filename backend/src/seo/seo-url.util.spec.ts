import {
  absolutePageUrl,
  apiPublicBase,
  escapeXml,
  mediaPublicUrl,
  normalizeSharePath,
  sitePublicUrl,
  stripHtml,
  truncateMeta,
} from './seo-url.util';

const API = 'https://api.fkgracanica.ba';

describe('seo-url.util (BE-08 / P-B08-1, P-B08-4)', () => {
  it('sitePublicUrl koristi proslijeđeni API URL i skida /api/v1', () => {
    expect(sitePublicUrl(API)).toBe(API);
    expect(sitePublicUrl(`${API}/api/v1`)).toBe(API);
    expect(sitePublicUrl(`${API}/backend`)).toBe(API);
  });

  it('sitePublicUrl bez argumenta daje lokalni fallback', () => {
    expect(sitePublicUrl()).toBe('http://localhost:3000');
    expect(sitePublicUrl('  ')).toBe('http://localhost:3000');
  });

  it('apiPublicBase skida završnu kosu crtu i /api/v1', () => {
    expect(apiPublicBase(`${API}/`)).toBe(API);
    expect(apiPublicBase(`${API}/api/v1`)).toBe(API);
    expect(apiPublicBase(undefined)).toBe('http://localhost:3000');
  });

  it('normalizeSharePath odbija apsolutne i protokol-relativne URL-ove', () => {
    expect(normalizeSharePath('https://evil.example/x')).toBe('/');
    expect(normalizeSharePath('//evil.example')).toBe('/');
    expect(normalizeSharePath('javascript:alert(1)')).toBe('/');
    expect(normalizeSharePath('')).toBe('/');
    expect(normalizeSharePath(undefined)).toBe('/');
  });

  it('normalizeSharePath čisti query/hash i dodaje početnu kosu crtu', () => {
    expect(normalizeSharePath('/vijesti/abc?x=1')).toBe('/vijesti/abc');
    expect(normalizeSharePath('vijesti/abc')).toBe('/vijesti/abc');
    expect(normalizeSharePath('/o-klubu#top')).toBe('/o-klubu');
  });

  it('normalizeSharePath ne prihvata ne-string (query niz)', () => {
    expect(normalizeSharePath(['a', 'b'])).toBe('/');
    expect(normalizeSharePath(42)).toBe('/');
  });

  it('absolutePageUrl spaja bazni URL i relativnu putanju', () => {
    expect(absolutePageUrl('/vijesti/x', API)).toBe(`${API}/vijesti/x`);
    expect(absolutePageUrl('vijesti/x', API)).toBe(`${API}/vijesti/x`);
  });

  it('absolutePageUrl vraća već apsolutni URL bez izmjene', () => {
    expect(absolutePageUrl('https://example.com/a', API)).toBe(
      'https://example.com/a',
    );
  });

  it('mediaPublicUrl mapira originals → medium/thumb webp', () => {
    expect(mediaPublicUrl('originals/a/b.jpg', 'medium', API)).toBe(
      `${API}/api/v1/uploads/files/medium/a/b.webp`,
    );
    expect(mediaPublicUrl('originals/a/b.jpg', 'thumb', API)).toBe(
      `${API}/api/v1/uploads/files/thumbs/a/b.webp`,
    );
    expect(mediaPublicUrl('uploads/medium/a.webp', 'medium', API)).toBe(
      `${API}/api/v1/uploads/files/medium/a.webp`,
    );
  });

  it('mediaPublicUrl vraća undefined za prazno i propušta https URL', () => {
    expect(mediaPublicUrl(null, 'medium', API)).toBeUndefined();
    expect(mediaPublicUrl('https://cdn/x.png', 'medium', API)).toBe(
      'https://cdn/x.png',
    );
  });

  it('mediaPublicUrl ne duplira /api/v1 iz konfiguracije', () => {
    expect(mediaPublicUrl('medium/a.webp', 'medium', `${API}/api/v1`)).toBe(
      `${API}/api/v1/uploads/files/medium/a.webp`,
    );
  });

  it('escapeXml escapea sve XML-specifične znakove', () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&apos;f');
    expect(escapeXml('&amp;')).toBe('&amp;amp;');
  });

  it('stripHtml i truncateMeta skraćuju meta opis', () => {
    expect(stripHtml('<p>Hello   <b>world</b></p>')).toBe('Hello world');
    expect(stripHtml(null)).toBe('');
    const long = 'x'.repeat(200);
    expect(truncateMeta(long).length).toBe(160);
    expect(truncateMeta('kratko')).toBe('kratko');
  });
});
