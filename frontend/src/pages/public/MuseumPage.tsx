import { useMemo, useState } from 'react';
import { useMuseum } from '../../hooks';
import { RichContent } from '../../components/public/RichContent';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

export function MuseumPage() {
  const { data, isLoading } = useMuseum();
  const [year, setYear] = useState<number | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const years = useMemo(() => {
    const set = new Set<number>();
    data?.forEach((i) => i.year != null && set.add(i.year));
    return [...set].sort((a, b) => b - a);
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((i) => i.category && set.add(i.category));
    return [...set].sort();
  }, [data]);

  const filtered = useMemo(
    () =>
      data?.filter((i) => {
        if (year != null && i.year !== year) return false;
        if (category && i.category !== category) return false;
        return true;
      }),
    [data, year, category],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Seo title="Muzej" />
      <h1 className="mb-6 text-3xl font-bold">Muzej</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={year == null ? 'default' : 'ghost'} onClick={() => setYear(undefined)}>
          Sve godine
        </Button>
        {years.map((y) => (
          <Button key={y} size="sm" variant={year === y ? 'default' : 'ghost'} onClick={() => setYear(y)}>
            {y}
          </Button>
        ))}
      </div>
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Button size="sm" variant={!category ? 'default' : 'ghost'} onClick={() => setCategory(undefined)}>
            Sve kategorije
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'ghost'}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)
          : filtered?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.imagePath && (
                  <img src={mediaUrl(item.imagePath)} alt="" className="h-40 w-full object-cover" />
                )}
                <CardContent className="p-4">
                  {item.year && <p className="text-sm font-bold text-primary">{item.year}</p>}
                  <h2 className="font-semibold">{item.title}</h2>
                  {item.category && <p className="text-xs text-text-muted">{item.category}</p>}
                  {item.description && (
                    <RichContent html={item.description} className="mt-2 text-sm text-text-muted" />
                  )}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
