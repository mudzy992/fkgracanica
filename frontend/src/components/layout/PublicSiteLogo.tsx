import { Link } from 'react-router-dom';
import { mediaUrl } from '../../lib/media';

interface Props {
  crestUrl?: string;
  clubName?: string;
  light?: boolean;
}

export function PublicSiteLogo({ crestUrl, clubName = 'FK Gračanica', light }: Props) {
  const textCls = light ? 'text-white' : 'text-primary-light';

  if (crestUrl) {
    return (
      <Link to="/" className="font-display flex items-center gap-3">
        <img
          src={mediaUrl(crestUrl, 'thumb')}
          alt={clubName}
          className="h-10 w-10 object-contain transition-transform hover:scale-105 lg:h-11 lg:w-11"
        />
        <div className="hidden sm:block">
          <span className={`text-lg font-bold tracking-wide lg:text-xl ${textCls}`}>{clubName}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/" className={`font-display text-lg font-bold lg:text-xl ${textCls}`}>
      {clubName}
    </Link>
  );
}
