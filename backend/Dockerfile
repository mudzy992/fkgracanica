# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
# BE-09c/P-B09c-2: `DATABASE_URL` se koristi SAMO za `prisma generate` (kojem ne
# treba živa baza) i NE ostaje u slici — prije je `ENV DATABASE_URL=$DATABASE_URL`
# upisivao produkcijske kredencijale u slojeve slike (`docker history`).
ARG DATABASE_URL=postgresql://build:build@localhost:5432/fkgracanica
RUN DATABASE_URL="$DATABASE_URL" npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
# BE-09c/P-B09c-3: devDependencies (jest, eslint, ts-node, typescript) ne idu u
# produkcijsku sliku. `prisma` CLI ostaje jer ga CMD koristi za `migrate deploy`.
RUN npm prune --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
RUN mkdir -p /app/uploads && chown -R app:app /app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
