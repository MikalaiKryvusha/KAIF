#!/usr/bin/env node
// KA8 / plans/136 criterion 40: three install findings, each green on this build and red on its exact pre-fix construct.
// --broken maps|voice|sync mutates only the temporary dist copy. The source tree is read-only.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const broken = process.argv[2] === '--broken' ? process.argv[3] : '';
if (broken && !['maps', 'voice', 'sync'].includes(broken)) { console.log('usage: ka8-install-findings.mjs [--broken maps|voice|sync]'); process.exit(2); }
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const work = mkdtempSync(join(tmpdir(), 'kaif-ka8-'));
let failed = 0;
const verdict = (ok, name, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok || !detail ? '' : ' · ' + detail}`); if (!ok) failed++; };
try {
  const dist = join(work, 'dist'); mkdirSync(dist);
  for (const f of ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md']) cpSync(join(source, 'dist', f), join(dist, f));
  const corePath = join(dist, 'KAIF-CORE.mjs'), bundlePath = join(dist, 'KAIF-CORE-BUNDLE.md');
  if (broken === 'maps') {
    const text = readFileSync(corePath, 'utf8');
    const cut = text.match(/  if \(id === 'maps'\) \{[\s\S]*?\n  \}\n(?=  if \(id === 'recheck'\))/);
    if (!cut) throw new Error('the maps mutation did not apply');
    writeFileSync(corePath, text.replace(cut[0], ''));
  }
  if (broken === 'sync') {
    const text = readFileSync(corePath, 'utf8');
    const tail = ' — normal until re-sync; run \\`node .kaif/kaif-core.mjs sync\\` (update-verify re-syncs automatically)';
    if (!text.includes(tail)) throw new Error('the sync mutation did not apply');
    writeFileSync(corePath, text.replace(tail, ' — normal until re-sync'));
  }
  if (broken === 'voice') {
    const text = readFileSync(bundlePath, 'utf8');
    const pairs = [
      ['# KAIF в <PROJECT_NAME> — развёрнутый фреймворк', '# KAIF в <PROJECT_NAME> — фреймворк, развёрнутый здесь'],
      ['## Что KAIF даёт проекту', '## Зачем он здесь — что он даёт проекту'],
      ['## Устройство KAIF в этом проекте', '## Как это работает здесь — движущиеся части'],
    ];
    let mutated = text;
    for (const [from, to] of pairs) { if (!mutated.includes(from)) throw new Error('the voice mutation did not apply'); mutated = mutated.split(from).join(to); }
    writeFileSync(bundlePath, mutated);
  }

  const project = join(work, 'project'); mkdirSync(join(project, '.kaif', 'install'), { recursive: true });
  cpSync(bundlePath, join(project, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  cpSync(corePath, join(project, '.kaif', 'kaif-core.mjs'));
  const run = (args) => spawnSync(process.execPath, [join(project, '.kaif', 'kaif-core.mjs'), ...args], { cwd: project, encoding: 'utf8', timeout: 30000,
    env: { ...process.env, KIMI_CODE_HOME: join(work, 'no-kimi-home') } });
  const out = (r) => String(r.stdout || '') + String(r.stderr || '');
  const installed = run(['install', '--lang', 'ru', '--agents', 'kimi-code']);
  verdict(installed.status === 0, 'fresh Russian Kimi install', out(installed).slice(-300));

  const mapsBefore = run(['checkpoint', 'maps']);
  for (const map of ['PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md'])
    writeFileSync(join(project, map), readFileSync(join(project, map), 'utf8').replace(/<[^>\n]+>/g, 'filled from the project'));
  const mapsPartial = run(['checkpoint', 'maps']);
  if (!broken) verdict(mapsPartial.status === 1, 'maps refuse remaining multiline template guidance', `partial=${mapsPartial.status}`);
  for (const map of ['PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md'])
    writeFileSync(join(project, map), readFileSync(join(project, map), 'utf8').replace(/<(?:The |Where |Describe |Why )[\s\S]*?>/g, 'filled from the project'));
  const mapsAfter = run(['checkpoint', 'maps']);
  const mapsGood = broken === 'maps' ? mapsBefore.status === 0 : mapsBefore.status === 1 && mapsPartial.status === 1 && mapsAfter.status === 0;
  verdict(mapsGood, `maps ${broken === 'maps' ? 'red without the gate' : 'refuse slots, then pass when filled'}`, `before=${mapsBefore.status} after=${mapsAfter.status}`);
  if (!broken) {
    for (const map of ['PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md']) cpSync(join(source, map), join(project, map));
    const realMaps = run(['checkpoint', 'maps']);
    verdict(realMaps.status === 0, 'filled origin maps with generic <name>/<dir>/<DOC> notation pass', out(realMaps).slice(-300));
  }

  cpSync(join(source, 'AUTHOR_STYLOMETRY.md'), join(project, 'AUTHOR_STYLOMETRY.md'));
  const voiceTool = join(project, '.kaif', 'tools', 'kaif-voice-lint.mjs');
  const loaded = spawnSync(process.execPath, [voiceTool, 'load'], { cwd: project, encoding: 'utf8', timeout: 30000 });
  const voice = spawnSync(process.execPath, [voiceTool, 'check', 'KAIF_FRAMEWORK.md', '--genre', 'document'], { cwd: project, encoding: 'utf8', timeout: 30000 });
  const voiceGood = broken === 'voice' ? voice.status === 1 && /здесь/.test(out(voice)) : loaded.status === 0 && voice.status === 0;
  verdict(voiceGood, `voice ${broken === 'voice' ? 'red on the former headings' : 'clean on the shipped Russian document'}`, `load=${loaded.status} check=${voice.status} ${out(voice).slice(-300)}`);

  const canonical = join(project, '.claude', 'skills', 'resume', 'SKILL.md');
  writeFileSync(canonical, readFileSync(canonical, 'utf8') + '\nKA8 drift probe.\n');
  const drift = run(['check']);
  const syncGood = broken === 'sync' ? !/kaif-core\.mjs sync/.test(out(drift)) : /mirror copies lag the canon/.test(out(drift)) && /kaif-core\.mjs sync/.test(out(drift));
  verdict(syncGood, `sync ${broken === 'sync' ? 'red without the remedy' : 'warning names sync'}`, out(drift).slice(-300));
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log(failed ? `FAIL ${failed} case(s)` : broken ? `PASS: ${broken} is red on its exact pre-fix construct` : 'PASS: all three KA8 findings are green');
process.exit(failed ? 1 : 0);
