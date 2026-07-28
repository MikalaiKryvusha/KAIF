// s05-provenance.mjs — песочница опционального модуля kaif-provenance (план 20 Фаза 5,
// решение владельца №19). Проверяет grep-гейт: парность пометок, «пометки живут только в
// объявленных канон-артефактах», report, accept с реестром; красные исходы доказаны.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = resolve(process.argv[2] || join(tmpdir(), 'kaif-sbx-provenance'));
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(ROOT, '.kaif', 'tools'), { recursive: true });
mkdirSync(join(ROOT, 'rules'), { recursive: true });

let failures = 0;
const ok = (cond, name, extra = '') => {
  console.log((cond ? '✅ ' : '❌ ') + name + (cond || !extra ? '' : ' — ' + String(extra).slice(-250)));
  if (!cond) failures++;
};
const run = (args) => {
  try { return { code: 0, out: execSync(`node ${join(ROOT, '.kaif', 'tools', 'kaif-provenance.mjs')} ${args} 2>&1`, { cwd: ROOT, stdio: 'pipe' }).toString() }; }
  catch (e) { return { code: e.status ?? 1, out: (e.stdout || '').toString() + (e.stderr || '').toString() }; }
};

cpSync(join(REPO, 'framework', 'tools', 'kaif-provenance.mjs'), join(ROOT, '.kaif', 'tools', 'kaif-provenance.mjs'));
writeFileSync(join(ROOT, '.kaif', 'kaif.json'), JSON.stringify({
  framework: 'KAIF', version: '2.0', tracking: 'origin', canonArtifacts: ['rules/'] }, null, 2) + '\n');

// 1) чистое состояние: канон с корректной парой — check зелёный, report видит блок
writeFileSync(join(ROOT, 'rules', 'combat.md'), '# Бой\n\nТекст владельца.\n\n[AI]\nНовая механика от ИИ — ждёт приёмки.\n[/AI]\n\nЕщё текст владельца.\n');
let r = run('check');
ok(r.code === 0, 's05 check зелёный на корректных пометках', r.out);
r = run('report');
ok(r.code === 0 && r.out.includes('rules/combat.md') && r.out.includes('1 block'),
   's05 report видит блок, ждущий приёмки', r.out);

// 2) пометка ВНЕ объявленного канона → красный
writeFileSync(join(ROOT, 'notes.md'), '[AI]\nмаркировать всё подряд нельзя\n[/AI]\n');
r = run('check');
ok(r.code !== 0 && /NOT a declared canon artifact/.test(r.out),
   's05 пометка вне канона — гейт красный (агенты не метят всё подряд)', r.out);
rmSync(join(ROOT, 'notes.md'));

// 3) непарная пометка → красный с внятной строкой
writeFileSync(join(ROOT, 'rules', 'broken.md'), '[AI]\nоткрыто и не закрыто\n');
r = run('check');
ok(r.code !== 0 && /never closed/.test(r.out), 's05 незакрытая пометка — красный', r.out);
writeFileSync(join(ROOT, 'rules', 'broken.md'), 'x\n[/AI-ed]\n');
r = run('check');
ok(r.code !== 0 && /stray/.test(r.out), 's05 закрытие без открытия — красный', r.out);
rmSync(join(ROOT, 'rules', 'broken.md'));

// 4) accept: реестр пополнен, пометки сняты, файл цел по содержанию
r = run('accept rules/combat.md');
ok(r.code === 0 && /accepted 1 block/.test(r.out), 's05 accept отработал', r.out);
const combat = readFileSync(join(ROOT, 'rules', 'combat.md'), 'utf8');
ok(!combat.includes('[AI]') && combat.includes('Новая механика от ИИ'),
   's05 пометки сняты, СОДЕРЖИМОЕ блока сохранено');
const reg = JSON.parse(readFileSync(join(ROOT, '.kaif', 'provenance-accepted.json'), 'utf8'));
ok(reg.accepted.length === 1 && reg.accepted[0].file === 'rules/combat.md' && reg.accepted[0].sha,
   's05 реестр принятых: файл, дата, sha блока');
r = run('check');
ok(r.code === 0, 's05 после приёмки гейт снова зелёный');
// accept без пометок → честный отказ
r = run('accept rules/combat.md');
ok(r.code !== 0 && /nothing to accept/.test(r.out), 's05 повторный accept — честный отказ');

// 5) [AI-ed] не путается с [AI] (longest-match)
writeFileSync(join(ROOT, 'rules', 'edited.md'), '[AI-ed]\nправка ИИ поверх текста владельца\n[/AI-ed]\n');
r = run('check');
ok(r.code === 0, 's05 [AI-ed] парится корректно (не путается с [AI])', r.out);

console.log(`\n${failures ? '❌ ПРОВАЛОВ: ' + failures : '✅ песочница provenance зелёная'}`);
process.exit(failures ? 1 : 0);
