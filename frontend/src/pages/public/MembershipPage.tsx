import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMyMembership } from '../../hooks/use-membership';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useMembershipPaymentReturn } from '../../hooks/use-membership-payment-return';
import { useClearPaymentParams } from '../../hooks/use-clear-payment-params';
import { MemberHomeStrip } from '../../components/membership/MemberHomeStrip';
import { MembershipPurchasePanel } from '../../components/membership/MembershipPurchasePanel';
import { MyTicketsPanel } from '../../components/ticketing/MyTicketsPanel';
import { AccountSectionTabs, type AccountTab } from '../../components/account/AccountSectionTabs';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../lib/auth';
import { parsePaymentProvider } from '../../lib/payment-providers';

export function MembershipPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const paidReturn = searchParams.get('paid') === '1';
  const sessionId = searchParams.get('session_id') || searchParams.get('token');
  const provider = parsePaymentProvider(searchParams.get('provider'));
  const paymentCancelled = searchParams.get('cancelled') === '1';
  const { data: config, isLoading: configLoading } = useTicketingPublicConfig();
  const { data: memberships, isLoading: membershipLoading } = useMyMembership();
  const [tab, setTab] = useState<AccountTab>('membership');

  const { confirming, activated } = useMembershipPaymentReturn({
    paid: paidReturn,
    sessionId,
    provider,
    enabled: isAuthenticated && !authLoading,
  });
  useClearPaymentParams(!confirming && (activated || !paidReturn || !sessionId));

  if (authLoading || configLoading || (isAuthenticated && membershipLoading) || confirming) {
    return <Skeleton className="mx-auto mt-12 h-64 max-w-xl" />;
  }

  const accountMode = isAuthenticated;
  const showTickets = accountMode && config?.modulesTicketing !== false;

  return (
    <div className="pb-16">
      <Seo title={accountMode ? 'Moj račun' : 'Članstvo'} />
      <PageHeroHeader
        eyebrow="Zajednica"
        title={accountMode ? 'Moj račun' : 'Članstvo'}
        subtitle={
          accountMode
            ? 'Članstvo, ulaznice i pregled vaših narudžbi.'
            : 'Pridružite se klubu i podržite FK Gračanica kao registrirani član.'
        }
      />
      <FormShell
        layout={accountMode ? 'full' : 'split'}
        title={accountMode ? 'Moj račun' : 'Postani član'}
        description={
          accountMode
            ? 'Pregledajte člansku karticu i kupljene ulaznice.'
            : 'Ekskluzivne pogodnosti za članove kluba.'
        }
      >
        {accountMode && <MemberHomeStrip />}
        {accountMode && (
          <AccountSectionTabs active={tab} onChange={setTab} showTickets={showTickets} />
        )}

        <div className={accountMode ? 'mt-6' : ''}>
          {(!accountMode || tab === 'membership') && (
            <MembershipPurchasePanel
              config={config}
              memberships={memberships}
              confirmingPayment={confirming}
              paymentCancelled={paymentCancelled}
              paymentSuccess={paidReturn && activated}
            />
          )}
          {accountMode && tab === 'tickets' && showTickets && (
            <MyTicketsPanel paymentSuccess={false} />
          )}
        </div>
      </FormShell>
    </div>
  );
}
