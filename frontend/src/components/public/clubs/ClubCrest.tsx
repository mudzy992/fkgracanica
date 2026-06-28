import { mediaUrl } from '../../../lib/media';
import { clubCrestPath } from '../../../lib/club-utils';
import type { Club } from '../../../types';
import { cn } from '../../../lib/utils';

interface Props {
  club?: Pick<Club, 'name' | 'crestPath' | 'logoPath'> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { xs: 'h-6 w-6', sm: 'h-10 w-10', md: 'h-16 w-16', lg: 'h-24 w-24' };

export function ClubCrest({ club, size = 'md', className }: Props) {
  const crest = clubCrestPath(club);
  if (!crest) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary',
          sizes[size],
          className,
        )}
        aria-hidden
      >
        {club?.name?.slice(0, 2).toUpperCase() ?? 'FK'}
      </div>
    );
  }
  return (
    <img
      src={mediaUrl(crest, size === 'lg' ? 'medium' : 'thumb')}
      alt={club?.name ?? ''}
      className={cn('object-contain', sizes[size], className)}
    />
  );
}
