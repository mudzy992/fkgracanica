import { Building2, MapPin, Users } from 'lucide-react';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import type { Stadium } from '../../../types/club-hub';

interface Props {
  stadium: Stadium;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-primary-light" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

export function ClubInfoSection({ stadium }: Props) {
  return (
    <section>
      <NewsSectionTitle>Stadion</NewsSectionTitle>
      <div className="border-gradient-club glass-premium rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={Building2} label="Naziv" value={stadium.name} />
          {stadium.city && <InfoRow icon={MapPin} label="Grad" value={stadium.city} />}
          {stadium.address && <InfoRow icon={MapPin} label="Adresa" value={stadium.address} />}
          {stadium.capacity != null && (
            <InfoRow icon={Users} label="Kapacitet" value={String(stadium.capacity)} />
          )}
        </div>
        {stadium.description && (
          <p className="mt-6 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/80">
            {stadium.description}
          </p>
        )}
      </div>
    </section>
  );
}
