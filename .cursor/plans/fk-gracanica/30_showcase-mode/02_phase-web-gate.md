# Faza 2 — Web gate

- `ShowcaseGate` oko `PublicLayout` i `/live/:id`
- Mode ON ili `?showcase=1` → `ShowcasePage` (bez PublicLayout nava)
- `/platforma` uvijek `ShowcasePage` (sibling, izvan PublicLayout)
- Bypass: `/prijava`, `/admin`, `/admin/login`
- Flag ON samo ako `feature.showcaseMode === 'true'`
