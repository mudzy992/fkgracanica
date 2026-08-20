import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clubPath } from '../../lib/public-routes';
import { playerPath } from '../../lib/public-routes';
import type { SearchFacet, SearchResponse } from '../../types/search';
import { Card, CardContent } from '../ui/card';

export function SearchResultSections({ data, type }: { data: SearchResponse; type?: SearchFacet }) {
  const sections: { key: SearchFacet; title: string; items: { id: string; node: ReactNode }[] }[] = [
    {
      key: 'news',
      title: 'Vijesti',
      items: (data.news ?? []).map((n) => ({
        id: n.id,
        node: (
          <Link to={`/vijesti/${n.slug}`}>
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">{n.title}</CardContent>
            </Card>
          </Link>
        ),
      })),
    },
    {
      key: 'players',
      title: 'Igrači',
      items: (data.players ?? []).map((p) => ({
        id: p.id,
        node: (
          <Link to={playerPath(p.id)}>
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">
                {p.firstName} {p.lastName}
              </CardContent>
            </Card>
          </Link>
        ),
      })),
    },
    {
      key: 'clubs',
      title: 'Klubovi',
      items: (data.clubs ?? []).map((c) => ({
        id: c.id,
        node: c.slug ? (
          <Link to={clubPath(c.slug)}>
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">{c.name}</CardContent>
            </Card>
          </Link>
        ) : (
          <Card><CardContent className="p-4">{c.name}</CardContent></Card>
        ),
      })),
    },
    {
      key: 'matches',
      title: 'Utakmice',
      items: (data.matches ?? []).map((m) => ({
        id: m.id,
        node: (
          <Link to={`/utakmice/${m.id}`}>
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">
                {m.homeClub?.name} vs {m.awayClub?.name}
              </CardContent>
            </Card>
          </Link>
        ),
      })),
    },
    {
      key: 'galleries',
      title: 'Galerije',
      items: (data.galleries ?? []).map((g) => ({
        id: g.id,
        node: (
          <Link to={`/galerija/${g.slug}`}>
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">{g.title}</CardContent>
            </Card>
          </Link>
        ),
      })),
    },
    {
      key: 'trophies',
      title: 'Trofeji',
      items: (data.trophies ?? []).map((t) => ({
        id: t.id,
        node: (
          <Card>
            <CardContent className="p-4">
              {t.name} ({t.year})
            </CardContent>
          </Card>
        ),
      })),
    },
    {
      key: 'timeline',
      title: 'Timeline',
      items: (data.timeline ?? []).map((event) => ({
        id: event.id,
        node: (
          <Link to={`/o-klubu#${event.id}`}>
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">{event.title}</CardContent>
            </Card>
          </Link>
        ),
      })),
    },
    {
      key: 'hallOfFame',
      title: 'Kuća slavnih',
      items: (data.hallOfFame ?? []).map((entry) => ({
        id: entry.id,
        node: (
          <Link to="/hall-of-fame">
            <Card className="hover:shadow-sm">
              <CardContent className="p-4">
                {entry.name}
                {entry.role ? ` — ${entry.role}` : ''}
              </CardContent>
            </Card>
          </Link>
        ),
      })),
    },
  ];

  const visible = type ? sections.filter((s) => s.key === type) : sections.filter((s) => s.items.length > 0);

  return (
    <div className="space-y-6">
      {visible.map((section) => (
        <section key={section.key}>
          {!type && <h2 className="mb-3 font-semibold">{section.title}</h2>}
          <div className="space-y-2">{section.items.map((item) => <div key={item.id}>{item.node}</div>)}</div>
        </section>
      ))}
    </div>
  );
}
