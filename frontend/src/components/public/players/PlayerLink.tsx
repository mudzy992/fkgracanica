import { Link } from 'react-router-dom';
import { playerPath } from '../../../lib/public-routes';
import { cn } from '../../../lib/utils';

interface Props {
  id: string;
  name: string;
  className?: string;
}

export function PlayerLink({ id, name, className }: Props) {
  return (
    <Link
      to={playerPath(id)}
      className={cn('font-medium text-primary-light transition hover:text-white hover:underline', className)}
    >
      {name}
    </Link>
  );
}
