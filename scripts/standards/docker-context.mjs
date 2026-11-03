#!/usr/bin/env node
/**
 * docker-context — provjera da Docker build kontekst i `COPY` putanje postoje.
 *
 * ZAŠTO: 2026-11-03 je Coolify deploy pao (`npm ci` EUSAGE) jer je
 * `frontend/Dockerfile` gradio iz `./frontend` sa **zasebnim** (zarašlim)
 * `frontend/package-lock.json`, dok root `npm install -w frontend` ažurira samo
 * root lock (npm workspace). Ovaj check hvata obje klase problema:
 *
 *   1. `COPY <putanja>` u Dockerfile-u pokazuje na nepostojeći fajl/direktorij
 *   2. postoji per-workspace lock (`frontend/package-lock.json`) za workspace
 *      koji se NE gradi iz svog konteksta — takav lock niko ne ažurira i tiho
 *      se razilazi sa `package.json` (tačno uzrok pomenutog pada)
 *
 * KAKO: parsira `docker-compose.yml` (build.context + build.dockerfile) i
 * `package.json` → `workspaces`. Nema zavisnosti (bez yaml parsera).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Vrati [{ service, context, dockerfile }] iz docker-compose.yml. */
function builds() {
  const text = readFileSync(join(ROOT, 'docker-compose.yml'), 'utf8').split('\n');
  const out = [];
  let service = null;
  let context = null;
  let dockerfile = null;
  const flush = () => {
    if (service && context) out.push({ service, context, dockerfile: dockerfile ?? 'Dockerfile' });
    service = null;
    context = null;
    dockerfile = null;
  };
  for (const line of text) {
    const svc = /^ {2}([a-z0-9-]+):\s*$/.exec(line);
    if (svc && !/^ {4}/.test(line)) {
      flush();
      service = svc[1];
      continue;
    }
    const ctx = /^\s{6}context:\s*(\S+)\s*$/.exec(line);
    if (ctx) context = ctx[1];
    const df = /^\s{6}dockerfile:\s*(\S+)\s*$/.exec(line);
    if (df) dockerfile = df[1];
  }
  flush();
  return out;
}

/** COPY izvori iz Dockerfile-a (bez `--from=` i bez varijabli/URL-ova). */
function copySources(dockerfilePath) {
  const sources = [];
  for (const line of readFileSync(dockerfilePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!/^COPY\s/i.test(trimmed) || /^COPY\s+--from=/i.test(trimmed)) continue;
    const parts = trimmed.replace(/\s+#.*$/, '').split(/\s+/).slice(1);
    for (const part of parts.slice(0, -1)) {
      if (part.startsWith('--') || part.includes('$') || /^https?:/.test(part)) continue;
      sources.push(part);
    }
  }
  return sources;
}

const errors = [];

for (const { service, context, dockerfile } of builds()) {
  const contextDir = resolve(ROOT, context);
  const dockerfilePath = resolve(contextDir, dockerfile);
  if (!existsSync(dockerfilePath)) {
    errors.push({
      where: `${context}/${dockerfile}`,
      why: `Dockerfile za servis \`${service}\` ne postoji u kontekstu \`${context}\``,
      how: 'popravi `build.context`/`build.dockerfile` u docker-compose.yml',
    });
    continue;
  }
  for (const source of copySources(dockerfilePath)) {
    if (!existsSync(join(contextDir, source))) {
      errors.push({
        where: `${context}/${dockerfile}: COPY ${source}`,
        why: 'putanja ne postoji u build kontekstu (Docker build bi pao)',
        how: 'ispravi putanju ili `build.context` u docker-compose.yml',
      });
    }
  }
}

// CI-04/B-CI04-02: build-argovi ne smiju nositi tajne ni `DATABASE_URL`.
// Coolify (docker-compose pack) izvozi `build.args` u okruženje i za `up`, pa
// build-arg pregazi runtime env iz `environment:` bloka -> `P1001` na dummy host.
const FORBIDDEN_ARG = /(DATABASE_URL|REDIS_URL|PASSWORD|SECRET|TOKEN|_KEY)/i;

/** `build.args` ključevi iz docker-compose.yml (samo unutar `args:` bloka). */
function composeBuildArgs() {
  const out = [];
  let argsIndent = null; // indentacija ključeva unutar `args:`
  readFileSync(join(ROOT, 'docker-compose.yml'), 'utf8')
    .split('\n')
    .forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const indent = line.length - line.trimStart().length;
      if (/^args:\s*$/.test(trimmed)) {
        argsIndent = null; // postavlja se prvim ključem ispod
        argsIndent = indent + 2;
        return;
      }
      if (argsIndent !== null) {
        const key = new RegExp(`^ {${argsIndent}}([A-Za-z0-9_]+):`).exec(line)?.[1];
        if (key) {
          out.push({ key, line: index + 1 });
          return;
        }
        if (indent < argsIndent) argsIndent = null; // izašli smo iz args bloka
      }
    });
  return out;
}

