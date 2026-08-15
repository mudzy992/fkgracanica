# Showcase audit rubric

Datum: **2026-08-15**. Metoda: code review (nije device smoke).

## Skala po stavci (0–100)

| Dio | Max | 100% |
|-----|-----|------|
| Funkcija | 40 | API, role, empty/error/retry, nema stub-a |
| Vizuelni parity | 40 | Cinematic/primitives vs web; ne goli FlatList/ListRow |
| Higijena | 20 | i18n BS+EN, `useTheme`, skeleton, fajl ≤200 |

## Pravila kataloga

- `mobile-polish` / `mobile-staff` / `push` / `play-store` = mobile skor.
- Ostali moduli s `web` = **web kod**, da se ne kazni dvaput (mobile gap ide u `mobile-polish`).
- `web_only` / `after_launch` nisu blokada lansiranja; ostaju na mapi.
- Katalog **nije izmijenjen** dok owner ne potvrdi `MODULES.md` kolonu *predloženo*.

## Šta ovaj audit nije

Pokretanje na telefonu, Play Store, SMTP u produkciji, Stripe live charge.
