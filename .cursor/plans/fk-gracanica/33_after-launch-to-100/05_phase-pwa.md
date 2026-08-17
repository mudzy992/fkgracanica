# Faza 5 — PWA 22 → 100%

Ima: `frontend/public/manifest.json`, `sw.js`, registracija u `main.tsx`, link u `index.html`.
Nema: PNG ikone 192/512, install UX, smislen offline.

## 100% definicija

Instalabilna na Android Chrome. Offline shell javnih ruta (naslovna + `/offline`). Admin/API se ne kešira agresivno. iOS: `apple-touch-icon` + Add to Home Screen (nema `beforeinstallprompt`).

## Posao

1. Ikone: `frontend/public/icons/icon-192.png`, `icon-512.png`, maskable. Grb iz `club.crestUrl` ako postoji u static public; inače postojeći favicon export u PNG.
2. `manifest.json`: `icons` PNG, `display: standalone`, `theme_color` klub plava, `start_url: /`.
3. `index.html`: `apple-touch-icon`, `theme-color`.
4. Install banner: `beforeinstallprompt` → kompaktna traka (dismiss + localStorage). Bez vizuelnog šuma. `prefers-reduced-motion`.
5. SW v3:
   - precache: `/`, `/offline.html`, manifest, ikone
   - navigate: network, fallback `/offline.html` (ne samo `/index.html`)
   - static assets: cache-first
   - `/api/` i `/backend/`: network-only
6. `/offline.html` kratka poruka BS.
7. Ne registrirati SW u admin preview ako kvari HMR — ostavi production-only (`import.meta.env.PROD`) ako dev pati.

## Fajlovi

- `frontend/public/manifest.json`, `sw.js`, `offline.html`, `icons/`
- `frontend/index.html`, `frontend/src/main.tsx`
- `frontend/src/components/pwa/InstallBanner.tsx` (novi, ≤150)
- `.cursor/docs/matrices/pwa/`

## 100%

Lighthouse installable (Android). Katalog `pwa` 100 ready. iOS naveden u matrici kao ograničenje, ne blokada.
