# PWA matrix

## 100%

Instalabilna na Android Chrome (`beforeinstallprompt`). Offline shell: `/offline.html`. API network-only.

iOS: `apple-touch-icon` + Add to Home Screen. Nema `beforeinstallprompt` — nije blokada.

## Fajlovi

- `frontend/public/manifest.json` — PNG 192/512 + maskable, `theme_color` `#1E3A8A`, `start_url: /`
- `frontend/public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- `frontend/public/sw.js` — cache `fk-gracanica-v3`
- `frontend/public/offline.html`
- `frontend/src/components/pwa/PwaInstallBanner.tsx` — dismiss u localStorage
- SW samo u `import.meta.env.PROD`

## SW pravila

| Request | Strategija |
|---------|------------|
| `/api/`, `/backend/` | network-only |
| navigate | network, fallback `/offline.html` |
| js/css/img/font | cache-first |
