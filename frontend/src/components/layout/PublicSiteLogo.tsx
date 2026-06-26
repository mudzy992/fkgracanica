import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/media';

interface Props {
  crestUrl?: string;
  clubName?: string;
}

export function PublicSiteLogo({ crestUrl, clubName = 'FK Gračanica' }: Props) {
  if (crestUrl) {
    return (
      <Link to="/" className="flex items-center gap-2">
        <img
          src={mediaUrl(crestUrl, 'thumb')}
          alt={clubName}
          className="h-9 w-9 object-contain transition-transform hover:scale-105"
        />
        <span className="hidden text-lg font-bold text-primary sm:inline">{clubName}</span>
      </Link>
    );
  }

  return (
    <Link to="/" className="text-lg font-bold text-primary">
      {clubName}
    </Link>
  );
}
