const backend = new URL(process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:3000');
if (backend.protocol !== 'http:' || backend.hostname !== '127.0.0.1' || backend.pathname !== '/' || backend.search || backend.hash || backend.username || backend.password) {
  throw new Error('Health check dopušta samo izolovani backend na 127.0.0.1');
}
const deadline = Date.now() + 60_000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch(new URL('/api/v1/health', backend), { signal: AbortSignal.timeout(1500) });
    if (response.ok && (await response.json()).status === 'ok') {
      ready = true;
      break;
    }
  } catch { /* čekaj startup i dostupnu bazu, ne samo HTTP 200 */ }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!ready) throw new Error('Izolovani backend nije postao spreman (health status != ok)');
console.log('Izolovani backend i Postgres health: ok');
