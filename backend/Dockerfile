# syntax=docker/dockerfile:1.6
# P-CI04-1 (2026-11-13): backend se gradi iz **root** konteksta (npm workspace)
# — isti `package-lock.json` kao CI i frontend (prije: ./backend sa zasebnim
# backend/package-lock.json koji je tiho driftovao, vidi CI-04/B-CI04-01 i
# INF-01/F-019). Frontend je već prebačen na root u CI-04; backend je bio
# posljednji standalone lock (P-CI04-1).

FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
# Manifesti svih workspace-a: `npm ci` validira cijeli tree iz root locka.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY mobile/package.json ./mobile/
# P-CI04-2 napredno (a) BuildKit cache — `npm ci` kešira tarball-ove u
# BuildKit cache mountu (`/root/.npm`), pa Coolify redeploy bez promjene
# locka preskače download (2-3 min → ~20 s). Zahtijeva DOCKER_BUILDKIT=1
# (Coolify ga pali automatski od Docker 23; lokalno `DOCKER_BUILDKIT=1`
# `docker compose build`). Bez BuildKita fallback je običan `npm ci`.
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM deps AS build
WORKDIR /app
COPY backend ./backend
# BE-09c/P-B09c-2 + CI-04/B-CI04-02: build NE dobija `DATABASE_URL`.
# Prije je postojao build-arg; Coolify (docker-compose pack) izvozi `build.args`
# u okruženje i za `up`, pa je taj dummy završio kao RUNTIME env i Prisma je
# javljala `P1001 ... at build-arg-dummy.invalid:5432`. `prisma generate` ne
# otvara konekciju — `backend/prisma.config.ts` uzima placeholder ako varijable
# nema. Prava vrijednost dolazi samo iz runtime `environment:` bloka, a provjerava
# je `docker-entrypoint.sh`.
RUN npm run db:generate
RUN npm run build -w backend

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
# Root lock + hoistane zavisnosti (prune uklanja devDeps svih workspace-a).
# FIX 2026-11-13: migrator je pao sa `Cannot find module 'dotenv'` + `npx` je vukao
# `prisma@8.0.0-rc.33` jer `npm prune` u /app sa samo root manifestima briše
# backend deps (dotenv, prisma, @prisma/* nisu u root package.json). Zato prije
# prune-a kopiramo i workspace manifeste — `npm prune` tada zna da zadrži
# production deps svih workspace-a.
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY --from=build /app/mobile/package.json ./mobile/package.json
COPY --from=build /app/node_modules ./node_modules
# BE-09c/P-B09c-3: devDependencies (jest, eslint, ts-node, typescript) ne idu u
# produkcijsku sliku. `prisma` CLI ostaje jer ga CMD koristi za `migrate deploy`.
RUN npm prune --omit=dev
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/backend/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=build /app/backend/docker-migrate.sh ./docker-migrate.sh
RUN mkdir -p /app/uploads && chmod +x /app/docker-entrypoint.sh /app/docker-migrate.sh && chown -R app:app /app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "docker-entrypoint.sh"]
