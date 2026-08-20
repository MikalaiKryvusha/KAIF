#!/usr/bin/env node
// KAIF-LOADER.mjs — the minimal KAIF bootstrap loader (thin-install architecture; version-neutral:
// the version being installed comes from the fetched kaif-manifest.json, never from this header).
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

const log = (s) => console.log(s);
const die = (s) => { console.error('✖ KAIF-LOADER: ' + s); process.exit(1); };
// Refusals that fire once the network flow has started must NOT process.exit(): live undici
// handles at exit trip a libuv assertion on win32 and dress one failure as two (issue #10).
// They print the same message and unwind via a sentinel; the loop then drains naturally.
const dieSoft = (s) => { console.error('✖ KAIF-LOADER: ' + s); const e = new Error(s); e.kaifDie = true; throw e; };

// A mistyped channel VALUE must refuse, not silently become "release" (bug 99.3 — the same
// bug-33 class one level below the flag whitelist, mirroring the core's own cmdUpdate check:
// the silent fallback served releases/latest to a user who asked for an unknown channel, and
// the only trace was a "machinery <version> verified" line easy to miss mid-output).
const chan = (val('--channel') || 'release').toLowerCase();
if (!(chan in SOURCES)) die(`unknown channel: ${chan} — known: ${Object.keys(SOURCES).join(' | ')}`);
const SOURCE = val('--source') || SOURCES[chan];
const isLocal = !/^https?:\/\//.test(SOURCE);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// Fetch one artifact from the source (URL or local directory) as a Buffer.
async function fetchOne(name) {
  if (isLocal) {
    const p = join(SOURCE, name);
    if (!existsSync(p)) dieSoft(`not found in --source: ${p}`);
    return readFileSync(p);
  }
  const url = `${SOURCE}/${name}`;
  let res;
  try { res = await fetch(url, { redirect: 'follow' }); }
  catch (err) {   // no-network/DNS failure: one refusal, not a raw stack (same issue #10 class)
    dieSoft(`download failed (${(err && err.cause && err.cause.code) || (err && err.message) || 'network error'}) — ${url}`);
  }
  if (!res.ok) {
    try { await res.body?.cancel(); } catch { /* draining a dead response is best-effort */ }
    dieSoft(`download failed (${res.status}) — ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------- main
try {
  log(`KAIF-LOADER: fetching installer from ${SOURCE}`);
  const manifest = JSON.parse((await fetchOne('kaif-manifest.json')).toString('utf8'));
  mkdirSync(INSTALL_DIR, { recursive: true });

  for (const name of ARTIFACTS) {
    const buf = await fetchOne(name);
    const want = manifest.sha256 && manifest.sha256[name];
    if (!want) dieSoft(`manifest carries no sha256 for ${name}`);
    const got = sha256(buf);
    if (got !== want) dieSoft(`sha256 mismatch for ${name}: expected ${want}, got ${got} — refusing to run it.\n` +
      `  Most likely cause on --channel main: the GitHub raw CDN caches files independently, so right after\n` +
      `  a push the set can be temporarily skewed (bug 04). FIX: retry in a few minutes, or pin an immutable\n` +
      `  source to a commit:  node KAIF-LOADER.mjs --source ${SOURCES.main.replace('/main/', '/<full-commit-sha>/')} [your flags]\n` +
      `  NEVER bypass the checksum — this gate is what keeps a broken set from being installed.`);
    const dest = name === 'KAIF-CORE.mjs' ? CORE_DEST : join(INSTALL_DIR, name);
    writeFileSync(dest, buf);
    log(`+ ${dest} (${buf.length} bytes, sha256 ok)`);
  }
  log(`KAIF-LOADER: machinery ${manifest.version} verified — handing over to KAIF-CORE`);
} catch (e) {
  if (!(e && e.kaifDie)) throw e;   // real bugs keep their stack — only the soft-die sentinel is expected
  process.exitCode = 1;             // message already printed; the loop drains and the process ends red
}

if (!process.exitCode) {
  // Hand over: core does everything else. Pass through the install parameters.
  // The hard exit here is safe: spawnSync blocks far past the fetch sockets' unref.
  const passthrough = args.filter((a, i) =>
    !['--channel', '--source'].includes(a) && !['--channel', '--source'].includes(args[i - 1]));
  const r = spawnSync(process.execPath, [CORE_DEST, 'install', '--bundle', join(INSTALL_DIR, 'KAIF-CORE-BUNDLE.md'), ...passthrough],
    { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}
