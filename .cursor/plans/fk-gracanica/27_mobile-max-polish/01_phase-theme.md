# Faza 1 — Theme foundation

## Cilj

Dark mode radi na svim ekranima; theme preference persistira.

## Taskovi

- Shared komponente: `useTheme().colors`
- Svi `app/**` ekrani: ukloniti statički `colors` import
- `theme-context.tsx`: SecureStore `theme_preference`
- More: ListRow cycle system → light → dark

## Exit

System/light/dark mijenja sve površine; preference preživljava restart.
