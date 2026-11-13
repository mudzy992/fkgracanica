#!/usr/bin/env bash
# DEPRECATED (P-CI04-1, 2026-11-13): oba servisa (frontend i backend) se sada grade
# iz root konteksta sa root `package-lock.json` (npm workspace) — isti lock kao CI.
# Prije: frontend i backend su imali zasebne lockove koji su tiho driftovali
# (CI-04/B-CI04-01, INF-01/F-019). Frontend je prebačen u CI-04 (2026-11-03),
# backend je bio posljednji standalone lock i uklonjen je u P-CI04-1
# (backend/package-lock.json obrisan, backend/.dockerignore obrisan,
# docker-compose.yml backend context: . + dockerfile: backend/Dockerfile,
# backend/Dockerfile kopira root lock + sve workspace package.json).
#
# Ovaj skript je zadržan kao no-op da vanjski pozivi ne pucaju, ali ne radi ništa.
# Guard `scripts/standards/docker-context.mjs` čuva da se per-workspace lockovi
# ne vrate (frontend/package-lock.json, backend/package-lock.json).
set -euo pipefail
echo "sync-docker-locks: DEPRECATED — svi servisi koriste root package-lock.json (P-CI04-1); nema standalone lockova za sinhronizaciju." >&2
exit 0
