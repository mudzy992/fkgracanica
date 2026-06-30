import { escapeHtml } from './pass-image';

export function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printViaIframe(html: string) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const run = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };
  iframe.onload = run;
  setTimeout(run, 1500);
}

export function openPrintHtml(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    URL.revokeObjectURL(url);
    printViaIframe(html);
    return;
  }
  const cleanup = () => URL.revokeObjectURL(url);
  const runPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      printViaIframe(html);
    }
    cleanup();
  };
  win.addEventListener('load', () => setTimeout(runPrint, 600));
  setTimeout(runPrint, 2500);
}

export function passDocumentShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, system-ui, sans-serif; background: #f4f4f5; color: #18181b; padding: 24px; }
    .toolbar { text-align: center; margin-bottom: 20px; }
    .toolbar button {
      font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
      padding: 10px 20px; border-radius: 8px; border: none;
      background: #4f46e5; color: #fff;
    }
    .wrap { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
    @media print {
      body { background: #fff; padding: 8mm; }
      .no-print { display: none !important; }
      .wrap { gap: 8mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print"><button type="button" onclick="window.print()">Print</button></div>
  <div class="wrap">${body}</div>
</body>
</html>`;
}
