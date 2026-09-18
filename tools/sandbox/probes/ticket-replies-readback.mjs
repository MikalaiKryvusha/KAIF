#!/usr/bin/env node
// tools/sandbox/probes/ticket-replies-readback.mjs — read the published ticket replies BACK: for every draft <N>.md the
// last comment of issue N equals the file (trimmed, CRLF-normalised) and the issue is CLOSED.
//
// WHY. "Sent" is what the command returned; "delivered as written" is what the tracker shows. Checking the source is not
// checking the publication (AGENT_GUIDE → showcase rule 10, EXP-0071) — this reads the carrier. Read-only: `gh issue view`.
//
// Usage: node tools/sandbox/probes/ticket-replies-readback.mjs [dir] [--repo owner/name]
//   `dir` defaults to reports/release_<major.minor of version.json>; the repo — MikalaiKryvusha/KAIF.
// [TESTED: 2026-09-18 17:32 +03:00 · session 69, THIS file after answering and closing #54–#71: "all 18: closed, replies
//  equal their files", exit 0 (its scratchpad twin gave the same at ≈ 17:26; `gh issue list --state open` → 0). Not yet seen
//  red on a real mismatch. Report: testcases/reports/2026-09-18_release-2.7.md, runs 20 and 21]
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const args = process.argv.slice(2);
const ri = args.indexOf('--repo');
const repo = ri >= 0 ? args[ri + 1] : 'MikalaiKryvusha/KAIF';
const v = JSON.parse(readFileSync(join(ROOT, 'version.json'), 'utf8'));
const dir = resolve(ROOT, args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--repo') || join('reports', 'release_' + v.major + '.' + v.minor));
if (!existsSync(dir)) { console.log('SKIPPED — no drafts directory ' + dir); process.exit(3); }
const norm = (s) => s.replace(/\r\n/g, '\n').trim();
let bad = 0, n = 0;
for (const f of readdirSync(dir).filter((x) => /^\d+\.md$/.test(x)).sort((a, b) => parseInt(a, 10) - parseInt(b, 10))) {
  const num = parseInt(f, 10); n++;
  const j = JSON.parse(execFileSync('gh', ['issue', 'view', String(num), '--repo', repo, '--json', 'state,comments'], { encoding: 'utf8' }));
  const body = (j.comments[j.comments.length - 1] || {}).body || '';
  const same = norm(body) === norm(readFileSync(join(dir, f), 'utf8'));
  if (!same || j.state !== 'CLOSED') bad++;
  console.log('#' + num + ' ' + j.state + ' · reply ' + (same ? 'equals the file' : 'DIFFERS from the file') + ' (' + norm(body).length + ' chars)');
}
console.log(bad ? 'MISMATCH: ' + bad + ' of ' + n : 'all ' + n + ': closed, replies equal their files');
process.exit(bad ? 1 : 0);
