import { SHOWCASE_ROLES } from './catalog-roles';

describe('SHOWCASE_ROLES', () => {
  it('defines home points for every role', () => {
    const ids = SHOWCASE_ROLES.map((r) => r.id);
    expect(ids).toEqual(['administrator', 'moderator', 'writer', 'komentator', 'clan']);
    for (const role of SHOWCASE_ROLES) {
      expect(role.home.length).toBeGreaterThanOrEqual(3);
    }
  });
});
