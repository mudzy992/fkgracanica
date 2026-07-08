import { Mail, MapPin, Phone } from 'lucide-react';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { Reveal } from '../../../lib/motion/Reveal';

interface Props {
  email?: string;
  phone?: string;
  address?: string;
}

function InfoTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-medium text-text">{value}</span>
      </span>
    </>
  );

  const className =
    'border-gradient-club glass-premium flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:border-primary/30';

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}

export function ContactInfoAside({ email, phone, address }: Props) {
  const items = [
    email && { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
    phone && { icon: Phone, label: 'Telefon', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
    address && { icon: MapPin, label: 'Adresa', value: address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <Reveal>
      <NewsSectionTitle>Informacije</NewsSectionTitle>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">
          Kontakt podaci nisu objavljeni. Pošaljite poruku putem forme.
        </p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <InfoTile {...item} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm leading-relaxed text-text-muted">
        Imate pitanje, prijedlog ili želite suradnju? Popunite formu — javit ćemo se čim prije.
      </p>
    </Reveal>
  );
}
