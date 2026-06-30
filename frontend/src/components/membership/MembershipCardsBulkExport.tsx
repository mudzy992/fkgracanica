import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { usePublicSettings } from '../../hooks';
import { formatDate } from '../../lib/utils';
import { membershipUserName } from '../../lib/membership-status';
import {
  buildMembershipCardsHtml,
  type MembershipCardPrintData,
} from '../../lib/membership-card-document';
import { mediaUrl } from '../../lib/media';
import { downloadHtml, openPrintHtml } from '../../lib/pass-print';
import type { MembershipRow } from '../../types/membership';
import { Button } from '../ui/button';

interface Props {
  memberships: MembershipRow[];
  disabled?: boolean;
}

export function MembershipCardsBulkExport({ memberships, disabled }: Props) {
  const { data: settings } = usePublicSettings();
  const [busy, setBusy] = useState(false);
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';
  const crestUrl = settings?.['club.crestUrl'];

  const toPrintData = (): MembershipCardPrintData[] =>
    memberships
      .filter((m) => m.card?.qrCode)
      .map((m) => ({
        memberName: membershipUserName(m.user),
        clubName,
        crestUrl: crestUrl ? mediaUrl(crestUrl, 'thumb') : undefined,
        cardNumber: m.card!.cardNumber,
        status: m.status,
        validUntil: m.endDate ? formatDate(m.endDate) : '—',
        qrValue: m.card!.qrCode,
      }));

  const run = async (mode: 'print' | 'download') => {
    const cards = toPrintData();
    if (!cards.length) return;
    setBusy(true);
    try {
      const html = await buildMembershipCardsHtml(cards, `Članske kartice — ${clubName}`);
      if (mode === 'print') openPrintHtml(html);
      else downloadHtml(`clanske-kartice-${Date.now()}.html`, html);
    } finally {
      setBusy(false);
    }
  };

  const count = toPrintData().length;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || busy || !count}
        onClick={() => void run('print')}
      >
        <Printer className="mr-1.5 h-4 w-4" />
        Print kartice ({count})
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || busy || !count}
        onClick={() => void run('download')}
      >
        <Download className="mr-1.5 h-4 w-4" />
        HTML export ({count})
      </Button>
    </div>
  );
}
