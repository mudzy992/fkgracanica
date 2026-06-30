import { usePublicSettings } from '../../hooks';
import { useAuth } from '../../lib/auth';
import { membershipUserName } from '../../lib/membership-status';
import type { MembershipRow } from '../../types/membership';
import {
  MembershipDigitalCard,
  toMembershipCardData,
} from './MembershipDigitalCard';
import { MembershipCardDownloadActions } from './MembershipCardDownloadActions';

interface Props {
  membership: MembershipRow;
}

export function MembershipCardPanel({ membership }: Props) {
  const { user } = useAuth();
  const { data: settings } = usePublicSettings();
  const card = membership.card;
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';
  const crestUrl = settings?.['club.crestUrl'];
  const memberName = membershipUserName(membership.user ?? user ?? undefined);

  if (!card) return null;

  const cardData = toMembershipCardData({
    memberName,
    clubName,
    crestUrl,
    cardNumber: card.cardNumber,
    status: membership.status,
    endDate: membership.endDate,
    qrCode: card.qrCode,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-start">
        <MembershipDigitalCard data={cardData} />
        <div className="flex flex-col gap-3 lg:pt-4">
          <MembershipCardDownloadActions data={cardData} />
          <p className="max-w-xs text-sm text-text-muted">
            Pokažite QR kod na ulazu. Klik na QR ga povećava. Print ili HTML za offline prikaz.
          </p>
        </div>
      </div>
    </div>
  );
}
