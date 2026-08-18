# Mobile staff screens

Prosjek **24 ekrana: ~71%** (P0 2026-08-17). Hub/thin CRUD, ne cinematic admin.  
Public: [SCREENS.md](./SCREENS.md).

| Ekran | Tip | F | V | H | **%** | Zašto ne 100 | Sljedeći korak |
|-------|-----|---|---|---|-------|--------------|----------------|
| commentator | CRUD | 36 | 30 | 17 | **83** | Nema skeleton/socket badge | Loading + live indicator |
| admin/index | Hub | 34 | 28 | 17 | **79** | Samo linkovi | — |
| roles | CRUD | 34 | 30 | 15 | **79** | Nema create/delete; save bez try | try/catch |
| settings | CRUD | 34 | 30 | 15 | **79** | Nema error na load | Empty/error |
| players | CRUD | 34 | 30 | 15 | **79** | Nema photo upload; 192 lin | `uploadMedia` |
| matches | CRUD | 35 | 28 | 16 | **79** | ISO date; nema lineup | Date picker |
| staff/index | Hub | 34 | 30 | 16 | **80** | Hub kompletan | — |
| writer | CRUD | 33 | 26 | 15 | **74** | Nema list loading; nema RTE | Skeleton |
| competitions | CRUD | 35 | 24 | 15 | **74** | 199 lin; long-press edit | Split seasons |
| users | CRUD | 30 | 28 | 13 | **71** | Nema try/catch, search, delete | Alert + search |
| audit | CRUD | 30 | 24 | 17 | **71** | Limit 50, nema filter | Filter + datum |
| trophies | Thin | 30 | 22 | 17 | **69** | EntityList; web ima preview | Image u listi |
| hall-of-fame | Thin | 30 | 22 | 17 | **69** | Isto | Photo |
| museum | Thin | 30 | 22 | 17 | **69** | Isto | Image |
| comms | CRUD | 30 | 24 | 15 | **69** | Nema blast; `RequireAuth` | Permission + list |
| clubs | Thin | 30 | 20 | 17 | **67** | Nema ClubHub tabove | Deep-link hub |
| sponsors | Thin | 30 | 20 | 17 | **67** | Nema logo preview | Image |
| club-timeline | Thin | 30 | 20 | 17 | **67** | Nema vizuelnu liniju | Date layout |
| moderation | CRUD | 32 | 26 | 17 | **75** | Reject=`DRAFT` | Live reject |
| membership | CRUD | 28 | 24 | 13 | **65** | Nema try/catch / ScreenEmpty | Alert + empty |
| gallery-manage | CRUD | 28 | 20 | 14 | **62** | Nema edit/delete photo | Album edit |
| orders | CRUD | 25 | 20 | 17 | **62** | Read-only, nema refund | Status akcije |
| dashboard | CRUD | 27 | 20 | 13 | **60** | Nema skeleton/error/chart | KPI kartice |
| validate | CRUD | 32 | 26 | 14 | **72** | Parsed card; scan može spamati | Scan lock UI |

**Dokaz (2026-08-17):** reject=`DRAFT`; validate parsed card; staff `noStaffAccess`.

Predloženo `mobile-staff`: **71** (katalog 82).
