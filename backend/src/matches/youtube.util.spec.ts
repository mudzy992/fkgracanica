import { parseYouTubeId, parseYouTubeStart } from './youtube.util';

describe('youtube.util', () => {
  it('parses watch, short and embed urls', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123XYZ01')).toBe(
      'abc123XYZ01',
    );
    expect(parseYouTubeId('https://youtu.be/abc123XYZ01')).toBe('abc123XYZ01');
    expect(parseYouTubeId('https://www.youtube.com/embed/abc123XYZ01')).toBe(
      'abc123XYZ01',
    );
  });

  it('parses start seconds', () => {
    expect(parseYouTubeStart('https://youtu.be/abc123XYZ01?t=75')).toBe(75);
    expect(
      parseYouTubeStart('https://www.youtube.com/watch?v=abc123XYZ01&start=12'),
    ).toBe(12);
  });
});
