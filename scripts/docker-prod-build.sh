#!/usr/bin/env bash
# P-CI04-2 napredno: parallel + BuildKit cache + uslovni build po git diff.
#   - DOCKER_BUILDKIT=1 + BuildKit cache mount (`--mount=type=cache`) u
#     backend/frontend Dockerfile smanjuje `npm ci` 2-3 min → ~20 s.
#   - `--parallel` gradi backend i frontend istovremeno (3-4 min uštede).
#   - Uslovni build: ako git diff pokazuje da je diran samo backend
#     (ili samo frontend), drugi servis se preskače (`--no-cache` se ne
#     koristi — layer cache ostaje). Na Coolifyju git historija može biti
#     plitka (shallow), pa fallback je build oba ako se ne može odrediti.
set -euo pipefail
cd "$(dirname "$0")/.."

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# --- uslovni build (d) ---
# Detektuj promjene u odnosu na prethodni commit / origin/main.
# Coolify često radi shallow fetch — zato probamo više baza.
BASE_REF=""
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  BASE_REF="origin/main"
elif git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
  BASE_REF="HEAD~1"
fi

SHOULD_BUILD_BACKEND=1
SHOULD_BUILD_FRONTEND=1

if [ -n "$BASE_REF" ] && [ "${SKIP_CONDITIONAL:-0}" != "1" ]; then
  # `git diff --name-only BASE...HEAD` pokriva i merge commitove
  CHANGED=$(git diff --name-only "$BASE_REF"...HEAD 2>/dev/null || git diff --name-only "$BASE_REF" 2>/dev/null || echo "all")
  echo "[build] promjene vs $BASE_REF:"
  echo "$CHANGED" | sed 's/^/  /'
  # Ako je CHANGED prazan (nema diffa), gradi oba (sigurnije)
  if [ -n "$CHANGED" ] && ! echo "$CHANGED" | grep -q "^all$"; then
    BACKEND_TOUCHED=0
    FRONTEND_TOUCHED=0
    # backend servis zavisi od: backend/, package.json/lock, prisma/, docker-compose.yml, Dockerfile
    if echo "$CHANGED" | grep -Eq '^(backend/|prisma/|package\.json|package-lock\.json|docker-compose\.yml|backend/Dockerfile)'; then
      BACKEND_TOUCHED=1
    fi
    if echo "$CHANGED" | grep -Eq '^(frontend/|package\.json|package-lock\.json|docker-compose\.yml|frontend/Dockerfile)'; then
      FRONTEND_TOUCHED=1
    fi
    # Ako nijedan pattern nije pogodio, a CHANGED nije prazan — nepoznate promjene → gradi oba
    if [ "$BACKEND_TOUCHED" = "0" ] && [ "$FRONTEND_TOUCHED" = "0" ]; then
      # npr. samo docs/ ili scripts/ — oba servisa su nepromijenjena, ali
      # sigurnije je graditi oba ako su dirani shared fajlovi (npr. .env.example)
      if echo "$CHANGED" | grep -Eq '^(docs/|AUDIT/|scripts/|README)'; then
        echo "[build] samo docs/scripts — preskačem oba builda (koristim cache)"
        SHOULD_BUILD_BACKEND=0
        SHOULD_BUILD_FRONTEND=0
      else
        echo "[build] nepoznat pattern — gradim oba (sigurnosni fallback)"
      fi
    else
      SHOULD_BUILD_BACKEND=$BACKEND_TOUCHED
      SHOULD_BUILD_FRONTEND=$FRONTEND_TOUCHED
      echo "[build] backend=$SHOULD_BUILD_BACKEND frontend=$SHOULD_BUILD_FRONTEND"
    fi
  fi
else
  echo "[build] nema BASE_REF ili SKIP_CONDITIONAL=1 — gradim oba"
fi

# --- build ---
BUILD_ARGS=(--pull --parallel)
# Ako je neki servis nepromijenjen, nemoj ga graditi — docker compose build
# prima listu servisa (npr. `docker compose build backend`). Migrator i worker
# dijele backend image, pa ih ne treba posebno graditi (dovoljno je backend).
if [ "$SHOULD_BUILD_BACKEND" = "0" ] && [ "$SHOULD_BUILD_FRONTEND" = "0" ]; then
  echo "[build] nema promjena za build — preskačem `docker compose build`"
elif [ "$SHOULD_BUILD_BACKEND" = "0" ]; then
  echo "[build] gradim samo frontend (backend nepromijenjen)"
  docker compose build "${BUILD_ARGS[@]}" frontend
elif [ "$SHOULD_BUILD_FRONTEND" = "0" ]; then
  echo "[build] gradim samo backend (+migrator/worker dijele image)"
  docker compose build "${BUILD_ARGS[@]}" backend
else
  echo "[build] gradim oba servisa paralelno"
  docker compose build "${BUILD_ARGS[@]}"
fi

docker image prune -f --filter "dangling=true" >/dev/null 2>&1 || true
echo "Build complete. Run: docker compose up -d"
echo "  migrator: docker compose up -d migrator  # jednokratno"
echo "  backend+worker+frontend: docker compose up -d"
