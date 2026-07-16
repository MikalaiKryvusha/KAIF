#!/usr/bin/env node
// KAIF-LOADER.mjs — the minimal KAIF bootstrap loader (KAIF 1.5 "Thin KAIF").
// The AI agent writes THIS one small file verbatim from the thin KAIF.md and runs it.
// The loader fetches the heavy installer machinery from the KAIF origin repository,
// verifies it against the published manifest (sha256), and hands over to it.
// Zero dependencies: bare Node ≥18 (global fetch).
//
// Usage:
//   node KAIF-LOADER.mjs [--lang <code>] [--mode standard|anonymous] [--agents <list>]
//                        [--channel release|main] [--source <dir-or-url>] [--force]
//
//   --channel release  (default) fetch the latest published release assets (version-pinned set)
//   --channel main     fetch from the repo's main branch (dist/) — for development
//   --source <x>       explicit override: a local directory or URL base holding the three
//                      artifacts (kaif-manifest.json, KAIF-CORE.mjs, KAIF-CORE-BUNDLE.md)
//
// All other flags are passed through to KAIF-CORE.mjs install.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ORIGIN = 'https://github.com/MikalaiKryvusha/KAIF';
const SOURCES = {
  release: `${ORIGIN}/releases/latest/download`,
  main: 'https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/dist',
};
const ARTIFACTS = ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md'];
const INSTALL_DIR = '.kaif/install';
const CORE_DEST = '.kaif/kaif-core.mjs'; // the core lives on after install (kaif:* handles)

const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : null; };
const SOURCE = val('--source') || SOURCES[(val('--channel') || 'release').toLowerCase()] || SOURCES.release;
const isLocal = !/^https?:\/\//.test(SOURCE);

const log = (s) => console.log(s);
const die = (s) => { console.error('✖ KAIF-LOADER: ' + s); process.exit(1); };
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// Fetch one artifact from the source (URL or local directory) as a Buffer.
async function fetchOne(name) {
  if (isLocal) {
    const p = join(SOURCE, name);
    if (!existsSync(p)) die(`not found in --source: ${p}`);
    return readFileSync(p);
  }
  const url = `${SOURCE}/${name}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) die(`download failed (${res.status}) — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------- main
log(`KAIF-LOADER: fetching installer from ${SOURCE}`);
const manifest = JSON.parse((await fetchOne('kaif-manifest.json')).toString('utf8'));
mkdirSync(INSTALL_DIR, { recursive: true });

for (const name of ARTIFACTS) {
  const buf = await fetchOne(name);
  const want = manifest.sha256 && manifest.sha256[name];
  if (!want) die(`manifest carries no sha256 for ${name}`);
  const got = sha256(buf);
  if (got !== want) die(`sha256 mismatch for ${name}: expected ${want}, got ${got} — refusing to run it`);
  const dest = name === 'KAIF-CORE.mjs' ? CORE_DEST : join(INSTALL_DIR, name);
  writeFileSync(dest, buf);
  log(`+ ${dest} (${buf.length} bytes, sha256 ok)`);
}
log(`KAIF-LOADER: machinery ${manifest.version} verified — handing over to KAIF-CORE`);

// Hand over: core does everything else. Pass through the install parameters.
const passthrough = args.filter((a, i) =>
  !['--channel', '--source'].includes(a) && !['--channel', '--source'].includes(args[i - 1]));
const r = spawnSync(process.execPath, [CORE_DEST, 'install', '--bundle', join(INSTALL_DIR, 'KAIF-CORE-BUNDLE.md'), ...passthrough],
  { stdio: 'inherit' });
process.exit(r.status ?? 1);
