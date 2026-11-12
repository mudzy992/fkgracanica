import { buttonVariants } from "../ui/button-variants";
import { Link } from 'react-router-dom';
import { useNextHomeMatch, useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { cn, formatDateTime } from '../../lib/utils';
import { Reveal } from '../../lib/motion/Reveal';
;
import { Skeleton } from '../ui/skeleton';

interface Props {
  title?: string;
  text?: string;
  buttonLabel?: string;
}

export function HomeNextMatchTicketsBanner({ title, text, buttonLabel }: Props) {
  const { data: config } = useTicketingPublicConfig();
  const { data: match, isLoading } = useNextHomeMatch();

  if (!config?.modulesTicketing) return null;
  const sales = config.salesModes;
  if (!sales?.boxOffice && !sales?.online) return null;
  if (isLoading) return <Skeleton className="mx-auto h-32 max-w-6xl rounded-2xl" />;
  if (!match) return null;

  const opponent = match.awayClub?.name ?? 'gost';
  const defaultTitle = title ?? 'Ulaznice za sljedeću utakmicu';
  const defaultText =
    text ??
    `${match.homeClub?.name ?? 'FK Gračanica'} vs ${opponent} · ${formatDateTime(match.scheduledAt)}`;
  const label = buttonLabel ?? 'Kupi ulaznice';

  return (
    <section className="bg-surface/80 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="glass-card flex flex-col items-start gap-6 rounded-2xl border border-[var(--border-subtle)] p-8 shadow-premium sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text sm:text-3xl">{defaultTitle}</h2>
              <p className="mt-2 max-w-lg text-text-muted">{defaultText}</p>
            </div>
            <Link to={`/ulaznice?matchId=${match.id}`} className={cn(buttonVariants({size: "lg"}))}>{label}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
