# syntax=docker/dockerfile:1
# INF-01 (I-01-08): bez `npm install --package-lock-only` — gradnja više ne
# regenerise package-lock.json unutar slike (lock u repoju je izvor istine,
# `npm ci` ionako poštuje postojeći lock).

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install express@4.21.2

COPY --from=builder /app/dist ./dist
COPY server ./server

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