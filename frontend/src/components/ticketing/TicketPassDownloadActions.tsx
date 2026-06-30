import { Download, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import { buildTicketPassesHtml, type TicketPassPrintData } from '../../lib/ticket-pass-document';
import { downloadHtml, openPrintHtml } from '../../lib/pass-print';

interface Props {
  data: TicketPassPrintData;
  disabled?: boolean;
}

export function TicketPassDownloadActions({ data, disabled }: Props) {
  const safeName = data.matchTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 40);
  const filename = `ulaznica-${safeName || 'utakmica'}.html`;

  const build = () => buildTicketPassesHtml([data], `Ulaznica — ${data.matchTitle}`);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => void build().then((html) => openPrintHtml(html))}
      >
        <Printer className="mr-1.5 h-4 w-4" />
        Print
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => void build().then((html) => downloadHtml(filename, html))}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Preuzmi HTML
      </Button>
    </div>
  );
}
