/**
 * Tipizirana konfiguracija backend servisa (BE-01 / P2 — odobreno).
 *
 * Jedino mjesto koje pretvara sirovi env (process.env / .env) u objekat s
 * poznatim ključevima; čita se preko globalnog ConfigService:
 *   config.get<number>('port'), config.get<string>('databaseUrl'), …
 *
 * Konvencija (docs/BACKEND.md):
 *  - nova env varijabla → ovdje + `env.validate.ts` (ako je obavezna) + `.env.example`;
 *  - direktni `process.env` u modulima je PRIVREMEN i smije ostati samo dok
 *    odgovarajući BE segment (BE-06/BE-07) ne preuzme konfiguraciju.
 *
 * Napomena: ConfigService i dalje razvija i RAW ključeve iz process.env
 * (npr. `config.get('JWT_ACCESS_SECRET')`) — postojeći pozivi u auth/ i
 * drugim modulima nastavljaju raditi netaknuto do svojih segmenta.
 */
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),

  // Baza
  databaseUrl: process.env.DATABASE_URL,
  dbProvider: process.env.DB_PROVIDER ?? 'postgres',

  // Redis (opciono — app radi i bez njega)
  redisUrl: process.env.REDIS_URL,
  redisTlsCa: process.env.REDIS_TLS_CA,

  // JWT (obavezno — vidi env.validate.ts)
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',

  // Ostalo
  uploadPath: process.env.UPLOAD_PATH ?? './uploads',
  corsOrigins: process.env.CORS_ORIGINS ?? 'http://localhost:5173',
  apiPublicUrl: process.env.API_PUBLIC_URL,
  socketIoPath: process.env.SOCKET_IO_PATH ?? '/socket.io',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,

  // P-CI04-2 napredno: izolacija BullMQ workera.
  // JOBS_MODE=both (default, unutar jednog procesa — dev/test),
  // JOBS_MODE=api   (samo Queue, bez Workera — backend servis),
  // JOBS_MODE=worker(samo Worker, bez Queue — worker servis).
  jobsMode: (process.env.JOBS_MODE ?? 'both').toLowerCase(),
});
