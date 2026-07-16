# Mobile Parity Matrix (Production)

| Area | Guest | Član | Writer | Komentator | Moderator | Administrator |
|------|-------|------|--------|------------|-----------|---------------|
| Home / News / Live | read | read | read | read | read | read |
| News comments | read | write/delete own | same | same | same | same |
| Public modules | read | read | read | read | read | read |
| CMS pages read | read | read | read | read | read | read |
| CMS builder / menu | no | no | no | no | no | **web-only** |
| Tickets browse | yes | yes | yes | yes | yes | yes |
| Tickets reserve/refund | no | yes | yes | yes | yes | yes |
| Membership self | CTA | card/register | same | same | same | same |
| Notifications | no | yes | yes | yes | yes | yes |
| Writer news CRUD+submit | no | no | yes | no | no | yes |
| Gallery staff manage | no | no | media if perm | no | manage+approve | yes |
| Live desk full | no | no | no | yes (clock/ET/pen/stoppage/events/comments/stream/report) | if live.manage | yes |
| Moderation approve/reject | no | no | no | no | yes | yes |
| Admin dashboard/users/roles/settings | no | no | limited | limited | limited | full |
| Membership admin / QR validate | no | no | no | no | if perm | yes |
| Ticketing orders admin | no | no | no | no | if perm | yes |
| Heritage/clubs/players/comps CRUD | no | no | no | no | if perm | yes |
| Formation drag-drop / media tree | web-only | web-only | web-only | web-only | web-only | web-only |
| Theme / language | yes | yes | yes | yes | yes | yes |

## UX rules

- `useTheme().colors`; skeleton / empty / error+retry
- `RequirePermission` + BE keys
- Files ≤200 lines

## Notes

- User = Član
- Update on capability change
