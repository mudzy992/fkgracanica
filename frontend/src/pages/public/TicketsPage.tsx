import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useMyTicketOrders, useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useTicketPaymentReturn } from '../../hooks/use-ticket-payment-return';
import { useAuth } from '../../lib/auth';
import { TicketOrderCard } from '../../components/ticketing/TicketOrderCard';
import { TicketsReserveForm } from '../../components/ticketing/TicketsReserveForm';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

type Tab = 'reserve' | 'orders';

export function TicketsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const paidReturn = searchParams.get('paid') === '1';
  const sessionId = searchParams.get('session_id');
  const { data: orders, isLoading: ol } = useMyTicketOrders();
  const { data: config } = useTicketingPublicConfig();
  const [tab, setTab] = useState<Tab>(paidReturn ? 'orders' : 'reserve');

  const { confirming, activated } = useTicketPaymentReturn({
    paid: paidReturn,
    sessionId,
    enabled: isAuthenticated && !isLoading,
  });

  if (isLoading || confirming) return <Skeleton className="mx-auto mt-12 h-64 max-w-xl" />;

  const sales = config?.salesModes;
  const showPaymentSuccess = paidReturn && activated;

  return (
    <div className="pb-16">
      <Seo title="Ulaznice" description="Rezervacija ulaznica za utakmice FK Gračanica" />
      <PageHeroHeader eyebrow="Stadion" title="Ulaznice" subtitle="Osigurajte svoje mjesto na utakmici." />
      <FormShell title="Ulaznice" description="Rezervacija i pregled vaših narudžbi.">
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
            <div className="flex gap-2">
              <Button size="sm" variant={tab === 'reserve' ? 'default' : 'outline'} onClick={() => setTab('reserve')}>
                Rezervacija
              </Button>
              <Button size="sm" variant={tab === 'orders' ? 'default' : 'outline'} onClick={() => setTab('orders')}>
                Moje narudžbe
              </Button>
            </div>

            {tab === 'reserve' ? (
              <TicketsReserveForm onSuccess={() => setTab('orders')} />
            ) : ol ? (
              <Skeleton className="h-32 w-full" />
            ) : orders?.length ? (
              <div className="space-y-6">
                {showPaymentSuccess && (
                  <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                    Uplata je uspješna. Vaše ulaznice su aktivirane — pokažite QR kod na ulazu.
                  </p>
                )}
                {orders.map((o) => (
                  <TicketOrderCard key={o.id} order={o} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Nemate narudžbi ulaznica.</p>
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
