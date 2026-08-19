# HANDOFF — Track 36 + gate scan

> Datum: **2026-08-18**. Branch: **`main`** (`origin/main` @ `e15fd07`).
> Ne dirati showcase intercept u `mobile/app/_layout.tsx` / `(tabs)/_layout.tsx`.
> Ne editovati Cursor plan fajlove (`ops_ticketing_live_*.plan.md`, `gate_scan_lock_*.plan.md`).

---

## Status u jednoj rečenici

Track 36 je **u gitu na `main`**. Gate scan lock i **web komentator dashboard polish** su u working tree, nisu commitovani.

---

## Zadnji push

| Hash | Poruka |
|------|--------|
| `e15fd07` | EAS production `buildType: apk` (ne AAB) |
| `ed7d2cc` | Track 36 App release + ticketing/LIVE |

Migracija (već u `ed7d2cc`): `backend/prisma/migrations/20260818190000_app_releases_live_notify/`  
Polja: `User.notifyLiveMatch`, model `AppRelease`.

---

## Nekomitovano

### A. Komentator dashboard polish (web, ova sesija)

- Home: 4 KPI, live hero, grupisana lista, skeleton/error; CTA bez `/admin/competitions` fallback
- `deskHref`: live/scheduled → `/admin/live/:id`, FINISHED → `/admin/matches/:id/report`
- Desk/report header + socket badge; FINISHED na live ruti → Navigate na izvještaj
- GOAL zahtijeva igrača; EventLog; ClockActions split + confirm Završi
- Matrica `live_center` ažurirana
- Spec: `frontend/src/pages/admin/homes/commentator-desk.spec.ts` (4 passed: `npx tsx --test src/pages/admin/homes/commentator-desk.spec.ts`)

### B. Gate scan lock (prethodna sesija)

Sticky VALID dok se ne skenira **druga** karta:

- `backend/src/ticketing/admission-scan.ts` (**novi**) — `scanAdmission(..., commit)`
- `POST /ticketing/inspect` u `ticketing.controller.ts` (RBAC isto kao validate)
- `season-pass-validate.util.ts` — `{ commit?: boolean }`; inspect ne pravi admission
- Mobile: `TicketValidateScreen.tsx` + `AdmissionResultOverlay.tsx` + `admission-scan.ts`
- i18n: `scanHoldHint`, `scanManualConfirm`, `scanConfirmAdmit`
- Web: `TicketingValidatePanel` — jasno USED vs VALID iz API poruke
- Matrica ticketing MATRIX + CHANGELOG

Testovi (pokrenuto, 12 passed):

```bash
cd backend
npx jest src/ticketing/ticketing.service.spec.ts src/ticketing/season-pass-validate.util.spec.ts src/ticketing/membership-validate.util.spec.ts --no-coverage
```

Ako user kaže commit: **samo ovi fajlovi**, poruka npr. `fix(ulaz): lock QR scan so VALID stays until next ticket`.

---

## Track 36 — šta radi (već na origin)

### App release (Android)
- Admin `/admin/app-releases`, permission `app-releases.manage`
- Public `GET /api/v1/public/app-releases/android/latest`
- Mobile `ApkUpdateHost` u root layoutu (pored AuthProvider; showcase screens netaknuti)
- Soft: Kasnije = 1 dan SecureStore. Force: modal se ne zatvara
- Faze: download → SHA256 → IntentLauncher
- **Native rebuild** obavezan: `REQUEST_INSTALL_PACKAGES`, `expo-application`, `expo-intent-launcher`

### Ulaznice mobile
- QR samo `PAID_AT_BOX_OFFICE` / sezona `ACTIVE`
- RESERVED: pay + cancel; filter važeće bez RESERVED
- Stripe cancel → `/tickets`

### LIVE / komentator
- Klub akcije: igrač iz lineupa; minuta sa sata (mobile ne šalje `minute`)
- Socket `match:join` / score / clock
- `notifyLiveMatch` mute (samo push)
- Mobile live detalj: YouTube WebView + overlay + toast

---

## Odluke

- Gate default = **odmah admit** na prvi unique QR + sticky overlay (ne 3–5s timeout).
- Ručna potvrda = inspect pa „Potvrdi ulaz”.
- Isti QR dok je lock: **nema** drugog API poziva (to je bio bug: VALID pa odmah USED).
- Feedback: `Vibration` (bez `expo-av` / bez novog native dep za beep).
- Membership i dalje ne troši ulaz (samo ACTIVE).

---

## Rizici / ops

1. **Migracija** na produkcijski DB: `npm run db:migrate` (ili docker migrate) ako `notifyLiveMatch` / `AppRelease` još nisu applied.
2. **APK update** ne radi dok se ne uradi novi Android native build + objavi release u adminu.
3. `prisma generate` treba `DATABASE_URL` (dummy URL dovoljan za generate).
4. Fanout live push ide svim userima s push device — na velikom broju korisnika paziti.
5. Backend `tsc` ima stare greške u spec/e2e (nije Track 36). Mobile `tsc` je prolazio.

---

## Next steps (prioritet)

1. Commit komentator dashboard polish (web) ako owner odobri.
2. Commit + push gate scan (ako owner odobri) — **samo** ticketing fajlovi.
3. Apply migraciju na real DB.
4. EAS APK build (`mobile/eas.json` production = apk) + upload u `/admin/app-releases`.
5. Na terenu: ulaz sken — prvi VALID mora ostati dok se ne skenira sljedeća karta.
6. Native rebuild za APK install permission.

---

## Pokretanje

```bash
npm run dev:backend
npm run dev:frontend
npm run dev:mobile
```

Produkcija: `./scripts/menu.sh` ili docker-prod-build.

URL: https://fkgracanica.ba101.top — API `/backend/api/v1`

---

## Reference

- Plan Track 36: `.cursor/plans/fk-gracanica/36_ops-ticketing-live/`
- Gate scan plan: Cursor `gate_scan_lock_e3e486dc.plan.md` (ne editovati)
- Matrice: `ticketing`, `seasonal-tickets`, `live_center`
- Root handoff: [../HANDOFF.md](../HANDOFF.md)
