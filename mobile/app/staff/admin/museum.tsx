import { EntityListScreen } from '../../../src/components/staff/EntityListScreen';
import { museumConfig } from '../../../src/components/staff/entity-configs';

export default function AdminMuseumScreen() {
  return <EntityListScreen config={museumConfig} returnTo="/staff/admin/museum" />;
}
