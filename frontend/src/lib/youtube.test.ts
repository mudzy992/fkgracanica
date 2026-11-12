import { describe, expect, it } from 'vitest';
import { parseYouTubeId } from './youtube';

const id = 'abc123XYZ01';
const valid = [
  `https://www.youtube.com/watch?v=${id}`,
  `http://youtube.com/watch?v=${id}&start=42`,
  `https://m.youtube.com/watch?v=${id}&feature=share`,
  `https://music.youtube.com/watch/?v=${id}`,
  `https://youtu.be/${id}?si=testing`,
  `https://www.youtu.be/${id}`,
  `https://youtube.com/embed/${id}`,
  `https://youtube.com/live/${id}`,
  `https://youtube.com/shorts/${id}`,
];
const invalid = [
  'nije URL',
  `ftp://youtube.com/watch?v=${id}`,
  `https://youtube.com.example.invalid/watch?v=${id}`,
  `https://notyoutube.com/watch?v=${id}`,
  `https://.youtube.com/watch?v=${id}`,
  `https://x..youtube.com/watch?v=${id}`,
  `https://youtu.be.example.invalid/${id}`,
  `https://youtube.com@evil.invalid/watch?v=${id}`,
  `https://user:pass@youtube.com/watch?v=${id}`,
  `https://youtube.com/redirect?v=${id}`,
  `https://youtu.be/${id}/extra`,
  'https://youtube.com/watch?v=',
  'https://youtube.com/live/',
  'https://youtu.be/',
  'https://youtube.com/watch?v=short',
  'https://youtube.com/watch?v=abc123XYZ012',
  'https://youtube.com/watch?v=abc123XYZ0%2F',
  'https://youtube.com/watch?v=abc123XYZ01%0A',
  'https://youtube.com/watch?v=..%2F..%2Fredirect%3Fq%3Dhttps%3A%2F%2Fexample.invalid',
];

describe('YouTube URL: sigurna domena, oblik i ID', () => {
  it.each(valid)('prihvata valjani link %s', (url) => {
    expect(parseYouTubeId(url)).toBe(id);
  });
  it.each(invalid)('odbija neispravan ili lažni link %s', (url) => {
    expect(parseYouTubeId(url)).toBeNull();
  });
  it('prihvata i URL-safe znakove unutar tačno 11 znakova', () => {
    expect(parseYouTubeId(' https://YOUTUBE.COM/watch?v=Ab_-1234xyz ')).toBe('Ab_-1234xyz');
  });
});
