// tools/sandbox/probes/bugs141-two-mockups-live.mjs — a PROBE (not a polygon suite): the functional run of bugs/141 (origin issue #199)
// by the owner's path. Two mock-up pictures with ONE file name in two folders (`a/compare.png`, `b/compare.png`) are shown one after the
// other by the REAL contour server (face «mockup», no window: `open: false`, no sound: `signal: false`), each page is driven in a HEADLESS
// Chromium — the owner's remark typed into the comment field, «Done» pressed — and the server records the verdict and ends (I8). Then
// both records are read back the way the queue and the page read them (`readDecision`) and the decision files are listed.
//   this build → «a: A answer · b: B answer», two decision files — OK;
//   the contour of an older revision (`--rev <rev>`, e.g. HEAD before the fix) → «a: B answer» — the defect reproduced (exit 1).
// The source tree is only read: the contour of `--rev` is taken by `git archive` into a temporary folder; the project is a temporary folder.
// usage: node tools/sandbox/probes/bugs141-two-mockups-live.mjs [--rev <git revision>]   (≈ 20 s, alone: it starts a headless browser)
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { headlessPage } from '../../lib/cdp-mini.mjs';

process.env.KAIF_VOICE_TOOL = '';   // no voice engine for this process, whatever the contour would try
const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const at = process.argv.indexOf('--rev'), rev = at > 0 ? process.argv[at + 1] : null;
const work = mkdtempSync(join(tmpdir(), 'kaif-bugs141-live-'));
let contourDir = join(REPO, 'framework', 'tools', 'contour');
if (rev) {   // the contour of that revision, extracted next to the probe's project — the repository's tree is never touched
  const tar = join(work, 'contour.tar');
  const a = spawnSync('git', ['archive', '--format=tar', '-o', tar, rev, 'framework/tools/contour'], { cwd: REPO, encoding: 'utf8' });
  if (a.status !== 0) { console.log('✖ git archive ' + rev + ' failed: ' + (a.stderr || '').trim()); process.exit(2); }
  const x = spawnSync('tar', ['-xf', 'contour.tar'], { cwd: work, encoding: 'utf8' });
  if (x.status !== 0) { console.log('✖ tar -xf failed: ' + (x.stderr || '').trim()); process.exit(2); }
  contourDir = join(work, 'framework', 'tools', 'contour');
}
const { serveContour } = await import(pathToFileURL(join(contourDir, 'review.mjs')).href);
const { readDecision } = await import(pathToFileURL(join(contourDir, 'core.mjs')).href);

const root = join(work, 'project');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
for (const d of ['a', 'b']) { mkdirSync(join(root, d), { recursive: true }); writeFileSync(join(root, d, 'compare.png'), PNG); }
mkdirSync(join(root, 'interviews', 'decisions'), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ownerAnswers(doc, remark) {   // the owner's path on one mock-up page: type the remark, press Done
  let url = null;
  serveContour._onUp = (u) => { url = u; };
  const served = serveContour(root, { docPath: doc, face: 'mockup' }, { open: false, signal: false, log: () => {} });
  for (let i = 0; !url && i < 200; i++) await sleep(50);
  if (!url) return 'no page came up';
  const page = await headlessPage(url, { profileDir: join(work, 'profile-' + doc.replace(/\W/g, '_')) });
  try {
    const field = 'doccomment:' + doc;
    const typed = await page.evaluate('(function(){var t=document.querySelector(\'textarea[name="' + field + '"]\');if(!t)return false;'
      + 't.value=' + JSON.stringify(remark) + ';t.dispatchEvent(new Event("input",{bubbles:true}));document.getElementById("save").click();return true})()');
    if (!typed) return 'no comment field ' + field + ' on the page';
    const out = await Promise.race([served, sleep(10000).then(() => null)]);
    return out ? out.outcome : 'the server did not end within 10 s';
  } finally { page.close(); }
}

let bad = 0;
try {
  const oa = await ownerAnswers('a/compare.png', 'A answer');
  const ob = await ownerAnswers('b/compare.png', 'B answer');
  const ra = readDecision(root, 'a/compare.png'), rb = readDecision(root, 'b/compare.png');
  const files = readdirSync(join(root, 'interviews', 'decisions')).filter((f) => f.endsWith('.decision.json')).sort();
  console.log('contour: ' + (rev ? 'revision ' + rev : 'this build (framework/tools/contour)'));
  console.log('page a/compare.png: ' + oa + ' · page b/compare.png: ' + ob);
  console.log('a reads: ' + (ra ? ra.comment : 'null') + ' · b reads: ' + (rb ? rb.comment : 'null') + ' · decision files: ' + files.join(', '));
  const good = ra && ra.comment === 'A answer' && rb && rb.comment === 'B answer' && files.length === 2;
  if (!good) bad++;
  console.log(good ? '✅ each mock-up keeps its own verdict' : '✖ RED — a verdict is lost or read for the other picture (bugs/141)');
} finally { rmSync(work, { recursive: true, force: true }); }
process.exit(bad ? 1 : 0);
