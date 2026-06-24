# Faza 12 — Ručni QA live komentator

## Cilj

Potvrditi komentator flow na produkciji: start → gol → socket → end (kolo 13).

## Skripte

```bash
./scripts/qa-live-reset.sh              # reset kola 13 → SCHEDULED
node scripts/qa-live-commentator.mjs    # puni QA flow
```

## Rezultat (2026-06-24)

| Korak | Status |
|-------|--------|
| Admin login | ✓ |
| Kolo 13 SCHEDULED | ✓ (reset prije testa) |
| Socket `match:join` | ✓ |
| `POST .../start` | ✓ |
| `POST .../events` GOAL 67' | ✓ |
| Socket `match:score` | ✓ `{1:0, minute:67}` |
| API stanje | ✓ 1:0, 1 event |
| `POST .../end` | ✓ |
| Health | ✓ |

**QA PASSED**

## Napomene

- Kolo 13 je bilo `FINISHED` od ranijeg E2E — reset obavezan prije QA
- Socket URL: `https://fkgracanica.ba101.top/realtime` + path `/backend/socket.io`
- Frontend rebuild za socket fix na javnom `/live/:id`
