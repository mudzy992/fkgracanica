import { mediaUrl } from '../../../lib/media';
import type { Trophy } from '../../../types';
import { Card, CardContent } from '../../ui/card';

interface Props {
  trophy: Trophy;
}

export function TrophyCard({ trophy }: Props) {
  return (
    <Card className="h-full overflow-hidden transition hover:shadow-md">
      <CardContent className="flex gap-4 p-5">
        {trophy.imagePath ? (
          <img src={mediaUrl(trophy.imagePath, 'thumb')} alt="" className="h-16 w-16 shrink-0 object-contain" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {trophy.year}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xl font-bold text-primary">{trophy.year}</p>
          <p className="font-semibold text-text">{trophy.name}</p>
          {trophy.competition && <p className="text-sm text-text-muted">{trophy.competition}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
