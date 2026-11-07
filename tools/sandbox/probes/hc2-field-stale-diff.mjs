#!/usr/bin/env node
// hc2-field-stale-diff.mjs — ПРОБА шага HC2 версии KAIF 2.10 (#117): функциональный прогон `stale-claims` на git-КЛОНАХ полевых развёртываний
// ДВУМЯ ядрами — прежним (`KAIF_DIST_OLD=<каталог dist>`) и этой сборки (`dist/`) — и разность названных мест: что новое правило добавило, что
// убрало. Печатаются только `файл:строка` и номер развёртывания (имена проектов и текст строк — никогда). Источники только читаются (клон
// `--no-hardlinks`, HEAD до и после), клоны удаляются. Интервал — `--from <v> --to <v>` (по умолчанию 2.8 → 2.9).
// Использование: KAIF_DIST_OLD=<dist> node tools/sandbox/probes/hc2-field-stale-diff.mjs <развёртывание> … [--from 2.8 --to 2.9]
// [TESTED: 2026-11-07 · восемь развёртываний — 0 мест добавлено, 0 убрано, источники целы — testcases/reports/2026-11-07_hc2-stale-claims-version-paren.md]
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const FROM = flag('--from', '2.8'), TO = flag('--to', '2.9');
const roots = args.filter((a, i) => !a.startsWith('--') && !['--from', '--to'].includes(args[i - 1]));
const NEW = resolve(import.meta.dirname, '..', '..', '..', 'dist', 'KAIF-CORE.mjs');
const OLD = process.env.KAIF_DIST_OLD ? join(resolve(process.env.KAIF_DIST_OLD), 'KAIF-CORE.mjs') : null;
if (!OLD || !existsSync(OLD) || !roots.length) { console.log('usage: KAIF_DIST_OLD=<dist> hc2-field-stale-diff.mjs <deployment>… [--from v --to v]'); process.exit(2); }
const head = (r) => spawnSync('git', ['rev-parse', 'HEAD'], { cwd: r, encoding: 'utf8' }).stdout.trim();
const places = (core, cwd) => {
  const r = spawnSync(process.execPath, [core, 'stale-claims', '--from', FROM, '--to', TO], { cwd, encoding: 'utf8', timeout: 120000 });
  return new Set(((r.stdout || '') + (r.stderr || '')).split('\n').map((l) => (l.match(/^\s*·?\s*([^\s:]+:\d+) — /) || [])[1]).filter(Boolean));
};
let added = 0;
roots.forEach((src, n) => {
  const h0 = head(src);
  const d = mkdtempSync(join(tmpdir(), 'kaif-hc2-'));
  try {
    execFileSync('git', ['clone', '-q', '--no-hardlinks', src, join(d, 'p')], { env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
    const before = places(OLD, join(d, 'p')), after = places(NEW, join(d, 'p'));
    const plus = [...after].filter((x) => !before.has(x)), minus = [...before].filter((x) => !after.has(x));
    added += plus.length;
    console.log(`  · deployment ${n + 1}: old core ${before.size} place(s), this build ${after.size}; added ${plus.length}${plus.length ? ' — ' + plus.join(', ') : ''}; removed ${minus.length}${minus.length ? ' — ' + minus.join(', ') : ''}; source HEAD unchanged: ${head(src) === h0}`);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
console.log(`hc2-field-stale-diff ${FROM} → ${TO}: ${added} place(s) added over ${roots.length} deployment(s) — read each one: a claim the field wrote, or a false hit`);
