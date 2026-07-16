import { EntityListScreen } from '../../../src/components/staff/EntityListScreen';
import { clubsConfig } from '../../../src/components/staff/entity-configs';

export default function AdminClubsScreen() {
  return <EntityListScreen config={clubsConfig} returnTo="/staff/admin/clubs" />;
}
