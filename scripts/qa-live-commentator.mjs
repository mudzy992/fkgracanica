#!/usr/bin/env node
/** Ručni QA: komentator flow — start → gol → socket → end */
import { config as loadEnv } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { io } from 'socket.io-client';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../.env') });

// BE-09c/P-B09c-6: NEMA produkcijskog defaulta — skripta starta/golira/završava
// live utakmicu, pa cilj MORA biti eksplicitan (prije je default bio produkcijski
// URL, a ADMIN_PASSWORD se čitao iz .env-a → slučajno pokretanje = prava izmjena).
const API_BASE = (process.env.API_PUBLIC_URL ?? '').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const REALTIME_URL = process.env.VITE_REALTIME_URL ?? '';
const SOCKET_PATH = process.env.VITE_SOCKET_IO_PATH ?? '/backend/socket.io';
const ROUND_RAW = process.env.QA_MATCH_ROUND;
const TARGET_ROUND = Number(ROUND_RAW);

if (!API_BASE) {
  console.error(
    'API_PUBLIC_URL nije postavljen — skripta mijenja live utakmicu, pa cilj ' +
      'mora biti eksplicitan (npr. API_PUBLIC_URL=http://localhost:3000).',
  );
  process.exit(1);
}
if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD missing in .env');
  process.exit(1);
}
if (!Number.isInteger(TARGET_ROUND) || TARGET_ROUND <= 0) {
  console.error('QA_MATCH_ROUND mora biti pozitivan cijeli broj.');
  process.exit(1);
}

if (!process.argv.includes('--yes')) {
  console.error(
    `Potvrda nedostaje: skripta mijenja utakmicu kola ${TARGET_ROUND} na ${API_BASE}. ` +
      'Pokreni sa --yes ako je to zaista cilj.',
  );
  process.exit(1);
}

const API = `${API_BASE}/api/v1`;

async function api(method, path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return data;
}

function connectAndJoin(matchId) {
  return new Promise((resolve, reject) => {
    const socket = io(REALTIME_URL, { path: SOCKET_PATH, transports: ['websocket', 'polling'] });
    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error('socket connect timeout'));
    }, 10_000);
    socket.on('connect_error', (e) => { clearTimeout(timer); reject(e); });
    socket.on('connect', () => {
      socket.timeout(5000).emit('match:join', { matchId }, (err) => {
        clearTimeout(timer);
        if (err) reject(err);
        else resolve(socket);
      });
    });
  });
}

function waitForSocketEvent(socket) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('socket event timeout (15s)')), 15_000);
    const done = (label, payload) => { clearTimeout(timer); resolve({ label, payload }); };
    socket.once('match:score', (p) => done('match:score', p));
    socket.once('match:event', (p) => done('match:event', p));
  });
}

async function main() {
  console.log(`=== Live QA — kolo ${TARGET_ROUND} ===`);

  const login = await api('POST', '/auth/login', null, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = login.accessToken;
  console.log('✓ Admin login');

  const matches = await api('GET', '/matches', token);
  const match = matches.find((m) => m.round === TARGET_ROUND);
  if (!match) {
    console.error(`✗ Nema utakmice kolo ${TARGET_ROUND}`);
    process.exit(1);
  }
  console.log(`✓ Match ${match.id} status=${match.status}`);

  if (match.status !== 'SCHEDULED') {
    console.error(`✗ Očekivan status SCHEDULED — pokreni: QA_RESET=1 ./scripts/qa-live-reset.sh`);
    process.exit(1);
  }

  const socket = await connectAndJoin(match.id);
  console.log('✓ Socket joined room');
  const eventPromise = waitForSocketEvent(socket);

  await api('POST', `/live/matches/${match.id}/start`, token);
  console.log('✓ Start');

  await api('POST', `/live/matches/${match.id}/events`, token, {
    type: 'GOAL', minute: 67, teamSide: 'home', description: 'QA gol — ručni test',
  });
  console.log("✓ Gol 67'");

  const socketHit = await eventPromise;
  console.log(`✓ Socket ${socketHit.label}`, JSON.stringify(socketHit.payload));
  socket.emit('match:leave', { matchId: match.id });
  socket.disconnect();

  const updated = await api('GET', `/matches/${match.id}`, token);
  const events = updated.events?.length ?? 0;
  console.log(`✓ API: ${updated.homeScore}:${updated.awayScore} status=${updated.status} events=${events}`);

  if (updated.status === 'LIVE' || updated.status === 'HALFTIME') {
    await api('POST', `/live/matches/${match.id}/end`, token);
    console.log('✓ End');
  }

  console.log('✓ Health', (await api('GET', '/health', null)).status);

  const passed = updated.homeScore >= 1 && events >= 1;
  console.log(passed ? '\n=== QA PASSED ===' : '\n=== QA FAILED ===');
  process.exit(passed ? 0 : 1);
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
