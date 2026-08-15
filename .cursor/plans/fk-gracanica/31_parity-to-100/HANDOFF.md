# HANDOFF — Parity to 100%

> Datum: **2026-08-15**  
> Status: Showcase katalog + cinematic **DONE**. Sljedeće: **backend 100%**.

## Starter (nova sesija)

Nastavi FK Gračanica s `main`. Pročitaj:

- `.cursor/plans/fk-gracanica/HANDOFF.md`
- `.cursor/plans/fk-gracanica/31_parity-to-100/00_overview.md`
- `.cursor/plans/fk-gracanica/31_parity-to-100/01_phase-backend.md`
- `.cursor/docs/matrices/showcase-audit/GAPS.md`

**Redoslijed:** backend → frontend → mobile. Prioritet BE+FE na 100% (bez after_launch).

Ne: PayPal, Monri, PWA, Excel, newsletter blast.  
Ne diraj showcase intercept u `mobile/app/_layout.tsx` i `(tabs)/_layout.tsx`.

Počni fazu 1: `backend/src/analytics/` (H2H + agregacija), zatim email, SEO share.

## Šta je gotovo ove sesije

- Dual-scroll fix, cinematic `/platforma`
- Audit checklist (23 public + 24 staff)
- Katalog % iz audita (`mobile-polish` 69, `mobile-staff` 70, `analytics` 42, `seo` 74, `pwa` 22)

## Preview

https://fkgracanica.ba101.top/platforma  
Flag `feature.showcaseMode` default OFF.

## Reference

- Audit: `.cursor/docs/matrices/showcase-audit/`
- Katalog: `backend/src/showcase/catalog-modules.ts`
