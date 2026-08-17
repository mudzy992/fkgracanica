import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useTicketPaymentReturn } from '../../hooks/use-ticket-payment-return';
import { useSeasonPassPaymentReturn } from '../../hooks/use-season-pass-payment-return';
import { useClearPaymentParams } from '../../hooks/use-clear-payment-params';
import { useAuth } from '../../lib/auth';
import { parsePaymentProvider } from '../../lib/payment-providers';
import { MyTicketsPanel } from '../../components/ticketing/MyTicketsPanel';
import { TicketsReserveForm } from '../../components/ticketing/TicketsReserveForm';
import { SeasonPassPanel } from '../../components/ticketing/SeasonPassPanel';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

type Tab = 'reserve' | 'orders' | 'season';

export function TicketsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const paidReturn = searchParams.get('paid') === '1';
  const cancelled = searchParams.get('cancelled') === '1';
  const sessionId = searchParams.get('session_id') || searchParams.get('token');
  const provider = parsePaymentProvider(searchParams.get('provider'));
  const kind = searchParams.get('kind');
  const isSeason = kind === 'season';
  const { data: config } = useTicketingPublicConfig();
  const [tab, setTab] = useState<Tab>(paidReturn ? (isSeason ? 'season' : 'orders') : 'reserve');

  const ticketReturn = useTicketPaymentReturn({
    paid: paidReturn && !isSeason,
    sessionId,
    provider,
    enabled: isAuthenticated && !isLoading && !isSeason,
  });
  const seasonReturn = useSeasonPassPaymentReturn({
    paid: paidReturn && isSeason,
    sessionId,
    provider,
    enabled: isAuthenticated && !isLoading && isSeason,
  });
  const confirming = ticketReturn.confirming || seasonReturn.confirming;
  const activated = isSeason ? seasonReturn.activated : ticketReturn.activated;
  useClearPaymentParams(!confirming && (activated || !paidReturn || !sessionId));

  if (isLoading || confirming) return <Skeleton className="mx-auto mt-12 h-64 max-w-xl" />;

  const sales = config?.salesModes;

  return (
    <div className="pb-16">
      <Seo title="Ulaznice" description="Rezervacija ulaznica za utakmice FK Gračanica" />
      <PageHeroHeader eyebrow="Stadion" title="Ulaznice" subtitle="Osigurajte svoje mjesto na utakmici." />
      <FormShell
        title="Ulaznice"
        description="Rezervacija i pregled vaših narudžbi."
        layout={isAuthenticated ? 'full' : 'split'}
      >
        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-text-muted">
              Članovi i gosti mogu kupiti ulaznice online ili rezervisati za blagajnu — potrebna je prijava.
            </p>
            <Link to="/prijava" state={{ from: location }}>
              <Button className="w-full">Prijavite se</Button>
            </Link>
          </div>
        ) : !config?.modulesTicketing ? (
          <p className="text-sm text-text-muted">Modul ulaznica trenutno nije aktivan.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Prijavljeni: {user?.email}</p>
            {cancelled && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                Plaćanje je otkazano. Rezervacija je sačuvana — platite iz &quot;Moje narudžbe&quot;.
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant={tab === 'reserve' ? 'default' : 'outline'} onClick={() => setTab('reserve')}>
                Rezervacija
              </Button>
              <Button size="sm" variant={tab === 'orders' ? 'default' : 'outline'} onClick={() => setTab('orders')}>
                Moje narudžbe
              </Button>
              {config?.seasonPassAvailable || tab === 'season' ? (
                <Button size="sm" variant={tab === 'season' ? 'default' : 'outline'} onClick={() => setTab('season')}>
                  Sezona
                </Button>
              ) : null}
            </div>

            {tab === 'reserve' ? (
              <TicketsReserveForm onSuccess={() => setTab('orders')} />
            ) : tab === 'season' ? (
              <SeasonPassPanel
                config={config}
                paymentSuccess={paidReturn && isSeason && activated}
                paymentCancelled={cancelled && isSeason}
              />
            ) : (
              <MyTicketsPanel paymentSuccess={paidReturn && !isSeason && activated} />
            )}

            {tab === 'reserve' && sales?.boxOffice && !sales?.online && (
              <p className="text-xs text-text-muted">Samo rezervacija — plaćanje na blagajni stadiona.</p>
            )}
            {tab === 'reserve' && sales?.online && sales?.boxOffice && (
              <p className="text-xs text-text-muted">
                Plaćanje online ili rezervacija za blagajnu — po izboru.
              </p>
            )}
          </div>
        )}
      </FormShell>
    </div>
  );
}
