// tools/sandbox/probes/contour-answer-survives/strings.mjs — PROBE (not a polygon suite), researches/31 · issue #66:
// lists Edge feature names about sign-in/sync from msedge.dll (names are version-specific — re-read, never guess).
//   node tools/sandbox/probes/contour-answer-survives/strings.mjs
// [TESTED: 2026-09-13 · session 64 on Edge 153.0.4234.32 — testcases/reports/2026-09-13_probe-contour-answer-survives-kill.md]
import { readFileSync, readdirSync } from 'node:fs';
const base = 'C:/Program Files (x86)/Microsoft/Edge/Application/';
const ver = readdirSync(base).filter((d) => /^\d+\./.test(d)).sort().pop();
const buf = readFileSync(base + ver + '/msedge.dll');
const s = buf.toString('latin1');
const hits = new Set();
for (const m of s.matchAll(/[\x20-\x7e]{6,120}/g)) if (/^ms[A-Za-z]*(Implicit|SignIn|Signin|SyncConsent|FirstRun|Fre[A-Z])[A-Za-z]*$/.test(m[0])) hits.add(m[0]);
console.log('edge', ver, 'hits', hits.size);
for (const h of [...hits].sort()) console.log(h);
