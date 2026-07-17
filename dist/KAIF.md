<!-- GENERATED FILE — do not edit by hand. Built from framework/installer/_thin-intro.md by tools/build-framework.mjs. Edit the source and re-run the tool. -->
# KAIF — Krinik AI Framework · the entry point · v1.4

> **You are reading an installer bootstrap.** KAIF is a context-resilient, autonomy-disciplined
> operating framework for the human–AI tandem: externalized memory, accumulated knowledge, bounded
> autonomy, execution discipline (the fable loop), all as files an agent reads. This document does NOT
> carry the framework — it fetches the **installer machinery** from the origin repository, which then
> deploys KAIF into your project mechanically, leaving the AI agent only one short adaptation task.
>
> **Author:** Mikalai Kryvusha aka **KOT KRINIK** · **License:** MIT ·
> **Repo:** https://github.com/MikalaiKryvusha/KAIF
> 🌐 Installing needs the network (it fetches from the repo). Fully offline? Use the `KAIF-FULL.md`
> asset attached to every release — the classic self-contained core.

---

## 1. For the human (owner) — quick start

1. Put this `KAIF.md` in your project root.
2. Tell your agent: *"Read KAIF.md and unpack the KAIF framework into this project."*
   Add, if you wish:
   - **Working language** (default English): *"Working language: Russian."* — owner-facing docs come
     out in your language; agent-internal docs stay English (LLMs read it best).
   - **Install mode** (default standard): *"Install mode: anonymous."* — deploys with no origin
     tracking and no author references, by design.
3. The machinery deploys everything (docs, skills for **five agent systems at once** — Claude Code,
   Codex, Grok Build, Cline, Zoo Code — plus a universal `AGENTS.md`), then your agent performs one
   final adaptation pass (understanding your project) and self-cleans the installer.

**`GOAL.md` — write it first if you can**: your one-paragraph vision (what you want, for whom). The
agent orients the whole deployment around it; a template is seeded if it's missing.

## 2. For the AI agent — the bootstrap (three steps, each with a checkpoint)

Your ENTIRE job before the machinery takes over is the three steps below. After each step print its
`KAIF-BOOT:` checkpoint line **verbatim** — a bootstrap report without all three lines is incomplete.
Do not paraphrase the loader, do not improvise paths, do not skip a checkpoint.

**Step 1 — Node.js.** Run `node -v`. If Node ≥18 is present, print: `KAIF-BOOT: node <version>`.
If absent: do NOT install silently — ask the owner for consent, then install via the platform's package
manager (`winget install OpenJS.NodeJS.LTS` / `brew install node` / `sudo apt install nodejs npm`) or
point them to https://nodejs.org. Re-run `node -v`, then print the checkpoint.

**Step 2 — the loader.** Create the file `KAIF-LOADER.mjs` in the project root with EXACTLY the
content of the `FILE:` block below (verbatim — the label is law). Then print:
`KAIF-BOOT: loader written`.

**Step 3 — hand over.** Run (substituting the owner's parameters; omit what they didn't set):

```bash
node KAIF-LOADER.mjs --lang <code> --mode <standard|anonymous>
```

The loader fetches the machinery from the origin (sha256-verified), and the machinery deploys KAIF
mechanically. On exit code 0 print: `KAIF-BOOT: loader exit 0`. On failure: show the error, fix the
environment (network? Node version?), retry; after 3 failed attempts stop and hand back to the owner.
NEVER bypass the checksum gate. If you see `sha256 mismatch` on `--channel main` (a dev-only channel:
the raw CDN caches files independently and can serve a temporarily skewed set right after a push),
follow the error's hint — retry later or pin `--source` to a full commit SHA. The default release
channel is immutable and has no such skew.

**Then — your one cognitive task.** The machinery leaves `KAIF_ADAPTATION_TASK.md` in the root: a short
checklist (study the project, fill what only understanding can fill) where every item carries a forced
`KAIF-ADAPT:` checkpoint. Work it, then run `node .kaif/kaif-core.mjs verify-final` — it verifies the
checkpoints mechanically and self-cleans the installer (including this file). Commit `chore: deploy KAIF`.

> **FILE: `KAIF-LOADER.mjs`** — project root — write this ONE file verbatim, then run it (removed again by verify-final)

``````js
#!/usr/bin/env node
// KAIF-LOADER.mjs — the minimal KAIF bootstrap loader (KAIF 1.5 — Tested KAIF; thin-install architecture).
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
  if (got !== want) die(`sha256 mismatch for ${name}: expected ${want}, got ${got} — refusing to run it.\n` +
    `  Most likely cause on --channel main: the GitHub raw CDN caches files independently, so right after\n` +
    `  a push the set can be temporarily skewed (bug 04). FIX: retry in a few minutes, or pin an immutable\n` +
    `  source to a commit:  node KAIF-LOADER.mjs --source ${SOURCES.main.replace('/main/', '/<full-commit-sha>/')} [your flags]\n` +
    `  NEVER bypass the checksum — this gate is what keeps a broken set from being installed.`);
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
``````


## 3. What gets deployed (so you know what "done" looks like)

```
<project root>/
├── AGENT_GUIDE.md · PHILOSOPHY.md · BUG_FIXING_FRAMEWORK.md · GOAL.md · STATUS.md
├── EXPERIENCE.md · MASTER_PLAN.md · the two project maps · KAIF_FRAMEWORK.md (last)
├── plans/ ideas/ bugs/ researches/ interviews/ homeworks/     (each with its README)
├── .claude/skills/  .agents/skills/  .grok/skills/  .cline/skills/  .roo/commands/
├── AGENTS.md · CLAUDE.md · .clinerules/ · .roo/rules/          (context pointers)
└── .kaif/  (kaif.json marker · kaif-core.mjs — backs the kaif:* npm handles · spheres/)
```

The framework then runs on its skills: `/resume`, `/pause`, the autonomous loops, `/report-bug`,
`/propose-idea`, `/interview`, the fable family (`/fable-method`, `/fable-loop`, `/fable-judge`,
`/fable-domain`), the lifecycle (`/kaif-version`, `/kaif-update`, `/kaif-fork`, `/kaif-remove`), and more.

---

MIT License — © 2026 **Mikalai Kryvusha (KOT KRINIK)**. The execution-discipline skills (`fable-*`) are
vendored from [fable-method](https://github.com/Sahir619/fable-method) © Sahir619, MIT.
v1.4 · released 2026-07-08 · origin https://github.com/MikalaiKryvusha/KAIF
