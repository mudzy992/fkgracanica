import { mediaUrl } from '../../lib/media';
import { formatDate } from '../../lib/utils';
import {
  membershipStatusLabel,
  membershipStatusVariant,
} from '../../lib/membership-status';
import type { MembershipCardPrintData } from '../../lib/membership-card-document';
import { Badge } from '../ui/badge';
import { PassQrCode } from '../pass/PassQrCode';

interface Props {
  data: MembershipCardPrintData;
}

export function MembershipDigitalCard({ data }: Props) {
  const crest = data.crestUrl ? mediaUrl(data.crestUrl, 'thumb') : undefined;
  const statusVariant = membershipStatusVariant(data.status as never);

  return (
    <div
      className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-primary/25 shadow-lg"
      style={{ aspectRatio: '1.586 / 1' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-surface" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/5" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/10 px-4 py-2.5">
          {crest ? (
            <img src={crest} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              FK
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Članska kartica</p>
            <p className="truncate text-sm font-bold text-text">{data.clubName}</p>
          </div>
          <Badge variant={statusVariant} className="shrink-0 text-[10px]">
            {membershipStatusLabel(data.status as never)}
          </Badge>
        </div>

        <div className="flex flex-1 items-end justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-text-muted">Član</p>
            <p className="truncate font-display text-lg font-bold leading-tight text-text">{data.memberName}</p>
            <dl className="mt-2 space-y-0.5 text-[11px]">
              <div className="flex gap-1">
                <dt className="text-text-muted">Broj:</dt>
                <dd className="font-mono font-medium text-text">{data.cardNumber}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-text-muted">Važi do:</dt>
                <dd className="font-medium text-text">{data.validUntil}</dd>
              </div>
            </dl>
          </div>
          {data.qrValue && (
            <PassQrCode value={data.qrValue} size={64} label="QR članske kartice" className="shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}

export function toMembershipCardData(
  input: {
    memberName: string;
    clubName: string;
    crestUrl?: string;
    cardNumber: string;
    status: string;
    endDate?: string | null;
    qrCode: string;
  },
): MembershipCardPrintData {
  return {
    memberName: input.memberName,
    clubName: input.clubName,
    crestUrl: input.crestUrl ? mediaUrl(input.crestUrl, 'thumb') : undefined,
    cardNumber: input.cardNumber,
    status: input.status,
    validUntil: input.endDate ? formatDate(input.endDate) : '—',
    qrValue: input.qrCode,
  };
}
