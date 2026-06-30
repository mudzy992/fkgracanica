import { ticketStatusLabel } from './ticketing-status';
import { escapeHtml, urlToDataUrl } from './pass-image';
import { mediaUrl } from './media';
import { qrDataUrl } from './pass-qr';
import { passDocumentShell } from './pass-print';

export interface TicketPassPrintData {
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
}

const TICKET_CSS = `
  .sticket {
    display: flex; width: 520px; min-height: 228px; border-radius: 12px; overflow: hidden;
    border: 2px solid #27272a; box-shadow: 0 12px 32px rgba(0,0,0,.14);
    page-break-inside: avoid; flex-shrink: 0; position: relative;
  }
  .sticket.cancelled { opacity: .75; filter: grayscale(1); }
  .st-main { flex: 1.65; position: relative; color: #fff; min-width: 0; background: #000; }
  .st-bg-wrap { position: absolute; inset: 0; background: #000; }
  .st-bg {
    position: absolute; inset: 0; background-size: contain; background-position: center;
    background-repeat: no-repeat;
  }
  .st-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.9), rgba(0,0,0,.55) 45%, rgba(0,0,0,.25));
  }
  .st-fallback { position: absolute; inset: 0; background: linear-gradient(135deg, #4f46e5, #18181b); }
  .st-content {
    position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column;
    justify-content: space-between; padding: 18px 20px;
  }
  .st-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .st-host { font-size: 9px; text-transform: uppercase; letter-spacing: .2em; color: rgba(255,255,255,.6); }
  .st-meta { font-size: 10px; font-weight: 500; color: rgba(255,255,255,.85); margin-top: 4px; line-height: 1.35; }
  .st-admit {
    flex-shrink: 0; transform: rotate(-6deg); border: 1px solid rgba(255,255,255,.35);
    padding: 2px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
  }
  .st-teams { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 8px 0; }
  .st-team { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 0; }
  .st-team-crest { width: 56px; height: 56px; object-fit: contain; }
  .st-team-fb {
    width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px;
  }
  .st-team-name { font-size: 10px; font-weight: 600; text-align: center; max-width: 110px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .st-vs { font-size: 14px; font-weight: 900; color: rgba(255,255,255,.45); flex-shrink: 0; }
  .st-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.65); text-align: center; }
  .st-date { font-size: 13px; color: rgba(255,255,255,.78); text-align: center; margin-top: 4px; }
  .st-ref { font-family: monospace; font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: .05em; }
  .st-perf { width: 1px; background: rgba(255,255,255,.2); position: relative; flex-shrink: 0; }
  .st-notch {
    position: absolute; left: -10px; width: 20px; height: 20px; border-radius: 50%; background: #f4f4f5;
  }
  .st-notch.t { top: 24px; } .st-notch.b { bottom: 24px; }
  .st-stub {
    width: 132px; flex-shrink: 0; background: #09090b; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 20px 12px;
  }
  .st-status {
    font-size: 9px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: #27272a;
  }
  .st-sector-lbl { font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,.5); }
  .st-sector { font-size: 13px; font-weight: 700; text-align: center; }
  .st-price { font-size: 20px; font-weight: 900; }
  .st-qr { width: 72px; height: 72px; border-radius: 6px; border: 2px solid rgba(255,255,255,.3); background: #fff; padding: 2px; }
`;

async function resolveBgUrl(path?: string): Promise<string | undefined> {
  if (!path) return undefined;
  const url = path.startsWith('http') ? path : mediaUrl(path, 'medium');
  if (!url) return undefined;
  return (await urlToDataUrl(url)) ?? url;
}

async function crestImg(path?: string, fallback?: string): Promise<string> {
  if (!path) {
    const init = (fallback ?? '?').slice(0, 2).toUpperCase();
    return `<div class="st-team-fb">${escapeHtml(init)}</div>`;
  }
  const url = path.startsWith('http') ? path : mediaUrl(path, 'thumb');
  const embedded = url ? await urlToDataUrl(url) : undefined;
  const src = embedded ?? url;
  return src ? `<img class="st-team-crest" src="${src}" alt="" />` : `<div class="st-team-fb">FK</div>`;
}

function metaLine(data: TicketPassPrintData): string {
  return [data.competitionName, data.seasonName, data.roundLabel].filter(Boolean).join(' · ');
}

async function ticketBlock(data: TicketPassPrintData): Promise<string> {
  const qr = data.qrValue ? await qrDataUrl(data.qrValue, 160) : '';
  const bg = await resolveBgUrl(data.backgroundUrl);
  const homeCrest = await crestImg(data.homeCrestUrl, data.homeClubName);
  const awayCrest = await crestImg(data.awayCrestUrl, data.awayClubName);
  const cancelled = data.status === 'CANCELLED' || data.status === 'REFUND_REQUESTED';
  const meta = metaLine(data);
  const bgLayer = bg
    ? `<div class="st-bg-wrap"><div class="st-bg" style="background-image:url('${bg}')"></div><div class="st-overlay"></div></div>`
    : `<div class="st-fallback"></div>`;

  return `<div class="sticket${cancelled ? ' cancelled' : ''}">
    <div class="st-main">${bgLayer}
      <div class="st-content">
        <div class="st-top">
          <div>
            <div class="st-host">${escapeHtml(data.clubName)}</div>
            ${meta ? `<div class="st-meta">${escapeHtml(meta)}</div>` : ''}
          </div>
          <span class="st-admit">Admit One</span>
        </div>
        <div>
          <div class="st-teams">
            <div class="st-team">${homeCrest}<div class="st-team-name">${escapeHtml(data.homeClubName ?? '—')}</div></div>
            <span class="st-vs">VS</span>
            <div class="st-team">${awayCrest}<div class="st-team-name">${escapeHtml(data.awayClubName ?? '—')}</div></div>
          </div>
          <div class="st-lbl">Ulaznica</div>
          <div class="st-date">${escapeHtml(data.matchDate)}</div>
        </div>
        ${data.ticketRef ? `<div class="st-ref">#${escapeHtml(data.ticketRef)}</div>` : ''}
      </div>
    </div>
    <div class="st-perf"><div class="st-notch t"></div><div class="st-notch b"></div></div>
    <div class="st-stub">
      <span class="st-status">${escapeHtml(ticketStatusLabel(data.status))}</span>
      <div><div class="st-sector-lbl">Sektor</div><div class="st-sector">${escapeHtml(data.category)}</div></div>
      <div class="st-price">${escapeHtml(data.price)} KM</div>
      ${qr ? `<img class="st-qr" src="${qr}" alt="QR" />` : ''}
    </div>
  </div>`;
}

export async function buildTicketPassesHtml(
  tickets: TicketPassPrintData[],
  title: string,
): Promise<string> {
  const blocks = await Promise.all(tickets.map(ticketBlock));
  const body = `<style>${TICKET_CSS}</style>${blocks.join('')}`;
  return passDocumentShell(title, body);
}
