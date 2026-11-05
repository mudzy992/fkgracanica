import { ticketStatusLabel } from './ticketing-status';
import { escapeAttribute, escapeHtml, urlToDataUrl } from './pass-image';
import { mediaUrl } from './media';
import { qrDataUrl } from './pass-qr';
import { passDocumentShell } from './pass-print';
import type { SeasonPassVisualData } from './season-pass-visual';

const CSS = `
  .spass {
    display: flex; width: 520px; min-height: 228px; border-radius: 12px; overflow: hidden;
    border: 2px solid rgba(30,58,138,.45); box-shadow: 0 12px 32px rgba(0,0,0,.14);
    page-break-inside: avoid; position: relative;
  }
  .spass.cancelled { opacity: .75; filter: grayscale(1); }
  .sp-main { flex: 1.65; position: relative; color: #fff; min-width: 0; background: #09090b; }
  .sp-grad { position: absolute; inset: 0; background: linear-gradient(135deg, #1e3a8a, #09090b); }
  .sp-mark { position: absolute; right: -24px; top: 50%; width: 176px; height: 176px;
    transform: translateY(-50%); object-fit: contain; opacity: .2; }
  .sp-content { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column;
    justify-content: space-between; padding: 18px 20px; }
  .sp-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .sp-host { font-size: 9px; text-transform: uppercase; letter-spacing: .2em; color: rgba(255,255,255,.6); }
  .sp-chip { border: 1px solid rgba(252,211,77,.7); background: rgba(251,191,36,.15);
    padding: 2px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; color: #fef3c7; }
  .sp-mid { display: flex; align-items: center; gap: 12px; }
  .sp-crest { width: 72px; height: 72px; object-fit: contain; flex-shrink: 0; }
  .sp-crest-fb { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center; font-weight: 700; }
  .sp-title { font-size: 20px; font-weight: 900; line-height: 1.15; }
  .sp-season { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.85); margin-top: 2px; }
  .sp-hint { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.55); margin-top: 6px; }
  .sp-ref { font-family: monospace; font-size: 10px; color: rgba(255,255,255,.4); letter-spacing: .05em; }
  .sp-perf { width: 1px; background: rgba(255,255,255,.2); position: relative; flex-shrink: 0; }
  .sp-notch { position: absolute; left: -10px; width: 20px; height: 20px; border-radius: 50%; background: #f4f4f5; }
  .sp-notch.t { top: 24px; } .sp-notch.b { bottom: 24px; }
  .sp-stub { width: 132px; flex-shrink: 0; background: #09090b; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 20px 12px; }
  .sp-status { font-size: 9px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: #166534; }
  .sp-lbl { font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,.5); }
  .sp-cat { font-size: 13px; font-weight: 700; text-align: center; }
  .sp-price { font-size: 20px; font-weight: 900; }
  .sp-qr { width: 72px; height: 72px; border-radius: 6px; border: 2px solid rgba(255,255,255,.3); background: #fff; padding: 2px; }
`;

async function crestSrc(path?: string): Promise<string | undefined> {
  if (!path) return undefined;
  const url = path.startsWith('http') ? path : mediaUrl(path, 'medium');
  if (!url) return undefined;
  return (await urlToDataUrl(url)) ?? url;
}

async function passBlock(data: SeasonPassVisualData): Promise<string> {
  const qr = data.qrValue ? await qrDataUrl(data.qrValue, 160) : '';
  const crest = await crestSrc(data.crestUrl);
  const cancelled = data.cancelled || data.status === 'CANCELLED' || data.status === 'REFUNDED';
  const mark = crest ? `<img class="sp-mark" src="${escapeAttribute(crest)}" alt="" />` : '';
  const crestEl = crest
    ? `<img class="sp-crest" src="${escapeAttribute(crest)}" alt="" />`
    : `<div class="sp-crest-fb">FK</div>`;

  return `<div class="spass${cancelled ? ' cancelled' : ''}">
    <div class="sp-main"><div class="sp-grad"></div>${mark}
      <div class="sp-content">
        <div class="sp-top">
          <div class="sp-host">${escapeHtml(data.clubName)}</div>
          <span class="sp-chip">Sezona</span>
        </div>
        <div class="sp-mid">${crestEl}
          <div>
            <div class="sp-title">${escapeHtml(data.label)}</div>
            <div class="sp-season">${escapeHtml(data.seasonName)}</div>
            <div class="sp-hint">Važi za sve domaće utakmice</div>
          </div>
        </div>
        ${data.ticketRef ? `<div class="sp-ref">#${escapeHtml(data.ticketRef)}</div>` : ''}
      </div>
    </div>
    <div class="sp-perf"><div class="sp-notch t"></div><div class="sp-notch b"></div></div>
    <div class="sp-stub">
      <span class="sp-status">${escapeHtml(ticketStatusLabel(data.status))}</span>
      <div><div class="sp-lbl">Karta</div><div class="sp-cat">${escapeHtml(data.label)}</div></div>
      <div class="sp-price">${escapeHtml(data.price)} KM</div>
      ${qr ? `<img class="sp-qr" src="${escapeAttribute(qr)}" alt="QR" />` : ''}
    </div>
  </div>`;
}

export async function buildSeasonPassHtml(data: SeasonPassVisualData, title: string): Promise<string> {
  const body = `<style>${CSS}</style>${await passBlock(data)}`;
  return passDocumentShell(title, body);
}
