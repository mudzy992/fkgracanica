import { mediaUrl } from '../../lib/media';
import { ticketStatusLabel, ticketStatusVariant } from '../../lib/ticketing-status';
import type { SeasonPassVisualData } from '../../lib/season-pass-visual';
import { Badge } from '../ui/badge';
import { PassQrCode } from '../pass/PassQrCode';

export function SeasonPassVisual({ data }: { data: SeasonPassVisualData }) {
  const crest = data.crestUrl ? mediaUrl(data.crestUrl, 'medium') : undefined;
  const showQr = !!data.qrValue;

  return (
    <div
      className={`relative mx-auto w-full max-w-[520px] overflow-hidden rounded-xl border-2 shadow-xl ${
        data.cancelled ? 'border-danger/40 opacity-75 grayscale' : 'border-primary/30'
      }`}
    >
      <div className="flex min-h-[228px]">
        <div className="relative min-w-0 flex-[1.65] overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-zinc-950" />
          {crest && (
            <img
              src={crest}
              alt=""
              className="pointer-events-none absolute -right-6 top-1/2 h-44 w-44 -translate-y-1/2 object-contain opacity-20"
            />
          )}
          <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {data.clubName}
              </p>
              <span className="shrink-0 border border-amber-300/70 bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-100">
                Sezona
              </span>
            </div>
            <div className="flex items-center gap-3 py-1">
              {crest ? (
                <img src={crest} alt="" className="h-16 w-16 object-contain drop-shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                  FK
                </div>
              )}
              <div className="min-w-0">
                <p className="font-display text-lg font-black leading-tight text-white sm:text-xl">
                  {data.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white/85">{data.seasonName}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
                  Važi za sve domaće utakmice
                </p>
              </div>
            </div>
            {data.ticketRef && (
              <p className="font-mono text-[10px] tracking-wider text-white/40">#{data.ticketRef}</p>
            )}
          </div>
        </div>
        <div className="relative w-px shrink-0 bg-white/20">
          <div className="absolute -left-2.5 top-6 h-5 w-5 rounded-full bg-background shadow-inner" />
          <div className="absolute -left-2.5 bottom-6 h-5 w-5 rounded-full bg-background shadow-inner" />
        </div>
        <div className="flex w-[132px] shrink-0 flex-col items-center justify-center gap-3 bg-zinc-950 px-3 py-5 text-white">
          <Badge variant={ticketStatusVariant(data.status)} className="text-[9px]">
            {ticketStatusLabel(data.status)}
          </Badge>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wide text-white/50">Karta</p>
            <p className="text-sm font-bold leading-tight">{data.label}</p>
          </div>
          <p className="font-display text-xl font-black leading-none">{data.price} KM</p>
          {showQr && (
            <PassQrCode value={data.qrValue!} size={72} label="QR sezonske karte" className="border-white/30" />
          )}
        </div>
      </div>
      {data.cancelled && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-danger/10">
          <span className="-rotate-12 border-4 border-danger px-4 py-1 text-lg font-black uppercase tracking-widest text-danger">
            Otkazano
          </span>
        </div>
      )}
    </div>
  );
}
