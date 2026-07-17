# HANDOFF — Screen Polish (Naslovna / Home)

> **Datum:** 2026-07-17  
> **Status:** Home (#1) — **IN PROGRESS** (ne prelaziti na News)  
> **Track:** `.cursor/plans/fk-gracanica/29_mobile-screen-polish/`  
> **Pravilo:** Naslovna mora biti **DONE** (vizuelno + paritet + smoke na uređaju) prije ekrana #2.

---

## Status u jednoj rečenici

Naslovna ima CMS hero sa fade u surface, istaknute CTA-ove, spojeni match widget (sljedeća + Posljednja utakmica), borderless soft-tonal kartice i web-paritet module (igrači, tabela, galerija, membership band, trofeji, sponzori); **Home još nije DONE** — ostaje `HomeSkeleton`, newsletter i manual smoke na uređaju.

---

## Šta je urađeno (ova + prethodna sesija)

| Stavka | Fajl |
|--------|------|
| Orchestrator + data load (news, matches, public settings) | [`mobile/app/(tabs)/home.tsx`](mobile/app/(tabs)/home.tsx) |
| `pickFeaturedMatch` + `pickLastResult` | [`pick-home-matches.ts`](mobile/src/components/home/pick-home-matches.ts) |
| Hero: crest, club name, guest/auth welcome | [`HomeHero.tsx`](mobile/src/components/home/HomeHero.tsx) |
| Match kartica: LIVE badge, score, CTA po statusu | [`HomeMatchCard.tsx`](mobile/src/components/home/HomeMatchCard.tsx) |
| Vijesti: 3 kartice, datum, „Sve vijesti” | [`HomeNewsSection.tsx`](mobile/src/components/home/HomeNewsSection.tsx) |
| Media URL contract (`/uploads/files`, variants) | [`media.ts`](mobile/src/lib/media.ts), [`RemoteImage.tsx`](mobile/src/components/RemoteImage.tsx) |
| CMS hero backdrop + display hero | [`HomeHero.tsx`](mobile/src/components/home/HomeHero.tsx), [`pick-hero-config.ts`](mobile/src/components/home/pick-hero-config.ts) |
| Match kartice sa grbovima klubova | [`HomeMatchCard.tsx`](mobile/src/components/home/HomeMatchCard.tsx) |
| Image-first news kartice | [`HomeNewsSection.tsx`](mobile/src/components/home/HomeNewsSection.tsx) |
| Hero fade u surface + istaknuti CTA | [`HomeHero.tsx`](mobile/src/components/home/HomeHero.tsx), [`HomeModuleCtas.tsx`](mobile/src/components/home/HomeModuleCtas.tsx) |
| Spojeni match widget (next + last) | [`HomeMatchWidget.tsx`](mobile/src/components/home/HomeMatchWidget.tsx) |
| Soft tonal surfaces (bez bordera) | [`home-surface.ts`](mobile/src/components/home/home-surface.ts) |
| Featured players / liga / galerija / trofeji / sponzori | [`load-home-extras.ts`](mobile/src/components/home/load-home-extras.ts) + widget komponente |
| Membership band „Budi dio kluba” | [`HomeMembershipBand.tsx`](mobile/src/components/home/HomeMembershipBand.tsx) |
| Module CTAs (članstvo, ulaznice) po flagovima | [`HomeModuleCtas.tsx`](mobile/src/components/home/HomeModuleCtas.tsx) |
| Fade-in sekcije (reduce motion) | [`HomeFadeSection.tsx`](mobile/src/components/home/HomeFadeSection.tsx) |
| i18n keys | [`mobile/src/i18n/home.ts`](mobile/src/i18n/home.ts) |
| `tsc --noEmit` | prolazi |

---

## Šta NIJE gotovo — sljedeća sesija (prioritet)

### A. Web-paritet sadržaja (naslovna ≠ samo meč + 3 vijesti)

Web `home` CMS/widgeti uključuju (vidi `frontend/src/pages/home/sections/`):

| Sekcija | Web | Mobile danas | Akcija |
|---------|-----|--------------|--------|
| Sljedeći meč + Posljednja utakmica | ✓ | ✓ | U jednom widgetu |
| Liga / tabela | `LeagueTable.tsx` | ✓ | Top 5 + link `/league` |
| Galerija preview | `GallerySection.tsx` | ✓ | 1–2 albuma horizontalno |
| Sponzori | `SponsorsSection.tsx` | ✓ | Logo strip |
| Trofeji | `TrophiesSection.tsx` | ✓ | Horizontal chips |
| Istaknuti igrači | `FeaturedPlayers.tsx` | ✓ | Horizontal scroll → `/player/:id` |
| Membership CTA | `MembershipCTA.tsx` | ✓ | Band + hero CTA |
| Newsletter | `Newsletter.tsx` | ✗ | Inline email ili CTA → `/contact` |

**Preporuka:** jedna komponenta po sekciji u `mobile/src/components/home/`; `home.tsx` ostaje orchestrator (≤200 linija).

### B. Premium vizuelni sloj

- [x] Hero band — CMS backdrop / primary fallback (kao web hero widget)
- [x] Kartice — konzistentniji radius, blagi shadow/elevation, više whitespace
- [ ] `HomeSkeleton` — oblik match + news kartica (ne generički `ListSkeleton`)
- [ ] Section dividers između blokova (tanak border ili spacing bump)
- [x] Pull-to-refresh `tintColor` = `colors.primary`

### C. UX / edge cases

- [ ] Manual smoke: **375px**, **dark mode**, **guest** + **član**, **offline** → error+retry
- [ ] LIVE kartica: opcioni pulse na badge-u (RN `Animated`, bez reanimated)
- [ ] Prazan last result — sakriti sekciju (već) vs placeholder copy
- [x] Module flags loading — CTAs ne trebaju „blinkati” (čekati `useModuleFlags().loading`)

### D. Van scope naslovne (ne raditi u ovoj fazi)

- Tab header dynamic crest → [`(tabs)/_layout.tsx`](mobile/app/(tabs)/_layout.tsx) (poseban mini-task)
- CMS page builder
- Novi BE endpointi

---

## Predloženi redoslijed implementacije (sesija 2)

1. **Premium vizuel** — hero band + card style + `HomeSkeleton`
2. **Liga snippet** — `HomeLeagueSnippet.tsx`
3. **Galerija preview** — `HomeGalleryPreview.tsx`
4. **Sponzori / trofeji / igrači** — po jedan mali modul
5. **Newsletter strip** — ili link na contact
6. **Manual smoke** — popuniti checklist u `screens/01_home.md`
7. Tek onda: `SCREEN_QUEUE` Home → **done**, HANDOFF → News (#2)

---

## API reference (postojeći)

```
GET /news/published
GET /matches
GET /settings/public          → club.name, club.crestUrl
GET /settings/module-flags  → feature.membership, modules.ticketing
GET /competitions/seasons/list + GET /statistics/standings?seasonId=
GET /gallery
GET /sponsors
GET /trophies
GET /clubs/own + squad        → featured players
POST /newsletter/subscribe
```

---

## Exit kriterij — Home DONE

Sve u [`screens/01_home.md`](screens/01_home.md) mora biti ✓, uključujući:
- Web-paritet sekcije (min. liga + galerija + jedan od sponzori/trofeji/igrači)
- Premium vizuel potvrđen na uređaju
- Nema hardcoded stringova
- Fajlovi ≤200 linija

---

## Starter za novi chat

```
Nastavi Track 29 — poliranje NASLOVNE (Home #1).

@.cursor/plans/fk-gracanica/29_mobile-screen-polish/HANDOFF.md
@.cursor/plans/fk-gracanica/29_mobile-screen-polish/screens/01_home.md

NE prelaziti na News dok Home nije DONE.
Fokus sesije 2: premium vizuel + liga snippet + galerija preview (po HANDOFF prioritetu).
Pravila: fajlovi ≤200; useTheme; i18n BS/EN; bez commita osim na zahtjev.
```
