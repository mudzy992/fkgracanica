# Faza 3 — Admin Page Builder

## Stranice

### `CmsPagesAdminPage.tsx` (~150 linija)
- Tabela: naslov, slug, status, akcije
- Novi / Uredi meta / Obriši (ne system stranice)

### `CmsPageBuilderPage.tsx` (~180 linija max → split)
- `CmsSectionList.tsx` — lista, reorder, enable/disable, delete
- `CmsWidgetPicker.tsx` — dialog po kategorijama
- `CmsSectionEditor.tsx` — switch po widgetType → dedicated form

### Widget admin forme (po fajlu, <120 linija)
```
forms/HeroSectionForm.tsx      # naslov, bg, CTA lista (label+url)
forms/NewsFeedSectionForm.tsx  # mode, limit, category picker
forms/CtaSectionForm.tsx
forms/RichTextSectionForm.tsx
...
```

**Nema JSON editora** za poznate widgete — samo za `custom-json` fallback (opcionalno).

## Zamjena starog CMS admina
- `/admin/cms` → redirect ili tab: Stranice | Meni
- Ukloniti `CmsBlockEditor`, `CmsCreateDialog` nakon migracije

## Exit
- Admin kreira stranicu, dodaje widgete, mijenja redoslijed, objavljuje
- Svaki widget ima razumljiva polja na BS
