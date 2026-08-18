import { RequirePermission } from '../../src/components/RequirePermission';
import { TicketValidateScreen } from '../../src/components/staff/TicketValidateScreen';

export default function UlazScreen() {
  return (
    <RequirePermission anyOf={['admissions.scan', 'ticketing.manage']} returnTo="/staff/ulaz">
      <TicketValidateScreen />
    </RequirePermission>
  );
}
