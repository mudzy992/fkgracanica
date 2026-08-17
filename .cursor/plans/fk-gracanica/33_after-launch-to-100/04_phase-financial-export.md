# Faza 4 — Finansijski izvještaji 0 → 100%

Nema libraryja (`exceljs` / PDF). Admin vidi narudžbe, nema exporta.

## Scope

Excel + PDF uplata: ulaznice (`Payment` + order) i članarine (aktivacije / Stripe-Monri-PayPal membership confirm). Filter: datum od/do, provider, status.

Nije sportska analitika (`/admin/analytics` ostaje).

## Posao

1. Modul `backend/src/finance/` (controller + service + excel.util + pdf.util). Fajlovi ≤200.
2. RBAC: `finance.read` (ili reuse `ticketing.manage` + `membership.manage` — **odluka:** novi `finance.read`, admin-only).
3. API:
   - `GET /finance/summary?from&to` — broj, suma po provideru/statusu
   - `GET /finance/export.xlsx?...`
   - `GET /finance/export.pdf?...`
4. Admin: `/admin/finance` — filteri, KPI kartice, dugmad Excel/PDF. Primitives: `PageHeroHeader` nije public; koristi admin shell.
5. Membership uplate: nema `Payment` reda na članstvu. Export iz membership ACTIVE + `updatedAt` / audit, ili dodati `MembershipPayment` (min: ne širiti Ticket `Payment` na membership u ovoj fazi). **Odluka:** summary iz postojećeg — tickets = `Payment`; membership = članovi ACTIVE u periodu × `membership.annualPrice` dok nema payment reda. Zabilježi rupu u matrici; puni payment red na članstvo = follow-up ako faza 2/3 već piše externalId negdje.

Provjeri Stripe membership: nema `Payment` model veze. Za 100% export: ili (A) novi model `LedgerEntry`, ili (B) tickets Excel 100% + membership CSV sheet u istom xlsx iz Membership tabele. Uzmi **B** u ovoj fazi (brže, bez migracije). LedgerEntry samo ako B laže iznose.

6. Settings: nisu obavezni. Opis na stranici.

## Fajlovi

- `backend/src/finance/*`
- `backend/src/finance/finance.module.ts` u AppModule
- `frontend/src/pages/admin/FinanceAdminPage.tsx` + ruta
- `.cursor/docs/matrices/finance/MATRIX.md` + CHANGELOG

## 100%

Admin vidi summary, skine xlsx i pdf za period. Katalog `financial-export` 100 ready.
