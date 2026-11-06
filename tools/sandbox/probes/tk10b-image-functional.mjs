// TK10 (b), origin #187 — functional run: a fresh project with the shipped contour, an interview whose question carries two pictures
// (one file exists, one does not) → the door warns about the missing one, the built page carries the picture and the «[caption]» mark,
// and a headless browser snapshot of the page is written for the eye. Quiet: --check and --no-serve never open a window or call.
// Run: node tools/sandbox/probes/tk10b-image-functional.mjs [<snapshot.png>]
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// the snapshot stays for the eye: an explicit path, or a unique directory of its own (bugs/59 — never a fixed name in the shared temp)
const SNAP = process.argv[2] ? resolve(process.argv[2]) : join(mkdtempSync(join(tmpdir(), 'kaif-tk10b-snap-')), 'snapshot.png');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const root = mkdtempSync(join(tmpdir(), 'kaif-tk10b-f-'));
let ok = true; const say = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) ok = false; };
try {
  mkdirSync(join(root, '.kaif', 'tools'), { recursive: true });
  cpSync(join(REPO, 'framework', 'tools', 'contour'), join(root, '.kaif', 'tools', 'contour'), { recursive: true });
  writeFileSync(join(root, '.kaif', 'kaif.json'), JSON.stringify({ framework: 'KAIF', version: '2.10', language: 'en' }));
  writeFileSync(join(root, 'AGENT_GUIDE.md'), '# Guide\n\n| Field | Value |\n|---|---|\n| **Author / owner** | Ann Lee (ACE) |\n');
  mkdirSync(join(root, 'interviews', 'assets'), { recursive: true });
  writeFileSync(join(root, 'interviews', 'assets', 'upper.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="120"><rect width="420" height="120" fill="#c0392b"/>' +
    '<text x="20" y="75" font-size="40" font-family="Arial" fill="#fff">UPPER PICTURE</text></svg>');
  const doc = 'interviews/interview_099_pictures.md';
  writeFileSync(join(root, doc), '# Interview #099 — pictures\n\n> Status: awaiting\n\n## QUESTIONS\n\n### Q1. Which title font?\n\n' +
    '![the upper](assets/upper.svg)\n\n![the lower](assets/lower.svg)\n\n- **A)** the upper\n- **B)** the lower\n\n**Answer:**\n');
  const gen = (args) => spawnSync(process.execPath, [join(root, '.kaif', 'tools', 'contour', 'review.mjs'), ...args], { cwd: root, env: quietEnv(), encoding: 'utf8', timeout: 60000 });
  const chk = gen([doc, '--check']);
  say(/line \d+ shows the picture «assets\/lower\.svg»/.test(chk.stdout || ''), '--check names the missing picture «assets/lower.svg»: ' + ((chk.stdout || '').split('\n').find((l) => /picture/.test(l)) || '(no line)').slice(0, 160));
  say(!/assets\/upper\.svg/.test((chk.stdout || '').split('\n').filter((l) => /picture/.test(l)).join('\n')), '--check is silent about the existing «assets/upper.svg»');
  const b = gen([doc, '--no-serve']);
  const out = ((b.stdout || '').match(/Render written: (.+)/) || [])[1];
  const html = out && existsSync(out.trim()) ? readFileSync(out.trim(), 'utf8') : '';
  say(/<img class="docimg" src="data:image\/svg\+xml;base64,/.test(html) && html.includes('alt="the upper"'), 'the page carries the upper picture as a data: URI');
  say(html.includes('<span class="imgmissing">[the lower]</span>') && !html.includes('!the upper') && !html.includes('!the lower'), 'the missing one is «[the lower]», no «!caption» text');
  if (html && existsSync(EDGE)) {
    const s = spawnSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1100,2000', '--screenshot=' + SNAP, 'file:///' + out.trim().replace(/\\/g, '/')], { encoding: 'utf8', timeout: 60000 });
    say(existsSync(SNAP), 'headless snapshot written: ' + SNAP + ' (exit ' + s.status + ') — look at it');
  } else console.log('ℹ no headless browser — the snapshot is skipped');
} finally { rmSync(root, { recursive: true, force: true }); }
process.exit(ok ? 0 : 1);
