import { afterEach, describe, expect, it } from 'vitest';
import { mediaOwnerMatches } from './media-upload-session';

afterEach(() => { localStorage.clear(); });
describe('vlasnik medijskog reda', () => {
  it('prihvata samo aktivnu sesiju istog korisnika', () => {
    localStorage.setItem('fk_user', JSON.stringify({ id: 'owner' }));
    expect(mediaOwnerMatches('owner')).toBe(false);
    localStorage.setItem('fk_access_token', 'synthetic-token');
    expect(mediaOwnerMatches('owner')).toBe(true);
    expect(mediaOwnerMatches('other')).toBe(false);
    expect(mediaOwnerMatches('')).toBe(false);
  });
  it('ne vjeruje neispravnom ili odsutnom profilu', () => {
    localStorage.setItem('fk_access_token', 'synthetic-token');
    localStorage.setItem('fk_user', '{');
    expect(mediaOwnerMatches('owner')).toBe(false);
    localStorage.removeItem('fk_user');
    expect(mediaOwnerMatches('owner')).toBe(false);
  });
});
