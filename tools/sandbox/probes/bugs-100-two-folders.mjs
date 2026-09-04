// tools/sandbox/probes/bugs-100-two-folders.mjs — ПРОБА (не свод полигона): bugs/100 — зависит ли
// вердикт translated-wholesale `AGENT_GUIDE.md` от ИМЕНИ ПАПКИ дерева при v1-манифесте (без
// замороженных `values`) и синтетическом baseline.
//   node tools/sandbox/probes/bugs-100-two-folders.mjs                 # package.json установки оставлен
//   node tools/sandbox/probes/bugs-100-two-folders.mjs --no-package    # дерево без package.json (1.x / не-Node)
// [TESTED: 2026-09-04 12:03 +03:00 · ядро build 433, ru-развёртывание: без флага — A и B «baseFound 5 of 29,
//  ceiling 4 → merged» (одинаково: <PROJECT_NAME> из package.json); с --no-package — A «5 → merged»,
//  B «4 → frozen» (H1 baseline в B заполнен именем папки beta-project) — механизм bugs/100 п. 4 подтверждён]
// Проба остаётся ПРОБОЙ (красной по построению на ядре с дефектом) до лечения; после лечения её тело
// становится стражем s18 U14 «одно дерево в двух папках → один вердикт» и краснеет на до-фиксовом ядре.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { tempRoot } from '../../lib/temp-root.mjs';
import { splitModules, joinModules } from '../../module-map-lib.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DIST = join(REPO, 'dist');
const ROOT = tempRoot('bugs100-two-folders', process.argv.find((a) => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]));
mkdirSync(ROOT, { recursive: true });
const NO_PACKAGE = process.argv.includes('--no-package');

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const copy = (a, b) => writeFileSync(b, readFileSync(a));
const run = (cwd, args) => { try { return execSync(`node ${join(cwd, '.kaif', 'kaif-core.mjs')} ${args} 2>&1`, { cwd, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString(); } catch (e) { return 'EXIT ' + e.status + '\n' + (e.stdout || '') + (e.stderr || ''); } };
const seed = (dir) => { mkdirSync(join(dir, '.kaif', 'install'), { recursive: true }); copy(join(DIST, 'KAIF-CORE-BUNDLE.md'), join(dir, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md')); copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, '.kaif', 'kaif-core.mjs')); };
const FENCE = '`'.repeat(6);
const blockRe = (p) => new RegExp('(^> \\*\\*FILE: `' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '`\\*\\*[^\\n]*\\n\\n' + FENCE + '\\w*\\n)([\\s\\S]*?)(\\n' + FENCE + ')', 'm');
const writeSource = (dir, bundleText, version) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'KAIF-CORE-BUNDLE.md'), bundleText);
  copy(join(DIST, 'KAIF-CORE.mjs'), join(dir, 'KAIF-CORE.mjs'));
  const man = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8'));
  man.version = version; man.sha256['KAIF-CORE-BUNDLE.md'] = sha256(readFileSync(join(dir, 'KAIF-CORE-BUNDLE.md')));
  writeFileSync(join(dir, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
};
const FROM = JSON.parse(readFileSync(join(DIST, 'kaif-manifest.json'), 'utf8')).version;
const bundle0 = readFileSync(join(DIST, 'KAIF-CORE-BUNDLE.md'), 'utf8');
const stripPrayer = (t) => t.replace(/<!-- KAIF:CREED:BEGIN -->[\s\S]*?<!-- KAIF:PRAYER:END -->\n?/, '');
const SRC = join(ROOT, 'src-9.9'); writeSource(SRC, bundle0, '9.9');
// baseline «старой» версии: тот же бандл, AGENT_GUIDE без молитвы (форма развёртывания до 2.4) — даёт дельту шаблона
const OLD = join(ROOT, 'baseline-old');
const oldBundle = bundle0.replace(blockRe('AGENT_GUIDE.md'), (m, a, body, c) => a + stripPrayer(body) + c);
writeSource(OLD, oldBundle, FROM);
const oldMods = splitModules(oldBundle.match(blockRe('AGENT_GUIDE.md'))[2] + '\n').filter((m) => m.signature !== '<preamble>');
const baseN = oldMods.length; const ceiling = baseN <= 2 ? 0 : Math.max(1, Math.floor(baseN * 0.15));
console.log(`baseline AGENT_GUIDE: baseN ${baseN}, ceiling ${ceiling} → на диске остаются английскими H1 + ${ceiling} заголовков`);

// папка A: ru-установка (кандидатом на wholesale файл становится только на не-английском развёртывании)
const A = join(ROOT, 'alpha-project'); mkdirSync(A); seed(A);
const inst = run(A, 'install --lang ru'); if (/^EXIT/.test(inst)) { console.log(inst.slice(-600)); process.exit(1); }
const AG = join(A, 'AGENT_GUIDE.md');
const mods = splitModules(readFileSync(AG, 'utf8').replace(/\r\n/g, '\n'));
const oldSigs = new Set(oldMods.map((m) => m.signature.replace('<PROJECT_NAME>', 'alpha-project')));
let kept = 0, translated = 0;
for (const m of mods) {
  if (m.signature === '<preamble>' || /^# /.test(m.signature)) continue;            // H1 остаётся (несёт имя папки)
  if (oldSigs.has(m.signature) && kept < ceiling) { kept++; continue; }               // ровно ceiling заголовков живут по-английски
  translated++; m.lines[0] = m.signature.replace(/^(#+) .*$/, `$1 Раздел ${translated} по-русски`);
  m.lines.splice(1, 0, '', 'Русский текст владельца в этом разделе.');
}
writeFileSync(AG, joinModules(mods));
console.log(`диск AGENT_GUIDE: H1 «${mods.find((m) => /^# /.test(m.signature)).lines[0]}», английских заголовков ${kept}, переведено ${translated}`);
// манифест v1: без снимков и без замороженных values — развёртывание 1.x
const mp = join(A, '.kaif', 'deploy-manifest.json'); const man = JSON.parse(readFileSync(mp, 'utf8'));
delete man.templateShas; delete man.moduleShas; delete man.templateTexts; delete man.values; man.manifestVersion = 1;
writeFileSync(mp, JSON.stringify(man, null, 2) + '\n');
if (NO_PACKAGE) { rmSync(join(A, 'package.json'), { force: true }); console.log('вариант --no-package: package.json снят → <PROJECT_NAME> падает на имя папки'); }
// папка B: побайтная копия под другим именем
const B = join(ROOT, 'beta-project'); cpSync(A, B, { recursive: true });
const verdict = (out) => (out.split('\n').find((l) => /AGENT_GUIDE\.md: baseFound/.test(l)) || '(строки вердикта нет)').trim();
const outA = run(A, `update --source ${SRC} --baseline ${OLD}`);
const outB = run(B, `update --source ${SRC} --baseline ${OLD}`);
console.log('A (alpha-project):', verdict(outA));
console.log('B (beta-project): ', verdict(outB));
if (/^EXIT/m.test(outA) || /^EXIT/m.test(outB)) console.log('--- update упал ---\n' + (outA + outB).slice(-800));
const same = verdict(outA) === verdict(outB);
console.log(same ? '✅ ОДИН вердикт в обеих папках' : '❌ РАЗНЫЕ вердикты — имя папки меняет исход (bugs/100 п. 4)');
process.exit(same ? 0 : 1);
