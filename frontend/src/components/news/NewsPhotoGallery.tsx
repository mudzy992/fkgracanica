import type { PhotoBentoItem } from '../public/PremiumPhotoBento';
import { PremiumPhotoBento } from '../public/PremiumPhotoBento';

export type NewsPhotoItem = PhotoBentoItem;

export function NewsPhotoGallery({ photos }: { photos: NewsPhotoItem[] }) {
  return <PremiumPhotoBento photos={photos} />;
}
