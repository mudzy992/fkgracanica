import { EntityListScreen } from '../../../src/components/staff/EntityListScreen';
import { hallOfFameConfig } from '../../../src/components/staff/entity-configs';

export default function AdminHallOfFameScreen() {
  return <EntityListScreen config={hallOfFameConfig} returnTo="/staff/admin/hall-of-fame" />;
}
