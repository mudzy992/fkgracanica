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
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      className="max-w-4xl overflow-hidden border-amber-300/20 bg-surface-night"
    >
      <DialogHeader onClose={onClose}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-100/75">Legenda kluba</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">{entry.name}</p>
        </div>
      </DialogHeader>
      <DialogBody className="space-y-0 px-0 py-0">
        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative border-b border-white/10 md:border-b-0 md:border-r">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_38%)]" />
            {photo ? (
              <img src={mediaUrl(photo, 'original')} alt="" className="h-full min-h-[24rem] w-full object-cover" />
            ) : (
              <div className="flex min-h-[24rem] items-center justify-center bg-[linear-gradient(180deg,#1f1508,#4b320d)] font-display text-6xl font-bold text-amber-100/80">
                {entry.name[0]}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-night via-surface-night/55 to-transparent p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-100/70">Baština kluba</p>
              <p className="mt-2 font-display text-3xl font-bold text-white">{entry.name}</p>
              {entry.role && (
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-100/85">{entry.role}</p>
              )}
            </div>
          </div>
          <div className="relative space-y-6 overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/55 to-transparent" />
            <div className="relative flex flex-wrap gap-2">
              {entry.years && (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  {entry.years}
                </div>
              )}
              <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                Hall of Fame
              </div>
            </div>
            <div className="relative rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.35))] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/75">Biografija</p>
              <div className="mt-4 h-px w-16 bg-gradient-to-r from-amber-300/70 to-transparent" />
              <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                {entry.bio || 'Biografija za ovu legendu još nije objavljena.'}
              </p>
            </div>
            <div className="relative rounded-[1.75rem] border border-amber-300/15 bg-amber-300/10 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100">Nasljeđe</p>
              <p className="mt-3 text-sm leading-relaxed text-amber-50/90 sm:text-base">
                Legende ne žive samo u rezultatima nego i u sjećanju navijača, ritmu stadiona i identitetu kluba koji
                se prenosi generacijama.
              </p>
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}
