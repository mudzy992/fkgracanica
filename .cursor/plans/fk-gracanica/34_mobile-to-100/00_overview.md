# 34 — Mobile to 100% (canvas)

> Nastavak nakon Track 30 max. Cilj: kompletna mobilna app po canvasu.

**Canvas:** `canvases/mobile-completeness.canvas.tsx`  
**Baseline:** 47 ekrana ≈ **70%** (public 70, staff 70). Funkcije ≈ 69%.

## Goal

Podignuti mobile na proizvodnu kompletnost: P0 bugovi → P1 public rupe → P2 staff → plaćanja/store.

## Baseline (najslabije)

| Ekran | % | Meta |
|-------|---|------|
| gallery/[slug] | 41 | 80 |
| heritage | 42 | 85 |
| pages / pages/[slug] | 48–50 | 75 |
| gallery lista | 58 | 80 |
| news + detail | 61 | 85 |
| validate / dashboard | 58–60 | 75–80 |

**Već gotovo (ne dirati osim buga):** Home, Liga, Tim, Klub, Igrač (Track 30).

## Faze

| # | Faza | Doc | Ishod |
|---|------|-----|--------|
| 01 | P0 higijena | [01](./01_phase-p0-hygiene.md) | 4 bug-a |
| 02 | P1 public | [02](./02_phase-p1-public.md) | News→heritage→gallery→search→CMS→live→membership/tickets |
| 03 | P2 staff | [03](./03_phase-p2-staff.md) | Dashboard, gallery-manage, orders, list images |
| 04 | Buy + Store | [04](./04_phase-payments-store.md) | Stripe na tickets-buy; Play Store listing |

Jedna faza / ekran po iteraciji dok nije DONE. PLAN pa execute.

## Pravila

- Fajlovi ≤200; dark-only; i18n BS/EN
- Bez commita osim na zahtjev
- Ne dirati showcase intercept u `mobile/app/_layout.tsx` i `(tabs)/_layout.tsx`
- Web-only van opsega: cms-builder DnD, formation editor, media-tree
- Rubrika: F40 / V40 / H20 — vidi `showcase-audit/RUBRIC.md`

## Izvori

- Canvas (source of truth za %)
- `.cursor/docs/matrices/showcase-audit/GAPS.md`
- Track 29 `SCREEN_QUEUE.md` (#2 News nadalje)
- Track 33 faza 9 Play Store
