#!/usr/bin/env node
// tools/kaif.mjs — KAIF lifecycle handles (idea 04), exposed via `npm run kaif:*`.
//   version | check  — fully implemented.
//   update | fork | switch-origin | remove | remove-all — print the respectful procedure and defer the
//   project-specific steps to the matching /kaif-* agent skill (the skill performs them safely in context).
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cmd = (process.argv[2] || 'version').toLowerCase();

const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const marker = () => readJson(join(ROOT, '.kaif', 'kaif.json'));
const ver = () => { const v = readJson(join(ROOT, 'version.json')); return v ? `${v.major}.${v.minor}.${v.patch ?? 0}` : null; };

function guide(skill, what) {
  console.log(`KAIF lifecycle — ${what}.`);
  console.log('This is a project-specific, respectful operation. Run it through the agent skill:');
  console.log(`   /${skill}`);
  console.log('The skill performs the step by step, preserving your project and its content artifacts.');
  console.log(`(See .claude/skills/${skill}/SKILL.md, or the matching section of FRAMEWORK.md.)`);
}

switch (cmd) {
  case 'version': {
    const m = marker(), v = ver();
    if (m) {
      console.log(`KAIF ${m.version} (${m.released}) · tracking=${m.tracking} · origin=${m.origin}` +
        (m.sphere ? ` · sphere=${m.sphere}` : '') + (m.agent ? ` · agent=${m.agent}` : ''));
    } else if (v) {
      console.log(`KAIF ${v} (origin repo; no .kaif/kaif.json marker present)`);
    } else {
      console.log('KAIF version unknown (no version.json / .kaif marker).');
    }
    console.log('Check origin for a newer release with the /kaif-version skill, or:');
    console.log('  gh release view --repo MikalaiKryvusha/KAIF --json tagName,publishedAt');
    break;
  }
  case 'check':
    try { execSync('node ' + JSON.stringify(join(ROOT, 'tools', 'check-framework.mjs')), { stdio: 'inherit' }); }
    catch { process.exit(1); }
    break;
  case 'update': guide('kaif-update', 'respectful migration update from origin'); break;
  case 'fork': guide('kaif-fork', 'snapshot KAIF into your own repo and track it'); break;
  case 'switch-origin': guide('kaif-switch-origin', 'switch tracking back to the official origin'); break;
  case 'remove': guide('kaif-remove', 'respectful removal (partial — keeps content artifacts)'); break;
  case 'remove-all': guide('kaif-remove', 'full respectful removal (core + artifacts; project preserved)'); break;
  default:
    console.log('usage: node tools/kaif.mjs <version|check|update|fork|switch-origin|remove|remove-all>');
}
