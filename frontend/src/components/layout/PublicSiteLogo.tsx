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
      <Link to="/" className="font-display flex items-center gap-2.5">
        <img
          src={mediaUrl(crestUrl, 'thumb')}
          alt={clubName}
          className="h-9 w-9 object-contain transition-transform hover:scale-105 lg:h-10 lg:w-10"
        />
        <div className="hidden sm:block">
          <span className={`text-base font-bold tracking-wide lg:text-lg ${textCls}`}>{clubName}</span>
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