/** `ARG` deklaracije iz Dockerfile-ova. */
function dockerfileArgs(file) {
  return readFileSync(join(ROOT, file), 'utf8')
    .split('\n')
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter(({ text }) => /^ARG\s+[A-Z0-9_]+/.test(text))
    .map(({ line, text }) => ({ key: /^ARG\s+([A-Z0-9_]+)/.exec(text)[1], line }));
}

for (const { key, line } of composeBuildArgs()) {
  if (!FORBIDDEN_ARG.test(key)) continue;
  errors.push({
    where: `docker-compose.yml:${line} → build.args ${key}`,
    why: 'Coolify izvozi build-args i u runtime env, pa pregaze pravu vrijednost iz `environment:` (uzrok P1001 na dummy hostu)',
    how: 'ukloni iz `build.args`; vrijednost daj samo kroz runtime `environment:` (vidi AUDIT/segments/CI-04.md)',
  });
}

for (const file of ['backend/Dockerfile', 'frontend/Dockerfile']) {
  if (!existsSync(join(ROOT, file))) continue;
  for (const { key, line } of dockerfileArgs(file)) {
    if (!FORBIDDEN_ARG.test(key)) continue;
    errors.push({
      where: `${file}:${line} → ARG ${key}`,
      why: 'build-arg sa URL-om/tajnom: može završiti u slici ili pregaziti runtime env',
      how: 'ukloni ARG; pravu vrijednost daj kroz runtime `environment:`',
    });
  }
}

// Per-workspace lockovi koji se ne koriste (workspace se gradi iz root konteksta).
const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const workspaces = (rootPkg.workspaces ?? []).map((ws) => ws.replace(/\/$/, ''));
const ownContext = new Set(
  builds()
    .map((b) => b.context.replace(/^\.\//, ''))
    .filter((c) => c && c !== '.'),
);
for (const ws of workspaces) {
  if (ownContext.has(ws)) continue;
  if (existsSync(join(ROOT, ws, 'package-lock.json'))) {
    errors.push({
      where: `${ws}/package-lock.json`,
      why: `\`${ws}\` se gradi iz root konteksta (root lock), a ima i svoj lock koji niko ne ažurira → drift i \`npm ci\` EUSAGE na deployu`,
      how: `obriši \`${ws}/package-lock.json\` (root \`package-lock.json\` je jedini izvor istine)`,
    });
  }
}

if (errors.length) {
  for (const e of errors) {
    console.error(`✗ ${e.where}\n  ZAŠTO: ${e.why}\n  KAKO:  ${e.how}\n`);
  }
  console.error(`docker-context: ${errors.length} problem(a)`);
  process.exit(1);
}

const list = builds()
  .map((b) => `${b.service}(${b.context})`)
  .join(', ');
console.log(`docker-context: OK (${list}; ${workspaces.length} workspace-a bez stranog locka)`);
