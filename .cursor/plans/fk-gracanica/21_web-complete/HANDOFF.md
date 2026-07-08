# HANDOFF — Web Complete

> **Datum:** 2026-07-08  
> **Sesija:** Gate **#1–#21 ALL APPROVED** · Muzej/HOF javni cinematic APPROVED · SeasonClub APPROVED · commit ručno (korisnik)  
> **Sljedeći fokus:** Opcionalni backlog + deploy verify — plan 21_web-complete **gates closed**  
> **Git:** commit odradio korisnik ručno

---

## 0. Gate — zatvoreno

| # | Modul | Status |
|---|-------|--------|
| **1–21** | Svi moduli Web Complete | **APPROVED** |
| SeasonClub + standings | REVIEW | **APPROVED** (korisnik) |
| Javne: kontakt / match / live / muzej / HOF | — | **APPROVED** |

Log: [GATE_LOG.md](./GATE_LOG.md)

---

## 1. Šta je gotovo (kumulativno)

- Admin moduli #1–#21 + public premium polish
- SEO/OG server + share API (home = club.name)
- SeasonClub + crest u tabeli
- CMS meni: modul-off warning
- Live pitch: premium + crest fallback + enlarged teren + compact tokeni
- Muzej + HOF cinematic public

---

## 2. Šta je dalje (van gate-a)

Plan **21_web-complete** više nema blocker gate-ova. Preostalo je **opciono**:

```
1. Deploy verify (ako commit već na prod):
   - OG curl / WhatsApp preview
   - modules.museum ON ako želiš javni /muzej
   - brzi smoke naslovna + /liga + /live

2. Backlog (nije blocker):
   - FE listener settings:changed (realtime)
   - Settings number inputs (smtp.port, upload.maxSizeMb)
   - Match validacija: samo SeasonClub učesnici
   - /o-klubu — skip ili kasniji polish

3. Mobile app (odvojen track) — ako je prioritet

4. Novi plan / feature zahtjevi — kad kažeš šta želiš
```

---

## 3. Otvoreno (nije blocker)

| Tema | Status |
|------|--------|
| Realtime `settings:changed` FE | Još nema |
| Number inputs u postavkama | Još text |
| SeasonClub-only match validation | Opciono |
| `/o-klubu` polish | Skip |

---

## 4. Prompt sljedeća sesija

```
Nastavi iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Web Complete gates #1–#21 APPROVED — zatvoreno.

Želim [deploy verify / backlog X / novi feature / mobile].
```
