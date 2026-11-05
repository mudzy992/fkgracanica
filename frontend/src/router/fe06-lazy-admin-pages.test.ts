import { describe, expect, it } from 'vitest';
import * as lazyPages from './lazy-admin-pages';

const LAZY = Symbol.for('react.lazy');

describe('lazy-admin-pages', () => {
  it('izvozi sve admin stranice kao React.lazy komponente', () => {
    const names = Object.keys(lazyPages).sort();
    expect(names).toEqual([
      'ClubHubPage',
      'CmsHubPage',
      'CmsPageBuilderPage',
      'GalleryEditorPage',
      'MembershipAdminPage',
      'NewsEditorPage',
      'SeasonHubPage',
      'TicketingAdminPage',
    ]);
    for (const name of names) {
      const component = lazyPages[name as keyof typeof lazyPages] as unknown as {
        $$typeof?: symbol;
      };
      expect(component.$$typeof).toBe(LAZY);
    }
  });

  it('svaka komponenta ima vlastiti lazy zapis', () => {
    const payloads = new Set(
      Object.values(lazyPages).map(
        (component) => (component as unknown as { _payload: unknown })._payload,
      ),
    );
    expect(payloads.size).toBe(Object.values(lazyPages).length);
  });
});
