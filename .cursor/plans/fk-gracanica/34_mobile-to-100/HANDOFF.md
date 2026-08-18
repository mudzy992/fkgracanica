# HANDOFF — 34 Mobile to 100%

> **Datum:** 2026-08-18  
> **Status:** Liga / Tim / Klub stats filter + Uživo polish + header search DONE. Next = P2 staff.  
> **Plan:** `.cursor/plans/fk-gracanica/34_mobile-to-100/`  
> **Bez commita.**

---

## Status u jednoj rečenici

Public polish (account, Liga/Tim filter po takmičenju, Uživo scoreboard, header search) je gotov; ostaje P2 staff, pa Play Store + device smoke.

---

## Šta je urađeno (ova sesija)

### Tim / Klub — statistike sezone
- `TeamSeasonStatsBlock`: `GET /clubs/:id/participations` + `GET /clubs/:id/stats?seasonId=<editionId>`
- Chipovi = takmičenja **aktivne** sezone (sakriveni ako je 1); default `isActive && isLeague`
- `TeamSeasonSummary` ostaje presentational
- `clubId` u `TeamScreenData`

### Liga
- Filter po editionu unutar izabrane kalendarske sezone (`mapCalendarEditions` / `pickDefaultEditionId`)
- Hero kicker = ime takmičenja
- Mečevi: dijeljeni `MatchScoreRow` (grbovi + rezultat)
- Lideri: podium boje 1–3

### Pretraga
- `HeaderSearchButton` u tab `headerRight` (News/Live/More/Profile) + Home hero gore-desno
- Tab bar i dalje 5 tabova; More `ListRow` ostaje
- Showcase intercept **nije diran**

### Uživo
- Lista: scoreboard red + featured prvi LIVE
- Meta: takmičenje · kolo (API `season.competition` / `roundRel`)
- Detalj: `LiveScoreboard` (grbovi, i18n status, venue)

---

## Donesene odluke

1. Stats/liga filter rade po **edition ID** (`SeasonCompetition`), ne calendar season ID.
2. Search ide u header, ne u 6. tab.
3. Liga layout ostaje Hero → chipovi → tabela → mečevi → lideri.

---

## Otvoreno / rizici

- `expo-web-browser` plugin — rebuild dev clienta preporučen
- Device smoke još nije rađen
- `mobile/src/i18n/common.ts` i dalje >200 linija (pre-existing)
- P2 staff nije startovan
- Canvas % ručno

---

## Next steps

1. **P2 staff** (`.cursor/plans/fk-gracanica/34_mobile-to-100/03_phase-p2-staff.md`):
   - dashboard — skeleton, KPI, error
   - gallery-manage — edit/delete photo
   - orders — status / refund
   - EntityList image — trophies, HOF, museum, sponsors, clubs
2. Play Store listing
3. Device smoke (Stripe return, Liga filter, Tim stats chips, search header, Uživo scoreboard)

---

## Test status

- `cd mobile && npx tsc --noEmit` — PASS
- Device smoke — nije rađen

---

## Starter za novi chat

```
Nastavi Track 34. Liga/Tim/Uživo polish + header search je DONE.
Sljedeće: P2 staff — dashboard, gallery-manage, orders, EntityList images.

Ne dirati showcase intercept. Bez commita dok ne kažem.
Dark-only, fajlovi ≤200, i18n BS/EN.

@.cursor/plans/fk-gracanica/34_mobile-to-100/HANDOFF.md
@.cursor/plans/fk-gracanica/34_mobile-to-100/03_phase-p2-staff.md
```
