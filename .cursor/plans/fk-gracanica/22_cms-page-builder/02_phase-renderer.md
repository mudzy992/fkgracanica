# Faza 2 — PageRenderer + migracija naslovne

## Javni render

### `PageRenderer.tsx`
```tsx
sections.map(s => <WidgetRenderer key={s.id} type={s.widgetType} config={s.config} />)
```

### `WidgetRenderer.tsx`
- Lookup u `widgetRegistry[type].component`
- Error boundary po widgetu (jedan puknuti ne ruši stranicu)

## Promjene

| Fajl | Promjena |
|------|----------|
| `HomePage.tsx` | `<PageRenderer slug="home" />` umjesto 11 hardcoded sekcija |
| `Hero.tsx` | CTA iz `config.buttons[]` — label + url iz admina |
| `PublicLayout.tsx` | footer widget config iz globalne sekcije ili `home` meta |

## Brzi fix (može i prije Faze 1 ako hitno)
Hero CTA: `primaryCtaPath` → `buttons: [{label, url, variant}]` u postojećem `CmsBlock` — **ali plan je full migracija, ne patch.**

## Exit
- Naslovna 100% iz CMS sekcija
- Promjena CTA labela i linka u adminu = isti prikaz na webu
