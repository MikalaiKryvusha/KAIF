#!/usr/bin/env node
// voice-log-call-route.mjs — ПРОБА решения №156: зов `--call` настоящим CLI истока (`tools/review.mjs`) во временном проекте кладёт фразу агента в
// журнал `voice/<ГГГГ-ММ-ДД_ЧЧ-ММ-СС>_<смысл>.txt` ровно одним файлом, а голосовой инструмент, которого зов запускает, получает
// KAIF_VOICE_LOGGED=1 и второй записи не делает. Голос — заглушка: пишет свои argv и окружение в файл, звука нет (тишина окружением:
// KAIF_VOICE_BEEPS=embedded — контур своих писков не играет, а заглушка не играет ничего).
// Код 0 — все случаи зелёные; 1 — красный случай назван. ≈ 3 с.
// [TESTED: 2026-11-07 · зелёная на этой сборке (4/4), красная на HEAD до №156 (3) — отчёт testcases/reports/2026-11-07_voice-soft-kumm-settings.md]
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const REVIEW = process.env.KAIF_PROBE_REVIEW ? resolve(process.env.KAIF_PROBE_REVIEW) : resolve(import.meta.dirname, '..', '..', 'review.mjs');
const r = mkdtempSync(join(tmpdir(), 'kaif-voicelog-route-'));
let bad = 0;
const ok = (c, name) => { console.log((c ? '  v ' : '  x ') + name); if (!c) bad++; };
try {
  mkdirSync(join(r, '.kaif'), { recursive: true });
  writeFileSync(join(r, '.kaif', 'kaif.json'), JSON.stringify({ language: 'ru', contour: { callName: 'Кит', ownerName: 'Кит Ли' } }));
  const stubOut = join(r, 'stub.json');
  const stub = join(r, 'stub-voice.mjs');
  writeFileSync(stub, `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(stubOut)}, JSON.stringify({ argv: process.argv.slice(2), logged: process.env.KAIF_VOICE_LOGGED || null }));\n`);
  const env = { ...process.env, KAIF_VOICE_TOOL: stub, KAIF_VOICE_BEEPS: 'embedded', KAIF_VOICE: 'eugene' };
  const run = spawnSync(process.execPath, [REVIEW, '--call', 'Кит, вставь, пожалуйста, ключ стенда.'], { cwd: r, env, encoding: 'utf8', timeout: 60000 });
  const out = (run.stdout || '') + (run.stderr || '');
  for (let i = 0; i < 100 && !existsSync(stubOut); i++) spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},100)']);
  const files = existsSync(join(r, 'voice')) ? readdirSync(join(r, 'voice')) : [];
  console.log('  · ' + out.split('\n').filter((l) => /voice log|CALL/.test(l)).join('\n  · '));
  ok(run.status === 0, 'the CLI exits 0 (exit ' + run.status + ')');
  ok(files.length === 1 && /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_вставь-пожалуйста-ключ-стенда\.txt$/.test(files[0]),
    'one file in voice/, named <stamp with seconds>_<the meaning without the address>: ' + files.join(', '));
  const said = files[0] ? readFileSync(join(r, 'voice', files[0]), 'utf8') : '';
  ok(said.startsWith('Кит, ') && said.includes('вставь, пожалуйста, ключ стенда.') && !said.startsWith('Кит, Кит'), 'the file holds the phrase as spoken, the address once: ' + said.trim());
  const st = existsSync(stubOut) ? JSON.parse(readFileSync(stubOut, 'utf8')) : null;
  ok(!!st && st.logged === '1' && st.argv.includes('--play'), 'the voice tool ran with KAIF_VOICE_LOGGED=1 (no second log): ' + JSON.stringify(st));
} finally { rmSync(r, { recursive: true, force: true }); }
console.log(bad ? '✖ voice-log-call-route: ' + bad + ' red' : '✔ voice-log-call-route: green');
process.exit(bad ? 1 : 0);
