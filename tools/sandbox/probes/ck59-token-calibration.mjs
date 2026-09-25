// ck59-token-calibration.mjs — ПРОБА (не свод) к шагу CK5.9 plans/118 (2.8, эпик CK; тикет #99, интервью №035 Q2 = A):
// состав текста по письменностям — чтобы константа «символы → токены» строки стоимости входа стояла на ЗАМЕРЕ, а не на догадке.
// Печатает байты, символы (ASCII · кириллица · прочее), байт и символов на токен при известном числе токенов, и цену символа
// не-ASCII, если ASCII стоит 2,5 символа на токен (страница модели: «1M tokens ≈ 2.5M characters»).
// Использование: node tools/sandbox/probes/ck59-token-calibration.mjs <файл> <измеренные токены>
// Замер 2026-09-25 ≈ 02:18 +03:00: версия `MASTER_PLAN.md` полевого развёртывания с ровно 140 597 байтами (тикет #99: 40 880 токенов,
// счёт инструмента Read харнесса) → 84 449 символов (ASCII 29 203 · кириллица 53 830 · прочее 1 416), 3,439 байта и 2,066 символа на
// токен, символ не-ASCII ≈ 1,892 символа на токен. Одна точка калибровки — строка, которая на ней стоит, печатает «≈».
// [TESTED: 2026-09-25 11:41 +03:00 · сессия 74, по находке 7 судьи CK6 (отметки статуса не было): переисполнено на той же версии
//  файла поля (`git show 93a92e7:MASTER_PLAN.md` в его репозитории, только чтение) → «bytes 140597 · chars 84449 · ascii 29203 ·
//  cyrillic 53830 · other 1416», «bytes/token 3.439 · chars/token 2.066», «non-ascii chars/token 1.892» — ровно числа замера выше]
import { readFileSync } from 'node:fs';

const ASCII_CHARS_PER_TOKEN = 2.5;   // страница модели: 1M токенов ≈ 2,5M символов
const [file, measured] = process.argv.slice(2);
if (!file || !Number(measured)) { console.error('usage: node tools/sandbox/probes/ck59-token-calibration.mjs <file> <measuredTokens>'); process.exit(2); }
const buf = readFileSync(file);
let ascii = 0, cyr = 0, other = 0;
for (const ch of buf.toString('utf8')) {
  const c = ch.codePointAt(0);
  if (c < 128) ascii++;
  else if (c >= 0x0400 && c <= 0x04FF) cyr++;
  else other++;
}
const chars = ascii + cyr + other, tok = Number(measured);
console.log(`bytes ${buf.length} · chars ${chars} · ascii ${ascii} · cyrillic ${cyr} · other ${other}`);
console.log(`bytes/token ${(buf.length / tok).toFixed(3)} · chars/token ${(chars / tok).toFixed(3)}`);
console.log(`with ascii at ${ASCII_CHARS_PER_TOKEN} chars/token: non-ascii chars/token ${((cyr + other) / (tok - ascii / ASCII_CHARS_PER_TOKEN)).toFixed(3)}`);
