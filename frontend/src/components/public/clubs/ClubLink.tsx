import { Link } from 'react-router-dom';
import { clubPath } from '../../../lib/public-routes';
import { cn } from '../../../lib/utils';

interface Props {
  slug: string;
  name: string;
  className?: string;
}

export function ClubLink({ slug, name, className }: Props) {
  return (
    <Link to={clubPath(slug)} className={cn('font-medium text-primary hover:underline', className)}>
      {name}
    </Link>
  );
}
