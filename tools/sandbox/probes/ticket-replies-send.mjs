#!/usr/bin/env node
// tools/sandbox/probes/ticket-replies-send.mjs — post the ticket reply drafts after a release and close the tickets whose
// disposition says so.
//
// WHY. The 2.7 and 2.8 replies were posted by scratchpad loops that died with their sessions (EXP-0016); the readback probe
// (`ticket-replies-readback.mjs`) lives here, the sender did not. Dispositions live in `<dir>/DISPOSITIONS.md` (`| #N | close |
// reason |` / `| #N | keep-open | … |`); every `<dir>/<N>.md` is the exact comment text. A ticket whose last comment already
// equals its file is skipped (a re-run never posts twice). One `gh` process per action; the loop stops on the first failure.
//
// Usage: node tools/sandbox/probes/ticket-replies-send.mjs [dir] [--dry-run] [--repo owner/name]
//   `dir` defaults to reports/release_<major.minor of version.json>.
// [TESTED: 2026-10-16 ≈ 19:50 +03:00 · session 87, THIS file on reports/release_2.9: --dry-run named 40 posts and 31 closes;
//  the real run — "posted 40 · closed 31 · already posted 0 · drafts 40", exit 0; readback: all 40 replies equal their files,
//  9 kept open. The skip of an already-posted reply is not yet seen on a re-run]
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const ri = args.indexOf('--repo');
const repo = ri >= 0 ? args[ri + 1] : 'MikalaiKryvusha/KAIF';
const v = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8'));
const dir = resolve(ROOT, args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--repo') || join('reports', 'release_' + v.major + '.' + v.minor));
const dispFile = join(dir, 'DISPOSITIONS.md');
if (!existsSync(dispFile)) { console.log('SKIPPED — no ' + dispFile); process.exit(3); }
const disp = new Map();
for (const m of readFileSync(dispFile, 'utf8').matchAll(/^\| #(\d+) \| (close|keep-open) \|/gm)) disp.set(m[1], m[2]);
const norm = (s) => s.replace(/\r\n/g, '\n').trim();
const gh = (a) => execFileSync('gh', a, { encoding: 'utf8', maxBuffer: 1 << 26 });
const drafts = readdirSync(dir).filter((f) => /^\d+\.md$/.test(f)).map((f) => f.replace('.md', '')).sort((a, b) => a - b);
let posted = 0, closed = 0, skipped = 0;
for (const n of drafts) {
  const d = disp.get(n);
  if (!d) { console.log(`✖ #${n}: no disposition row — stop`); process.exit(1); }
  const file = join(dir, n + '.md');
  const view = JSON.parse(gh(['issue', 'view', n, '--repo', repo, '--json', 'state,comments']));
  const last = view.comments.length ? view.comments[view.comments.length - 1].body : '';
  if (norm(last) === norm(readFileSync(file, 'utf8'))) { skipped++; console.log(`· #${n}: reply already posted`); }
  else if (dry) console.log(`would post #${n} (${d})`);
  else { gh(['issue', 'comment', n, '--repo', repo, '--body-file', file]); posted++; console.log(`✓ #${n}: reply posted`); }
  if (d === 'close' && view.state !== 'CLOSED') {
    if (dry) console.log(`would close #${n}`);
    else { gh(['issue', 'close', n, '--repo', repo]); closed++; console.log(`✓ #${n}: closed`); }
  }
}
console.log(`${dry ? 'dry run — ' : ''}posted ${posted} · closed ${closed} · already posted ${skipped} · drafts ${drafts.length}`);
