# syntax=docker/dockerfile:1
# INF-01 (I-01-08): bez `npm install --package-lock-only` — gradnja ne
# regeneriše lock unutar slike.
#
# CI-04 (2026-11-03): build koristi **root** `package-lock.json` (monorepo je npm
# workspace: `backend`, `frontend`, `mobile`). Do sada je kontekst bio
# `./frontend` sa zasebnim `frontend/package-lock.json` koji `npm install -w`
# nikad ne ažurira → lock je zarašao (nema vitest/jsdom/dompurify) i `npm ci`
# je padao na Coolify deployu. Sada je lock jedan (root) i identičan onome koji
# CI koristi, pa se build i testovi nikad ne razilaze.

FROM node:22-alpine AS builder

WORKDIR /app

# Manifesti svih workspace-a: `npm ci` validira cijeli tree iz root locka.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY mobile/package.json ./mobile/

RUN npm ci --no-audit --no-fund

COPY frontend ./frontend

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_REALTIME_URL
ENV VITE_REALTIME_URL=$VITE_REALTIME_URL
ARG VITE_SOCKET_IO_PATH
ENV VITE_SOCKET_IO_PATH=$VITE_SOCKET_IO_PATH

RUN npm run build -w frontend


FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install express@4.21.2

COPY --from=builder /app/frontend/dist ./dist
COPY frontend/server ./server

# INF-01 (I-01-02): runner NE smije biti root — non-root `node` korisnik.
# Server je read-only (samo čita dist/index.html), sluša port 3000 (>1024),
# pa mu root nigdje ne treba.
USER node

EXPOSE 3000

ENV PORT=3000
ENV INTERNAL_API_URL=http://backend:3000/api/v1

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "server/og-server.mjs"]
