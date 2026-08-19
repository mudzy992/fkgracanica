# Showcase modules — audit rescore (2026-08-19)

Git pull + review track. Nova rola Redar i admission scan flow registrovani.

## Gotovo (100 / ready)
19 Spremno redova + cms-builder, formation-dnd, media-tree (web_only) + after_launch traka dovršena:
paypal, monri, newsletter-campaigns, financial-export, pwa, seasonal-tickets, video-highlights

## Podignuto ovim pullom
| id | staro | novo | obrazloženje |
|----|-------|------|--------------|
| mobile-staff | 70 | **82** | Admission scan (Redar): kamera, inspect/validate, overlay, vibracija, manual. Komentator desk, live broadcast, events sheet. |
| mobile-polish | 69 | **72** | LiveMatchBroadcast HUD, events sheet, YouTube stream, orientation unlock. |
| rbac | 100 | 100 | Summary update — šest uloga (Redar dodan u tekst). |
| dashboard | 100 | 100 | Summary update — Redar vidi validate panel. |

## Otvorene stavke i sljedeća realizacija
| id | % | gap | sljedeći korak |
|----|---|-----|----------------|
| mobile-staff | 82 | Writer mob home, moderation review flow | Nova writer home + notification badge |
| mobile-polish | 72 | Heritage, gallery, news ekrani | Cinematic hero + bento revizija |
| email | 90 | SMTP test u prod-u; 2-way retry | FailedEmail admin pregled stranica |
| analytics | 90 | Excel export, više sezona | ExportButton + multi-season select |
| newsletter | 90 | Double-opt-in confirm | Confirm token endpoint + email |
| i18n-en | 60 | Admin inline BS stringovi, ticket/liga stranice | i18n pass po modulu |
| push | 72 | Delivery reliability, badge count | APNs + FCM health check |
| play-store | 20 | EAS prod submit | Submit + internal test track |
