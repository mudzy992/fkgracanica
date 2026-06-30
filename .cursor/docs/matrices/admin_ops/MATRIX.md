# Admin Ops Matrix (#19–#21)

## Korisnici i uloge (`/admin/users`)

- Tab **Korisnici**: lista + pretraga + paginacija + CRUD sheet (`users.*` perm)
- Tab **Uloge**: lista + dozvole + custom uloge (`rbac.read` / `rbac.update`)
- `GET /users/role-options` — dodjela uloga bez `rbac.read`
- Zaštita: self-delete/deactivate; posljednji admin; Administrator = sistemska
- Audit: `users.*`, `rbac.role.*`
- Jedan sidebar item; `/admin/roles` → redirect `?tab=roles`
- RBAC: tab vidljiv po `users.read` / `rbac.read`

## Postavke (`/admin/settings`)

- `AdminPageShell` + kartice po sekcijama (Moduli, Identitet, Kontakt, SEO, SMTP…)
- Tab **Javne** / **Privatne**
- **Moduli aplikacije** — switch po modulu; ovisnosti (npr. Live → Takmičenja)
- Backend validacija ovisnosti pri `PUT settings/*`
- Ključevi `modules.*` (javno) i `feature.*` (privatno); ticketing/payments u `/admin/ticketing`
- RBAC: `settings.read`, `settings.update`; `PermissionRoute`; read-only bez update
- Admin sidebar i javni fallback nav filtriraju isključene module
- `ModuleRoute` guard na javnim i admin rutama; CMS meni filtriran po modulu
- Tabovi po grupama unutar Javne/Privatne; `GET /settings/module-flags` za routing

## Dashboard (`/admin` → Dashboard)

- KPI kartice: korisnici, članovi, vijesti, utakmice, golovi, ulaznice
- API: `GET /dashboard/kpis`

## Notifikacije (`/admin/notifications`)

- In-app lista, mark read, mark all read
- Bell u admin headeru
- RBAC: autentifikovani korisnik (vlastite)

## Audit (`/admin/audit`)

- Filteri: akcija, entitet, datum
- Paginirana tabela
- RBAC: `audit.read`

## Changelog

- 2026-06-30: Postavke — tabovi po grupama, ModuleRoute guard, module-flags API, CMS nav filter
- 2026-06-30: Postavke — moduli s ovisnostima, unified card UI, nav filter
- 2026-06-30: Korisnici + Uloge spojeni u jedan modul (`/admin/users` + tabovi)
- 2026-06-30: Gate #19 — RBAC hardening, audit, PermissionRoute, role-options, e2e
- 2026-06-29: Gate #19–#21 READY_FOR_REVIEW
