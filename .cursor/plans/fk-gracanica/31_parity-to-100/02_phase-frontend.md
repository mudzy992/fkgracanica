# Faza 2 — Frontend na 100%

Nakon backend faze. After_launch van opsega.

## 1. i18n-en (28% → cilj visoko)

- Proći public + admin stringove; nema inline BS bez `t()`.
- BS ostaje default.

## 2. Analytics UI

- Admin (i/ili public) stranica na nove BE endpoint-e: team, player, H2H, forma.
- Nema Excel export (after_launch).

## 3. SEO / OG

- Koristiti `GET /seo/share` za crawler ili prerender.
- `Seo.tsx` document.head nije dovoljno za WhatsApp/Viber.

## 4. Media tree (80%)

- Folder picker → stvarni tree ako fali hijerarhija.
- Ostaje web_only.

## 5. Web gapovi iz audita (ne mobile)

- Ticketing Stripe tok kompletan na webu.
- Dashboard chart ako BE da podatke.
- EN na portal/sponsors/contact.
