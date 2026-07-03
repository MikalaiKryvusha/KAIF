#!/usr/bin/env node
// tools/commit.mjs
// Bump the build number in version.json, commit all changes with the project's
// commit style + Co-Authored-By trailer, and push. Usage:
//   node tools/commit.mjs "feat: <what was done>"
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const msg = process.argv.slice(2).join(' ').trim();
if (!msg) {
  console.error('usage: node tools/commit.mjs "<commit message>"');
  process.exit(1);
}

// Bump the internal build counter, preserving every other field of version.json.
// (The version shown anywhere is major.minor only — `build` is an internal counter.)
const vf = join(ROOT, 'version.json');
const v = JSON.parse(readFileSync(vf, 'utf8'));
v.build = (v.build || 0) + 1;
writeFileSync(vf, JSON.stringify(v, null, 2) + '\n');

const trailer = 'Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>';
const run = (c) => execSync(c, { cwd: ROOT, stdio: 'inherit' });

run('git add -A');
run(`git commit -m ${JSON.stringify(msg)} -m ${JSON.stringify(trailer)}`);
try {
  run('git push');
} catch {
  console.error('⚠️  push failed — try: gh auth setup-git ; git pull --rebase ; git push');
  process.exit(1);
}
console.log(`✅ committed & pushed (build ${v.build})`);
