import { membershipStatusLabel } from './membership-status';
import { escapeHtml, urlToDataUrl } from './pass-image';
import { qrDataUrl } from './pass-qr';
import { passDocumentShell } from './pass-print';

export interface MembershipCardPrintData {
  memberName: string;
  clubName: string;
  crestUrl?: string;
  cardNumber: string;
  status: string;
  validUntil: string;
  qrValue: string;
}

const CARD_CSS = `
  .dcard {
    position: relative; width: 340px; aspect-ratio: 1.586 / 1;
    border-radius: 16px; border: 1px solid rgba(79,70,229,.25);
    box-shadow: 0 10px 25px rgba(0,0,0,.1); overflow: hidden;
    page-break-inside: avoid; flex-shrink: 0;
  }
  .dcard-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(79,70,229,.2) 0%, #fff 55%, #f8fafc 100%);
  }
  .dcard-deco1 { position: absolute; right: -32px; top: -32px; width: 128px; height: 128px;
    border-radius: 50%; background: rgba(79,70,229,.1); }
  .dcard-deco2 { position: absolute; left: -24px; bottom: -24px; width: 96px; height: 96px;
    border-radius: 50%; background: rgba(79,70,229,.05); }
  .dcard-inner { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }
  .dcard-head {
    display: flex; align-items: center; gap: 10px; padding: 14px 16px 12px;
    border-bottom: 1px solid rgba(79,70,229,.15); background: rgba(79,70,229,.1);
  }
  .dcard-head .crest { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }
  .dcard-head .crest-fb {
    width: 32px; height: 32px; border-radius: 50%; background: rgba(79,70,229,.2);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 11px; color: #4f46e5; flex-shrink: 0;
  }
  .dcard-head .meta { flex: 1; min-width: 0; }
  .dcard-head .lbl { font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: .08em; color: #4f46e5; }
  .dcard-head .club { font-size: 14px; font-weight: 700; color: #18181b;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .badge {
    font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 99px; flex-shrink: 0;
    background: #dcfce7; color: #166534;
  }
  .badge.warn { background: #fef3c7; color: #92400e; }
  .badge.danger { background: #fee2e2; color: #991b1b; }
  .dcard-body {
    flex: 1; display: flex; align-items: flex-end; justify-content: space-between;
    gap: 12px; padding: 12px 16px 16px;
  }
  .dcard-body .info { flex: 1; min-width: 0; }
  .dcard-body .who { font-size: 10px; color: #71717a; }
  .dcard-body .name {
    font-size: 18px; font-weight: 700; color: #18181b; line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dcard-body .row { font-size: 11px; margin-top: 6px; color: #71717a; }
  .dcard-body .row strong { color: #18181b; font-weight: 600; }
  .dcard-body .qr {
    width: 68px; height: 68px; border-radius: 8px; border: 2px solid rgba(79,70,229,.3);
    background: #fff; padding: 3px; flex-shrink: 0;
  }
`;

function statusBadgeClass(status: string): string {
  if (status === 'ACTIVE') return 'badge';
  if (status === 'PENDING') return 'badge warn';
  return 'badge danger';
}

async function crestMarkup(url?: string): Promise<string> {
  if (!url) return '<div class="crest-fb">FK</div>';
  const embedded = await urlToDataUrl(url);
  const src = embedded ?? url;
  return `<img class="crest" src="${src}" alt="" />`;
}

async function cardBlock(data: MembershipCardPrintData): Promise<string> {
  const qr = await qrDataUrl(data.qrValue, 140);
  const crest = await crestMarkup(data.crestUrl);
  const name = escapeHtml(data.memberName);
  const club = escapeHtml(data.clubName);
  const status = membershipStatusLabel(data.status as never);

  return `<div class="dcard">
    <div class="dcard-bg"></div>
    <div class="dcard-deco1"></div>
    <div class="dcard-deco2"></div>
    <div class="dcard-inner">
      <div class="dcard-head">
        ${crest}
        <div class="meta"><div class="lbl">Članska kartica</div><div class="club">${club}</div></div>
        <span class="${statusBadgeClass(data.status)}">${escapeHtml(status)}</span>
      </div>
      <div class="dcard-body">
        <div class="info">
          <div class="who">Član</div>
          <div class="name">${name}</div>
          <div class="row">Broj: <strong>${escapeHtml(data.cardNumber)}</strong></div>
          <div class="row">Važi do: <strong>${escapeHtml(data.validUntil)}</strong></div>
        </div>
        <img class="qr" src="${qr}" alt="QR" />
      </div>
    </div>
  </div>`;
}

export async function buildMembershipCardsHtml(
  cards: MembershipCardPrintData[],
  title: string,
): Promise<string> {
  const blocks = await Promise.all(cards.map(cardBlock));
  const body = `<style>${CARD_CSS}</style>${blocks.join('')}`;
  return passDocumentShell(title, body);
}
