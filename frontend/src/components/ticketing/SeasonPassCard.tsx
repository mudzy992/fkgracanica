import { usePublicSettings } from '../../hooks';
import type { SeasonPassVisualData } from '../../lib/season-pass-visual';
import { SeasonPassDownloadActions } from './SeasonPassDownloadActions';
import { SeasonPassVisual } from './SeasonPassVisual';

interface PassRow {
  id: string;
  status: string;
  label: string;
  price: string;
  qrCode: string;
  season?: { name: string };
}

export function SeasonPassCard({ pass }: { pass: PassRow }) {
  const { data: settings } = usePublicSettings();
  const cancelled = pass.status === 'CANCELLED' || pass.status === 'REFUNDED';
  const data: SeasonPassVisualData = {
    clubName: settings?.['club.name'] ?? 'FK Gračanica',
    crestUrl: settings?.['club.crestUrl'],
    label: pass.label,
    seasonName: pass.season?.name ?? 'Sezona',
    price: String(pass.price),
    status: pass.status,
    qrValue: pass.status === 'ACTIVE' ? pass.qrCode : undefined,
    ticketRef: pass.id.slice(-8).toUpperCase(),
    cancelled,
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-subtle)] bg-surface/20 p-4 lg:flex-row lg:items-start">
      <SeasonPassVisual data={data} />
      <div className="flex min-w-[150px] flex-col gap-2 lg:pt-2">
        {data.qrValue && <SeasonPassDownloadActions data={data} />}
      </div>
    </div>
  );
}
