import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSearch } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const query = params.get('q') ?? '';
  const { data, isLoading } = useSearch(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(q ? { q } : {});
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Seo title="Pretraga" />
      <h1 className="mb-6 text-3xl font-bold">Pretraga</h1>
      <form onSubmit={handleSearch} className="mb-8">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pretraži vijesti, igrače, utakmice..."
        />
      </form>
      {query.length < 2 ? (
        <p className="text-text-muted">Unesite najmanje 2 karaktera.</p>
      ) : isLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <div className="space-y-6">
          {data?.news && data.news.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">Vijesti</h2>
              {data.news.map((n) => (
                <Link key={n.id} to={`/vijesti/${n.slug}`}>
                  <Card className="mb-2 hover:shadow-sm">
                    <CardContent className="p-4">{n.title}</CardContent>
                  </Card>
                </Link>
              ))}
            </section>
          )}
          {data?.players && data.players.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">Igrači</h2>
              {data.players.map((p) => (
                <Card key={p.id} className="mb-2">
                  <CardContent className="p-4">
                    {p.firstName} {p.lastName}
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
          {data?.matches && data.matches.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">Utakmice</h2>
              {data.matches.map((m) => (
                <Link key={m.id} to={`/utakmice/${m.id}`}>
                  <Card className="mb-2 hover:shadow-sm">
                    <CardContent className="p-4">
                      {m.homeClub?.name} vs {m.awayClub?.name}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </section>
          )}
          {!data?.news?.length && !data?.players?.length && !data?.matches?.length && (
            <p className="text-text-muted">Nema rezultata.</p>
          )}
        </div>
      )}
    </div>
  );
}
