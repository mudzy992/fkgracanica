# Faza 4 — Dinamički meni + custom rute

## Routing

```tsx
<Route path="p/:slug" element={<CmsDynamicPage />} />
```

- `CmsDynamicPage` → `PageRenderer` + SEO iz page meta
- System stranice (`home`) na `/` ostaju posebno

## Meni

### Admin `CmsMenuEditorPage.tsx`
- Draggable stavke
- Polja: Label, Tip (CMS stranica / interni path / eksterni URL), Roditelj

### `PublicLayout`
- `useCmsMenu('main')` umjesto hardcoded `navItems`
- Fallback na seed ako API prazan

## Objavljivanje
- DRAFT stranice nisu u meniju ni na `/p/:slug` (404)
- PUBLISHED + `showInMenu` flag na stavci

## Exit
- Nova stranica "O nama" → objavi → pojavi se u meniju
