import { MediaPicker } from '../../../components/admin/MediaPicker';
import { usePublicSettings } from '../../../hooks';
import { SportEventTicket } from '../../../components/ticketing/SportEventTicket';
import { sampleTicketPreviewData } from '../../../components/ticketing/TicketDigitalPass';

interface Props {
  value: string;
  onChange: (path: string) => void;
}

export function TicketingCardBackgroundField({ value, onChange }: Props) {
  const { data: settings } = usePublicSettings();
  const clubName = settings?.['club.name'] ?? 'FK Gračanica';
  const crestUrl = settings?.['club.crestUrl'];
  const preview = sampleTicketPreviewData(clubName, crestUrl, value || undefined);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] p-4">
      <MediaPicker
        label="Pozadina ulaznice (backdrop)"
        value={value || null}
        onChange={onChange}
      />
      <p className="text-xs text-text-muted">
        Slika iz medija kao pozadina glavnog dijela ulaznice. Preporuka: stadion, navijači ili grafika utakmice
        (landscape, min. 1200×800 px).
      </p>
      <div>
        <p className="mb-2 text-xs font-medium text-text-muted">Pregled</p>
        <SportEventTicket
          data={{
            ...preview,
            qrValue: undefined,
            status: 'PAID_AT_BOX_OFFICE',
          }}
        />
      </div>
    </div>
  );
}
