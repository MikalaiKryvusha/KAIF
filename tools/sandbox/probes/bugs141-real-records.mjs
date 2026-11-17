// tools/sandbox/probes/bugs141-real-records.mjs — a PROBE (not a polygon suite): the real-world line of bugs/141 (origin issue #199).
// The fix must leave every ACCUMULATED decision record where it is: for each `*.decision.json` of a real project, the document it names
// resolves (decisionPaths) to that same file and readDecision returns the same record — with the contour of `--rev` (before the fix) and
// with this build. Read-only by construction: only decisionPaths / readDecision / readFileSync are called, and the folder's file list and
// mtimes are compared before and after. Deployments are printed by number, never by name; a document name is never printed.
// A record whose document holds the bare name of ANOTHER record's document (a live collision of bugs/141) is counted, not judged equal.
// usage: node tools/sandbox/probes/bugs141-real-records.mjs [--rev <git revision>] <project root> …   (≈ 1 s per project)
import { mkdtempSync, readdirSync, readFileSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const REPO = resolve(new URL('../../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const args = process.argv.slice(2);
const at = args.indexOf('--rev'), rev = at >= 0 ? args[at + 1] : 'HEAD';
const roots = args.filter((a, i) => !(at >= 0 && (i === at || i === at + 1)));
if (!roots.length) { console.log('usage: bugs141-real-records.mjs [--rev <rev>] <project root> …'); process.exit(2); }
const work = mkdtempSync(join(tmpdir(), 'kaif-bugs141-real-'));
let bad = 0;
try {
  const tar = join(work, 'c.tar');
  if (spawnSync('git', ['archive', '--format=tar', '-o', tar, rev, 'framework/tools/contour'], { cwd: REPO }).status !== 0
    || spawnSync('tar', ['-xf', 'c.tar'], { cwd: work }).status !== 0) { console.log('✖ could not extract the contour of ' + rev); process.exit(2); }
  const OLD = await import(pathToFileURL(join(work, 'framework', 'tools', 'contour', 'core.mjs')).href);
  const NEW = await import(pathToFileURL(join(REPO, 'framework', 'tools', 'contour', 'core.mjs')).href);
  roots.forEach((r, i) => {
    const root = resolve(r), label = 'project ' + (i + 1);
    const cfg = NEW.loadContourConfig(root), dir = resolve(root, cfg.decisionsDir);
    if (!existsSync(dir)) { console.log(label + ': no decisions folder — nothing to compare'); return; }
    const snap = () => readdirSync(dir).sort().map((f) => f + ':' + statSync(join(dir, f)).mtimeMs).join('|');
    const before = snap();
    const files = readdirSync(dir).filter((f) => f.endsWith('.decision.json')).sort();
    let same = 0, noDoc = 0, differ = 0, collision = 0;
    for (const f of files) {
      let rec; try { rec = JSON.parse(readFileSync(join(dir, f), 'utf8').replace(/^\uFEFF/, '')); } catch { rec = null; }
      const doc = rec && typeof rec.document === 'string' ? rec.document : null;
      if (!doc) { noDoc++; continue; }
      const oldP = OLD.decisionPaths(root, doc, cfg).decision, newP = NEW.decisionPaths(root, doc, cfg).decision;
      const o = JSON.stringify(OLD.readDecision(root, doc, cfg)), n = JSON.stringify(NEW.readDecision(root, doc, cfg));
      // judge of session 103 (finding 8): the same record through the path forms a CLI gets — absolute, backslashes, another case (Windows)
      const forms = [resolve(root, doc), resolve(root, doc).replace(/\//g, '\\'), ...(process.platform === 'win32' ? [doc.toUpperCase()] : [])];
      const formsSame = forms.every((p) => JSON.stringify(NEW.readDecision(root, p, cfg)) === JSON.stringify(rec));
      if (!formsSame) { differ++; console.log('  ✖ ' + label + ' record #' + (files.indexOf(f) + 1) + ': another path form reads another record'); continue; }
      const mine = resolve(newP) === resolve(join(dir, f));
      if (resolve(oldP) !== resolve(join(dir, f))) collision++;           // the old name pointed elsewhere: a live collision, counted
      else if (mine && o === n && n === JSON.stringify(rec)) same++;
      else { differ++; console.log('  ✖ ' + label + ' record #' + (files.indexOf(f) + 1) + ': resolves to its own file ' + mine + ', old = new ' + (o === n)); }
    }
    const after = snap();
    if (differ || before !== after) bad++;
    console.log(label + ': ' + files.length + ' records — same file and same record under both cores ' + same + ' · no document field ' + noDoc
      + ' · a live collision of the old name ' + collision + ' · differ ' + differ + ' · folder untouched ' + (before === after));
  });
} finally { rmSync(work, { recursive: true, force: true }); }
console.log(bad ? `✖ ${bad} project(s) BAD` : '✅ every accumulated record resolves and reads as before');
process.exit(bad ? 1 : 0);
