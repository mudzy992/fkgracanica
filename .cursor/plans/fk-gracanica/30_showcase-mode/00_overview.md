# 30 — Showcase Mode

In-app scroll-driven prezentacija platforme umjesto klasičnog maintenance ekrana.

## Odluke

- Flag `feature.showcaseMode` (opt-in, default `false` — uključeno samo kad je `'true'`).
- Javnost vidi showcase; `/admin`, `/prijava`, `/admin/login`, mobile `/login` + `/staff` rade.
- `/platforma` i `?showcase=1` rade i kad je flag ugašen.
- Lansiranje portala: Stripe + blagajna. PayPal/Monri/PWA/Excel/newsletter blast = `after_launch`.
- Jedan API `GET /public/showcase` hrani web i mobile.

## Faze

| Faza | Dokument |
|------|----------|
| 1 Katalog + API | [01_phase-catalog-api.md](01_phase-catalog-api.md) |
| 2 Web gate | [02_phase-web-gate.md](02_phase-web-gate.md) |
| 3 Web UI | [03_phase-web-ui.md](03_phase-web-ui.md) |
| 4 Mobile | [04_phase-mobile.md](04_phase-mobile.md) |
| 5 CTA + polish | [05_phase-cta-polish.md](05_phase-cta-polish.md) |

## Matrica

`.cursor/docs/matrices/showcase/`
