import { useSearchParams } from 'react-router-dom';
import { useMyMembership } from '../../hooks/use-membership';
import { useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useMembershipPaymentReturn } from '../../hooks/use-membership-payment-return';
import { MembershipPurchasePanel } from '../../components/membership/MembershipPurchasePanel';
import { FormShell } from '../../components/public/forms/FormShell';
import { PageHeroHeader } from '../../components/public/shell/PageHeroHeader';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../lib/auth';

export function MembershipPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const paidReturn = searchParams.get('paid') === '1';
  const sessionId = searchParams.get('session_id');
  const paymentCancelled = searchParams.get('cancelled') === '1';
  const { data: config, isLoading: configLoading } = useTicketingPublicConfig();
  const { data: memberships, isLoading: membershipLoading } = useMyMembership();

  const { confirming, activated } = useMembershipPaymentReturn({
    paid: paidReturn,
    sessionId,
    enabled: isAuthenticated && !authLoading,
  });

  if (authLoading || configLoading || (isAuthenticated && membershipLoading) || confirming) {
    return <Skeleton className="mx-auto mt-12 h-64 max-w-xl" />;
  }

  const accountMode = isAuthenticated;

  return (
    <div className="pb-16">
      <Seo title={accountMode ? 'Moj račun' : 'Članstvo'} />
      <PageHeroHeader
        eyebrow="Zajednica"
        title={accountMode ? 'Moj račun' : 'Članstvo'}
        subtitle={
          accountMode
            ? 'Status članstva i digitalna članska kartica.'
            : 'Pridružite se klubu i podržite FK Gračanica kao registrirani član.'
        }
      />
      <FormShell
        title={accountMode ? 'Moj račun' : 'Postani član'}
        description={
          accountMode
            ? 'Pregledajte status prijave ili aktivnog članstva.'
            : 'Ekskluzivne pogodnosti za članove kluba.'
        }
      >
        <MembershipPurchasePanel
          config={config}
          memberships={memberships}
          confirmingPayment={confirming}
          paymentCancelled={paymentCancelled}
          paymentSuccess={paidReturn && activated}
        />
      </FormShell>
    </div>
  );
}
