import { Download, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import { buildSeasonPassHtml } from '../../lib/season-pass-document';
import type { SeasonPassVisualData } from '../../lib/season-pass-visual';
import { downloadHtml, openPrintHtml } from '../../lib/pass-print';

export function SeasonPassDownloadActions({
  data,
  disabled,
}: {
  data: SeasonPassVisualData;
  disabled?: boolean;
}) {
  const filename = `sezonska-karta-${(data.ticketRef ?? 'pass').toLowerCase()}.html`;
  const build = () => buildSeasonPassHtml(data, `${data.label} — ${data.seasonName}`);

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
