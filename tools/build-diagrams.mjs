#!/usr/bin/env node
// tools/build-diagrams.mjs
// Generates the README diagrams into assets/ — 3 diagrams x 2 themes x 2 languages = 12 SVG files.
//
// WHY A GENERATOR AND NOT 12 HAND-WRITTEN FILES:
// the same drawing must exist in light/dark (GitHub strips style= and class=, so a theme-adaptive
// diagram is physically two files) and in EN/RU (the README serves both audiences). Twelve
// near-identical XML files drift silently; one spec does not. DRY applied to pictures — the same
// reason KAIF.md is generated from framework/ rather than maintained by hand.
//
// HARD CONSTRAINTS baked in below, each observed on the live renderer (researches/06 §2, §6):
//   - GitHub DELETES inline <svg>, so graphics must be files referenced by <img>/<picture>.
//   - An SVG shown through <img> cannot inherit page colours: `currentColor` resolves to the SVG's
//     own black, NOT to the reader's theme. Every colour is therefore explicit per theme.
//   - CSP blocks font loading: system font stacks only, never a webfont or @font-face.
//   - No external references of any kind (<image href>, external CSS) — they die silently.
//   - Files are written with LF: .gitattributes carries no *.svg rule, git treats SVG as text.
//
// DRAWING STYLE (owner's direction, 2026-07-26): technical drawings, not marketing infographics.
// No metaphors, no decorative flourishes, plain precise wording. Text lives inside rectangles whose
// width is known, and fit() below FAILS THE BUILD if a label cannot fit its container — an overlap
// must be impossible by construction rather than caught by eye.
//
// Usage: node tools/build-diagrams.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');

// ── Design tokens ──────────────────────────────────────────────────────────────
// The light card carries an opaque white ground rather than a transparent one: where <picture>
// theme switching is unsupported (the GitHub mobile apps), a reader in dark mode then sees a
// legible white card instead of invisible black strokes.
const THEMES = {
  light: { bg: '#ffffff', edge: '#e0dcde', ink: '#14121a', soft: '#6d6672', grid: '#eceaee', accent: '#c8106a' },
  dark:  { bg: '#0d1117', edge: '#2f353d', ink: '#e9e7ec', soft: '#9aa0aa', grid: '#21262d', accent: '#ff5fb0' },
};

const SANS = 'system-ui,-apple-system,&#34;Segoe UI&#34;,Roboto,Helvetica,Arial,sans-serif';
const MONO = 'ui-monospace,&#34;Cascadia Code&#34;,Consolas,&#34;Liberation Mono&#34;,monospace';

// Conservative per-glyph advance ratios. Deliberately pessimistic: a false "too wide" costs one
// edit, a false "fits" ships an overlapping label.
const RATIO = { sans: 0.58, mono: 0.62 };
const widthOf = (s, size, mono) => s.length * size * (mono ? RATIO.mono : RATIO.sans);

/** Build-time guard: refuse to emit a drawing whose text cannot fit its container. */
function fit(text, size, mono, avail, where) {
  const w = widthOf(text, size, mono);
  if (w > avail) {
    throw new Error(
      `[build-diagrams] text does not fit at ${where}: needs ~${Math.ceil(w)}px, has ${avail}px\n  text: "${text}"`);
  }
  return text;
}

