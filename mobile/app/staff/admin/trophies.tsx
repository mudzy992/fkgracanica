import { EntityListScreen } from '../../../src/components/staff/EntityListScreen';
import { trophiesConfig } from '../../../src/components/staff/entity-configs';

export default function AdminTrophiesScreen() {
  return <EntityListScreen config={trophiesConfig} returnTo="/staff/admin/trophies" />;
}
