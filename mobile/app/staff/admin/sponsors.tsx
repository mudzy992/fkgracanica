import { EntityListScreen } from '../../../src/components/staff/EntityListScreen';
import { sponsorsConfig } from '../../../src/components/staff/entity-configs';

export default function AdminSponsorsScreen() {
  return (
    <EntityListScreen
      config={sponsorsConfig}
      returnTo="/staff/admin/sponsors"
    />
  );
}
