import { EntityListScreen } from '../../../src/components/staff/EntityListScreen';
import { timelineConfig } from '../../../src/components/staff/entity-configs';

export default function AdminClubTimelineScreen() {
  return <EntityListScreen config={timelineConfig} returnTo="/staff/admin/club-timeline" />;
}
