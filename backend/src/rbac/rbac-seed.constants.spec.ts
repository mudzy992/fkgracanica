import { ALL_PERMISSION_KEYS } from '../common/constants/permissions';
import { ROLES, ROLE_PERMISSIONS } from './rbac-seed.constants';

/**
 * BE-09c/P-B09c-5: seed je prije tiho odbacivao nepoznate ključeve dozvola
 * (`.filter(Boolean)`), pa je litera greška ostavljala rolu bez dozvole bez
 * ijedne poruke. Sada je to greška koju hvata ovaj test.
 */
describe('RBAC seed definicija (BE-09c / P-B09c-5)', () => {
  const known = new Set(ALL_PERMISSION_KEYS);

  it('svaki ključ u ROLE_PERMISSIONS postoji u PERMISSIONS', () => {
    const unknown = Object.values(ROLE_PERMISSIONS)
      .flat()
      .filter((key) => !known.has(key));

    expect(unknown).toEqual([]);
  });

  it('svaka rola iz ROLES ima definisane dozvole (i obrnuto)', () => {
    const roleNames = ROLES.map((r) => r.name).sort();
    const defined = Object.keys(ROLE_PERMISSIONS).sort();

    expect(defined).toEqual(roleNames);
  });

  it('Administrator ima sve dozvole, Član nijednu', () => {
    expect(new Set(ROLE_PERMISSIONS.Administrator)).toEqual(known);
    expect(ROLE_PERMISSIONS['Član']).toEqual([]);
  });

  it('nema duplikata dozvola unutar role', () => {
    for (const [role, keys] of Object.entries(ROLE_PERMISSIONS)) {
      expect({ role, unique: new Set(keys).size === keys.length }).toEqual({
        role,
        unique: true,
      });
    }
  });
});
