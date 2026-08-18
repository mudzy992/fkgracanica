import { RequirePermission } from '../../../src/components/RequirePermission';
import { TicketValidateScreen } from '../../../src/components/staff/TicketValidateScreen';

export default function AdminValidateScreen() {
  return (
    <RequirePermission anyOf={['admissions.scan', 'ticketing.manage']} returnTo="/staff/admin/validate">
      <TicketValidateScreen />
    </RequirePermission>
  );
}
