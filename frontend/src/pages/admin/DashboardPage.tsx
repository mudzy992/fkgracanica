import { useDashboardKpis } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

const kpiLabels: Record<string, string> = {
  users: 'Korisnici',
  members: 'Članovi',
  activeMemberships: 'Aktivna članstva',
  publishedNews: 'Objavljene vijesti',
  matches: 'Utakmice',
  goals: 'Golovi',
  ticketsSold: 'Prodane ulaznice',
};

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardKpis();

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-text-muted">Nije moguće učitati KPI podatke.</p>
        <Button variant="outline" onClick={() => void refetch()}>
          Pokušaj ponovo
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Seo title="Dashboard" />
      <h1 className="mb-6 text-2xl font-bold">Kontrolna tabla</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : data &&
            Object.entries(data).map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-text-muted">
                    {kpiLabels[key] ?? key}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{value}</p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