// ── Copy, one place per language. Plain, technical, no slogans. ────────────────
const STR = {
  en: {
    d1_y: 'knowledge of the project available to the session',
    d1_x: 'consecutive sessions',
    d1_legA: 'without KAIF', d1_legB: 'with KAIF',
    d1_cap1: 'Without KAIF the knowledge exists only inside the session and is lost together with it.',
    d1_cap2: 'With KAIF the state is written to files, so the next session starts from what was reached.',
    d2_title: 'One session, start to finish',
    d2_n: ['/resume', 'the work', 'verification', 'review of claims', '/pause'],
    d2_s: [
      ['reads the state,', 'names the one task'],
      ['recon doc first,', 'then a surgical change'],
      ['by observation:', 'it ran, it rendered'],
      ['claims re-checked;', 'a refusal blocks the push'],
      ['writes the state for', 'a session with no context'],
    ],
    d2_store: 'The repository holds the state, the accumulated knowledge and the rules',
    d2_store1: 'STATUS.md · EXPERIENCE.md · MASTER_PLAN.md · the two project maps',
    d2_store2: 'bugs/ · ideas/ · plans/ · researches/ · interviews/ · homeworks/',
    d2_reads: 'reads', d2_writes: 'writes', d2_checks: 'checks against',
    d2_return: 'the next session begins with an empty context — the files are what carries over',
    d3_title: 'What a deployed KAIF consists of',
    d3_bands: [
      ['Commands', '26 repeatable rituals, invoked by name',
        '/resume · /pause · /autoloop · /report-bug · /propose-idea · /interview · /release'],
      ['State and knowledge', 'plain markdown, versioned with the project',
        'STATUS.md · EXPERIENCE.md · MASTER_PLAN.md · GOAL.md · bugs/ ideas/ plans/ researches/'],
      ['Rules of work', 'how the agent thinks, debugs and tests',
        'AGENT_GUIDE.md · PHILOSOPHY.md · BUG_FIXING_FRAMEWORK.md · TESTING_FRAMEWORK.md'],
      ['Machinery', 'runs without you, in a fixed procedure',
        '.kaif/ · checksum verification · update by file provenance · 5 agent systems · 10 languages'],
    ],
    d3_braces: ['you work here', 'the agent maintains this', 'installed and updated mechanically'],
  },
  ru: {
    d1_y: 'знание о проекте, доступное сессии',
    d1_x: 'последовательные сессии',
    d1_legA: 'без KAIF', d1_legB: 'с KAIF',
    d1_cap1: 'Без KAIF знание существует только внутри сессии и исчезает вместе с ней.',
    d1_cap2: 'С KAIF состояние записано в файлы, поэтому следующая сессия продолжает с достигнутого.',
    d2_title: 'Одна сессия целиком',
    d2_n: ['/resume', 'работа', 'проверка', 'разбор заявлений', '/pause'],
    d2_s: [
      ['читает состояние,', 'называет одну задачу'],
      ['сначала разведдок,', 'потом точечная правка'],
      ['наблюдением:', 'запустилось, отрисовалось'],
      ['заявления перепроверены,', 'отказ блокирует отправку'],
      ['пишет состояние для', 'сессии без контекста'],
    ],
    d2_store: 'Репозиторий хранит состояние, накопленное знание и правила',
    d2_store1: 'STATUS.md · EXPERIENCE.md · MASTER_PLAN.md · две карты проекта',
    d2_store2: 'bugs/ · ideas/ · plans/ · researches/ · interviews/ · homeworks/',
    d2_reads: 'читает', d2_writes: 'пишет', d2_checks: 'сверяется',
    d2_return: 'следующая сессия начинается с пустым контекстом — переносят только файлы',
    d3_title: 'Из чего состоит развёрнутый KAIF',
    d3_bands: [
      ['Команды', '26 повторяемых ритуалов, вызываются по имени',
        '/resume · /pause · /autoloop · /report-bug · /propose-idea · /interview · /release'],
      ['Состояние и знание', 'обычный markdown, версионируется вместе с проектом',
        'STATUS.md · EXPERIENCE.md · MASTER_PLAN.md · GOAL.md · bugs/ ideas/ plans/ researches/'],
      ['Правила работы', 'как агент думает, чинит и проверяет',
        'AGENT_GUIDE.md · PHILOSOPHY.md · BUG_FIXING_FRAMEWORK.md · TESTING_FRAMEWORK.md'],
      ['Механика', 'работает без вас, по фиксированной процедуре',
        '.kaif/ · сверка контрольных сумм · обновление по происхождению файла · 5 систем · 10 языков'],
    ],
    d3_braces: ['вы работаете здесь', 'ведёт агент', 'ставится и обновляется механически'],
  },
};

