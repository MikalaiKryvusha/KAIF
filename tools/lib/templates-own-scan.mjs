// tools/lib/templates-own-scan.mjs — the shipped templates do not redden their own scan (2.8, epic SC; findings K-R4 · K-R5; plans/123
// SC3, criterion 18 of plans/117). ONE function for the build's guard (check-framework 5m) and for its proof (probe sc3-guard-mutants):
// every deployed file of a dist bundle is written as an English deployment carries it (language-pack sources and the bundle meta are
// inputs, not deployed files) into a temp dir without git, and the dist's OWN core runs its read-only `stale-claims` over it with the
// NEXT version as the target. Every line it names would be named in EVERY deployment's update task — a template line is identical in
// all of them — so the build refuses them. A correct historical line is reworded or takes <!-- KAIF-VERSION-OK: reason -->.
// [TESTED: 2026-09-26 03:02:57 +03:00 · the build's 5m silent on the built templates; --selftest four answers; probe sc3-guard-mutants
//  (control 0 · wrapped-parenthesis rule removed → 3 real template lines · planted line → 1); the build on that mutant — exit 1
//  (03:03:13); report testcases/reports/2026-09-26_sc3-templates-silent-under-own-scan.md]
import { readFileSync, writeFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const BLOCK_RE = /^> \*\*FILE: `([^`]+)`\*\*[^\n]*\r?\n\r?\n``````\w*\r?\n([\s\S]*?)\r?\n``````\s*$/gm;

// the next minor after `version` ("2.7" → "2.8"): the target the next release's field update scans with
export const nextVersion = (version) => { const [a, b] = String(version).split('.').map(Number); return `${a}.${b + 1}`; };

// → { lines: [the named template lines], failed: '' | why the scan itself did not complete }
export function templatesOwnScan(distDir, version) {
  const bundle = readFileSync(join(distDir, 'KAIF-CORE-BUNDLE.md'), 'utf8');
  const root = mkdtempSync(join(tmpdir(), 'kaif-own-scan-'));
  try {
    for (const m of bundle.matchAll(BLOCK_RE)) {
      const [, p, body] = m;
      if (p === 'kaif-bundle-manifest.json' || p.startsWith('templates/languages/')) continue;
      mkdirSync(dirname(join(root, p)), { recursive: true });
      writeFileSync(join(root, p), body.replace(/\r\n/g, '\n') + '\n');
    }
    let out = '', code = 0;
    try { out = execFileSync(process.execPath, [join(distDir, 'KAIF-CORE.mjs'), 'stale-claims', '--from', String(version), '--to', nextVersion(version)], { cwd: root, stdio: 'pipe', maxBuffer: 1 << 26 }).toString(); }
    catch (e) { code = e.status ?? 1; out = String(e.stdout || '') + String(e.stderr || ''); }
    const lines = out.split(/\r?\n/).filter((l) => /^\s+· /.test(l) && !/· (shown |walk: )/.test(l)).map((l) => l.trim().replace(/^· /, ''));
    const summary = out.split(/\r?\n/).some((l) => /^stale-claims \S+ → \S+: \d+ line\(s\)/.test(l));
    return { lines, failed: code !== 0 || !summary ? `the scan did not complete (exit ${code}): ${out.trim().split('\n').slice(-2).join(' / ').slice(0, 200)}` : '' };
  } finally { rmSync(root, { recursive: true, force: true }); }
}
