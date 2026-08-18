import { mediaUrl } from '../../../lib/media';
import type { HallOfFameEntry } from '../../../types';
import { Dialog, DialogBody, DialogHeader } from '../../ui/dialog';

interface Props {
  entry: HallOfFameEntry | null;
  open: boolean;
  onClose: () => void;
}

export function HofLegendDialog({ entry, open, onClose }: Props) {
  if (!entry) return null;
  const photo = entry.photoPath ?? entry.imagePath;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} className="max-w-3xl border-amber-300/20 bg-[#08111d]">
      <DialogHeader onClose={onClose}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-100/75">Legenda kluba</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">{entry.name}</p>
        </div>
      </DialogHeader>
      <DialogBody className="space-y-6 px-0 py-0">
        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/10 md:border-b-0 md:border-r">
            {photo ? (
              <img src={mediaUrl(photo, 'original')} alt="" className="h-full max-h-[32rem] w-full object-cover" />
            ) : (
              <div className="flex min-h-[22rem] items-center justify-center bg-[linear-gradient(180deg,#1f1508,#4b320d)] font-display text-6xl font-bold text-amber-100/80">
                {entry.name[0]}
              </div>
            )}
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {entry.role && (
                <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                  {entry.role}
                </div>
              )}
              {entry.years && (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  {entry.years}
                </div>
              )}
            </div>
            <div className="h-px w-16 bg-gradient-to-r from-amber-300/70 to-transparent" />
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
              {entry.bio || 'Biografija za ovu legendu još nije objavljena.'}
            </p>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
