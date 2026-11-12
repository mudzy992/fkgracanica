import { mediaUrl } from '../../lib/media';
import { ticketStatusLabel, ticketStatusVariant } from '../../lib/ticketing-status';
import { Badge } from '../ui/badge';
import { PassQrCode } from '../pass/PassQrCode';

export interface SportTicketData {
  clubName: string;
  crestUrl?: string;
  backgroundUrl?: string;
  matchTitle: string;
  matchDate: string;
  homeClubName?: string;
  awayClubName?: string;
  homeCrestUrl?: string;
  awayCrestUrl?: string;
  competitionName?: string;
  seasonName?: string;
  roundLabel?: string;
  category: string;
  price: string;
  status: string;
  qrValue?: string;
  ticketRef?: string;
  cancelled?: boolean;
}

interface Props {
  data: SportTicketData;
}

function TeamCrest({ path, name }: { path?: string; name?: string }) {
  const src = path ? mediaUrl(path, 'thumb') : undefined;
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      {src ? (
        <img src={src} alt="" className="h-14 w-14 object-contain drop-shadow-lg sm:h-16 sm:w-16" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xs font-bold sm:h-16 sm:w-16">
          {(name ?? '?').slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="max-w-[100px] truncate text-center text-[10px] font-semibold leading-tight sm:max-w-[120px] sm:text-[11px]">
        {name ?? '—'}
      </p>
    </div>
  );
}

export function SportEventTicket({ data }: Props) {
  const bg = data.backgroundUrl ? mediaUrl(data.backgroundUrl, 'medium') : undefined;
  const meta = data.competitionName || data.seasonName || data.roundLabel
    ? [data.competitionName, data.seasonName, data.roundLabel].filter(Boolean).join(' · ')
    : undefined;
  const showQr = !!data.qrValue;

  return (
    <div
      className={`relative mx-auto w-full max-w-[520px] overflow-hidden rounded-xl border-2 shadow-xl ${
        data.cancelled ? 'border-danger/40 opacity-75 grayscale' : 'border-zinc-800/25'
      }`}
    >
      <div className="flex min-h-[228px]">
        <div className="relative min-w-0 flex-[1.65] overflow-hidden bg-black">
          {bg ? (
            <>
              <div className="absolute inset-0 bg-black" />
              <img
                src={bg}
                alt=""
                className="absolute inset-0 h-full w-full object-contain object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-zinc-900" />
          )}

          <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  {data.clubName}
                </p>
                {meta && <p className="text-[10px] font-medium leading-snug text-white/85">{meta}</p>}
              </div>
              <span className="shrink-0 -rotate-6 border border-white/35 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/90">
                Admit One
              </span>
            </div>

            <div className="py-1">
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <TeamCrest path={data.homeCrestUrl} name={data.homeClubName} />
                <span className="shrink-0 font-display text-sm font-black text-white/45 sm:text-base">VS</span>
                <TeamCrest path={data.awayCrestUrl} name={data.awayClubName} />
              </div>
              <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white/65">
                Ulaznica
              </p>
              <p className="text-center text-xs text-white/75 sm:text-sm">{data.matchDate}</p>
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
            <p className="text-[9px] uppercase tracking-wide text-white/50">Sektor</p>
            <p className="text-sm font-bold leading-tight">{data.category}</p>
          </div>
          <p className="font-display text-xl font-black leading-none">{data.price} KM</p>
          {showQr && (
            <PassQrCode value={data.qrValue!} size={72} label="QR ulaznice" className="border-white/30" />
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