// ── Primitives ─────────────────────────────────────────────────────────────────
const esc = s => String(s).replace(/&(?!#\d+;|#34;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const t = (x, y, s, { size = 15, weight = 400, anchor = 'middle', fill, mono = false, op } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${mono ? MONO : SANS}" ` +
  `font-size="${size}" font-weight="${weight}" fill="${fill}"${op ? ` opacity="${op}"` : ''}>${esc(s)}</text>`;

const box = (x, y, w, h, c, sw = 2.2, rx = 4) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;

const path = (d, c, sw = 2.2, extra = '') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

const frame = (w, h, T) =>
  `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="8" fill="${T.bg}" stroke="${T.edge}" stroke-width="1"/>`;

const defs = T => `<defs>
  <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="${T.ink}"/></marker>
  <marker id="b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="${T.accent}"/></marker>
  <marker id="c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="${T.soft}"/></marker>
</defs>`;

const svg = (w, h, T, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
<!-- GENERATED by tools/build-diagrams.mjs — do not hand-edit. Re-run the tool instead. -->
<title>${esc(title)}</title>
${defs(T)}
${frame(w, h, T)}
${body}
</svg>
`;

// ── Diagram 1 — knowledge available to the session, across sessions ────────────
// A plain comparison plot: two series on one set of axes. The dip in session 3 is deliberate —
// not every session is a net gain, and a chart that only ever rises would be a sales pitch.
function diagramKnowledge(T, L) {
  const p = [];
  const X0 = 150, X1 = 1150, Y0 = 108, Y1 = 400;
  const N = 5, step = (X1 - X0) / N;

  p.push(t(X0, 62, fit(L.d1_y, 15, false, 700, 'd1.ylabel'), { size: 15, anchor: 'start', fill: T.soft }));

  for (let i = 0; i <= 4; i++) {
    const y = Y0 + ((Y1 - Y0) / 4) * i;
    p.push(path(`M${X0} ${y} L${X1} ${y}`, T.grid, 1.4));
  }
  p.push(path(`M${X0} ${Y0 - 12} L${X0} ${Y1}`, T.soft, 1.8));
  p.push(path(`M${X0} ${Y1} L${X1 + 14} ${Y1}`, T.soft, 1.8, 'marker-end="url(#c)"'));

  for (let i = 0; i < N; i++) {
    const cx = X0 + step * i + step / 2;
    p.push(path(`M${X0 + step * (i + 1)} ${Y1} L${X0 + step * (i + 1)} ${Y1 + 7}`, T.soft, 1.6));
    p.push(t(cx, Y1 + 28, String(i + 1), { size: 14, fill: T.soft }));
  }
  p.push(t((X0 + X1) / 2, Y1 + 54, L.d1_x, { size: 14, fill: T.soft }));

  // without KAIF: rises inside a session, returns to the floor at every boundary
  const saw = [];
  for (let i = 0; i < N; i++) {
    const a = X0 + step * i + 14, b = X0 + step * (i + 1) - 14;
    saw.push(`M${a} ${Y1} L${b} ${Y0 + 96} L${b} ${Y1}`);
  }
  p.push(path(saw.join(' '), T.soft, 2.4, 'stroke-dasharray="7 5"'));

  // with KAIF: carries over, with an honest setback in session 3
  const lv = [Y1, Y1 - 62, Y1 - 132, Y1 - 108, Y1 - 186, Y1 - 258];
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = X0 + step * i + 14, b = X0 + step * (i + 1) - 14;
    pts.push(`${i === 0 ? 'M' : 'L'}${a} ${lv[i]}`, `L${b} ${lv[i + 1]}`);
  }
  p.push(path(pts.join(' '), T.accent, 3));

  // legend, parked in free space in the upper left of the plot
  p.push(path(`M${X0 + 24} ${Y0 + 18} L${X0 + 74} ${Y0 + 18}`, T.soft, 2.4, 'stroke-dasharray="7 5"'));
  p.push(t(X0 + 86, Y0 + 23, fit(L.d1_legA, 14, false, 200, 'd1.legA'), { size: 14, anchor: 'start', fill: T.soft }));
  p.push(path(`M${X0 + 24} ${Y0 + 46} L${X0 + 74} ${Y0 + 46}`, T.accent, 3));
  p.push(t(X0 + 86, Y0 + 51, fit(L.d1_legB, 14, false, 200, 'd1.legB'), { size: 14, anchor: 'start', fill: T.ink }));

  p.push(t(X0, 500, fit(L.d1_cap1, 15.5, false, 1000, 'd1.cap1'), { size: 15.5, anchor: 'start', fill: T.ink, op: 0.9 }));
  p.push(t(X0, 526, fit(L.d1_cap2, 15.5, false, 1000, 'd1.cap2'), { size: 15.5, anchor: 'start', fill: T.ink, op: 0.9 }));

  return svg(1200, 560, T, p.join('\n'), `${L.d1_cap1} ${L.d1_cap2}`);
}

// ── Diagram 2 — one session, start to finish ───────────────────────────────────
// A left-to-right pipeline over a store, rather than a ring: a ring crowds its labels, and the
// return path is exactly the point worth showing plainly.
function diagramSession(T, L) {
  const p = [];
  const BW = 208, GAP = 26, X0 = 46, BY = 118, BH = 62;
  const cx = i => X0 + (BW + GAP) * i + BW / 2;

  p.push(t(X0, 52, L.d2_title, { size: 19, weight: 700, anchor: 'start', fill: T.ink }));
  p.push(t(X0, 78, L.d2_return, { size: 14, anchor: 'start', fill: T.soft }));

  L.d2_n.forEach((name, i) => {
    const x = X0 + (BW + GAP) * i;
    const mono = name.startsWith('/');
    p.push(box(x, BY, BW, BH, T.ink, 2.4));
    p.push(t(x + BW / 2, BY + 38, fit(name, 18, mono, BW - 24, `d2.n${i}`), { size: 18, weight: 700, fill: T.ink, mono }));
    L.d2_s[i].forEach((s, k) =>
      p.push(t(x + BW / 2, BY + BH + 26 + k * 19, fit(s, 13, false, BW + 8, `d2.s${i}.${k}`), { size: 13, fill: T.soft })));
    if (i < 4) p.push(path(`M${x + BW + 4} ${BY + BH / 2} L${x + BW + GAP - 6} ${BY + BH / 2}`, T.ink, 2.2, 'marker-end="url(#a)"'));
  });

  // the store
  const SY = 330, SH = 104, SW = (BW + GAP) * 4 + BW;
  p.push(box(X0, SY, SW, SH, T.ink, 2.6));
  p.push(t(X0 + SW / 2, SY + 32, fit(L.d2_store, 16, false, SW - 40, 'd2.store'), { size: 16, weight: 700, fill: T.ink }));
  p.push(t(X0 + SW / 2, SY + 60, fit(L.d2_store1, 13.5, true, SW - 40, 'd2.store1'), { size: 13.5, fill: T.ink, mono: true, op: 0.85 }));
  p.push(t(X0 + SW / 2, SY + 84, fit(L.d2_store2, 13.5, true, SW - 40, 'd2.store2'), { size: 13.5, fill: T.ink, mono: true, op: 0.85 }));

  // traffic between the pipeline and the store — vertical, in its own lane, so nothing overlaps
  const lane = (i, label, dir) => {
    const x = cx(i);
    const y1 = BY + BH + 62, y2 = SY - 6;
    p.push(path(dir === 'up' ? `M${x} ${y2} L${x} ${y1}` : `M${x} ${y1} L${x} ${y2}`,
      T.accent, 2.2, 'marker-end="url(#b)" stroke-dasharray="6 5"'));
    p.push(t(x + 10, (y1 + y2) / 2 + 5, label, { size: 13.5, weight: 600, anchor: 'start', fill: T.accent }));
  };
  lane(0, L.d2_reads, 'up');
  lane(2, L.d2_checks, 'up');
  lane(4, L.d2_writes, 'down');

  // return path, above the row where there is nothing to collide with
  p.push(path(`M${cx(4)} ${BY - 6} L${cx(4)} ${BY - 34} L${cx(0)} ${BY - 34} L${cx(0)} ${BY - 6}`,
    T.soft, 2.2, 'marker-end="url(#a)" stroke-dasharray="7 5"'));

  return svg(1200, 480, T, p.join('\n'), `${L.d2_title}: ${L.d2_n.join(' → ')}. ${L.d2_store}. ${L.d2_return}`);
}

// ── Diagram 3 — what a deployed KAIF consists of ───────────────────────────────
// Four labelled bands, replacing the earlier metaphor. Rectangles have a known width, so the
// fit() guard can prove no label overflows.
function diagramLayers(T, L) {
  const p = [];
  const LX = 40, BX = 330, BW = 830, BH = 112, GAP = 16, Y0 = 92;

  p.push(t(LX, 54, L.d3_title, { size: 19, weight: 700, anchor: 'start', fill: T.ink }));

  L.d3_bands.forEach(([title, sub, items], i) => {
    const y = Y0 + (BH + GAP) * i;
    p.push(box(BX, y, BW, BH, T.ink, i === 3 ? 2.6 : 2.2));
    p.push(t(BX + 22, y + 34, fit(title, 17, false, BW - 44, `d3.t${i}`), { size: 17, weight: 700, anchor: 'start', fill: T.ink }));
    p.push(t(BX + 22, y + 58, fit(sub, 13.5, false, BW - 44, `d3.s${i}`), { size: 13.5, anchor: 'start', fill: T.soft }));
    p.push(t(BX + 22, y + 88, fit(items, 13, true, BW - 44, `d3.i${i}`), { size: 13, anchor: 'start', fill: T.ink, mono: true, op: 0.88 }));
  });

  // brackets on the left: who is responsible for which bands
  const brace = (from, to, label, colour) => {
    const yA = Y0 + (BH + GAP) * from + 6, yB = Y0 + (BH + GAP) * to + BH - 6;
    p.push(path(`M${BX - 26} ${yA} L${BX - 40} ${yA} L${BX - 40} ${yB} L${BX - 26} ${yB}`, colour, 2));
    const words = label.split(' ');
    const mid = (yA + yB) / 2;
    if (words.length > 2) {
      const half = Math.ceil(words.length / 2);
      p.push(t(BX - 54, mid - 4, words.slice(0, half).join(' '), { size: 14, anchor: 'end', fill: colour }));
      p.push(t(BX - 54, mid + 18, words.slice(half).join(' '), { size: 14, anchor: 'end', fill: colour }));
    } else {
      p.push(t(BX - 54, mid + 5, label, { size: 14, anchor: 'end', fill: colour }));
    }
  };
  brace(0, 0, L.d3_braces[0], T.accent);
  brace(1, 2, L.d3_braces[1], T.ink);
  brace(3, 3, L.d3_braces[2], T.soft);

  return svg(1200, Y0 + (BH + GAP) * 4 + 24, T,
    p.join('\n'), `${L.d3_title}. ${L.d3_bands.map(b => `${b[0]}: ${b[2]}`).join('. ')}`);
}

// ── Emit ───────────────────────────────────────────────────────────────────────
const DIAGRAMS = { knowledge: diagramKnowledge, session: diagramSession, layers: diagramLayers };

mkdirSync(OUT, { recursive: true });
let n = 0;
for (const [name, fn] of Object.entries(DIAGRAMS)) {
  for (const lang of Object.keys(STR)) {
    for (const [theme, tokens] of Object.entries(THEMES)) {
      const file = join(OUT, `${name}-${lang}-${theme}.svg`);
      // LF explicitly: .gitattributes carries no *.svg rule, and a CRLF working tree on Windows
      // would otherwise leak into a file git stores as text.
      writeFileSync(file, fn(tokens, STR[lang]).replace(/\r\n/g, '\n'), 'utf8');
      n++;
    }
  }
}
console.log(`✅ ${n} diagram files written to assets/ (all labels width-checked)`);
