// probe of the v2.9 contour core (git archive v2.9 framework/tools/contour) — owner-talk recon, 2.10 scope. Read-only functions only.
import { docStatus, referenceProblems, preflight, renderMd, parseQuestions } from './framework/tools/contour/core.mjs';

const head = (status) => '# Interview probe\n\n> **Создан:** 2026-10-16\n> **Статус:** ' + status + '\n\n## Вопросы\n\n';
const q = (n, stem) => '### В' + n + '. Вопрос ' + n + '\n\n' + stem + '\n\n<!-- archaeology: n/a — probe -->\n\n- **A)** да\n- **B)** нет\n\n**Ответ:**\n\n---\n\n';

console.log('=== #147 refBack (referenceProblems, v2.9) ===');
const refs = [
  ['ticket-1 correlative', '— *«Чем выше ум, тем правильнее произносится свиток»*.'],
  ['ticket-2 sentence-final', 'Медведем-Берсерком: Берсерк бьёт героя с самой высокой атакой, у вора она выше.'],
  ['variant correlative', 'Чем выше уровень, тем сильнее заклинание.'],
  ['control ref «формула выше»', 'Формула выше даёт 12.'],
  ['control ref «как указано выше»', 'Как указано выше, урон удваивается.'],
  ['control ref «в таблице выше»', 'В таблице выше три строки.'],
  ['control legal number', 'Нагрузка выше 80% — тормозит.'],
  ['control legal «чем»', 'B выше, чем A.'],
  ['twin genitive «рыночной»', 'Цена выше рыночной — берём?'],
  ['twin genitive «среднего»', 'Урон выше среднего — оставляем?'],
  ['twin spatial UI «выше списка»', 'Поставить кнопку выше списка?'],
  ['twin «на уровень выше»', 'Поднять роль на уровень выше?'],
  ['twin UI «в шапке»', 'Кнопка в шапке сайта или в подвале?'],
  ['twin «в разделе» (contract)', 'Пункт 5 в разделе «Оплата» договора — оставить?'],
  ['twin «§ 5» (regulation)', 'Применяем ли § 5 регламента к этому случаю?'],
  ['twin EN preposition', 'Is a price above the market rate acceptable?'],
  ['twin EN spatial UI', 'Should the logo sit above the title?'],
  ['twin EN UI header', 'Put the button in the header or the footer?'],
  ['control EN legal number', 'Keep the load above 80%?'],
  ['control EN ref', 'Use the formula above?'],
];
let md = head('🟡 ждёт ответа');
refs.forEach(([, s], i) => { md += q(i + 1, s); });
const probs = referenceProblems(md);
const parsed = parseQuestions(md).length;
refs.forEach(([name, s], i) => {
  const id = 'В' + (i + 1);
  const hit = probs.some((p) => p.startsWith(id + ':'));
  console.log((hit ? 'REFUSED' : 'legal  ') + ' · ' + name + ' · ' + s);
});
console.log('questions parsed: ' + parsed + ' · problems: ' + probs.length);

console.log('\n=== #109 docStatus (v2.9) ===');
const st = [
  ['#109 body RU', '✅ **ЗАКРЫТО 2026-08-30 14:5x — ВОПРОС СНЯТ АГЕНТОМ, А НЕ ОТВЕЧЕН ВЛАДЕЛЬЦЕМ.**'],
  ['#109 body EN', '✅ CLOSED 2026-08-30 — the question was withdrawn by the agent, not answered by the owner.'],
  ['#109 body control', '✅ CLOSED 2026-08-30 — withdrawn by the agent.'],
  ['comment-1 mirror', '🟡 отвечено: Q1 = D (…), Q2 = A (…); внесение не подтверждено (…) ·'],
  ['comment-1 partial', '🟠 отвечено 18 из 27'],
  ['comment-1 remediation form', '🟡 ответы ждут внесения: Q1 = D, Q2 = A'],
  ['comment-3 folded', '**↪️ СВЁРНУТО в сводное интервью #123 (2026-10-05)** — вопросы живут там'],
  ['twin EN «answers received» + waiting', '🟡 answers received for Q1; Q2 awaiting'],
  ['twin ✅ anywhere vs 🟡 first', '🟡 Q2 ждёт ответа · ✅ Q1 внесён'],
  ['twin 🟢 partial', '🟢 частично: Q1 отвечено, Q2 — ждёт ответа'],
  ['twin «отвечено частично» 🟡', 'Отвечено частично (2 из 5) 🟡'],
  ['twin EN merged', '📦 MERGED into interview #5'],
  ['control waiting', '⏳ ждёт ответа владельца'],
];
for (const [name, s] of st) console.log(JSON.stringify(docStatus('# X\n\n> **Статус:** ' + s + '\n')) + ' · ' + name + ' · ' + s);

console.log('\n=== #136 renderMd on an html artifact body (v2.9) ===');
console.log(renderMd('<h2>Title</h2><table><tr><td>1</td></tr></table>\n'));

console.log('\n=== #142 preflight on a 3 000-character question (v2.9) ===');
const long = 'Длинный контекст вопроса без единой ссылки назад. '.repeat(60);
const mdLong = head('🟡 ждёт ответа') + q(1, long);
const pf = preflight(mdLong);
console.log('stem chars: ' + long.length + ' · preflight problems: ' + pf.length + (pf.length ? ' · ' + pf.join(' | ').slice(0, 300) : ''));
