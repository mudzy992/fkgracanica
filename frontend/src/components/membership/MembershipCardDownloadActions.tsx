import { Download, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import {
  buildMembershipCardsHtml,
  type MembershipCardPrintData,
} from '../../lib/membership-card-document';
import { downloadHtml, openPrintHtml } from '../../lib/pass-print';

interface Props {
  data: MembershipCardPrintData;
  disabled?: boolean;
}

export function MembershipCardDownloadActions({ data, disabled }: Props) {
  const filename = `clanska-kartica-${data.cardNumber.replace(/\s+/g, '-')}.html`;

  const build = () => buildMembershipCardsHtml([data], `Članska kartica — ${data.memberName}`);

  const onPrint = async () => {
    const html = await build();
    openPrintHtml(html);
  };

  const onDownload = async () => {
    const html = await build();
    downloadHtml(filename, html);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => void onPrint()}>
        <Printer className="mr-1.5 h-4 w-4" />
        Print
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => void onDownload()}>
        <Download className="mr-1.5 h-4 w-4" />
        Preuzmi HTML
      </Button>
    </div>
  );
}
