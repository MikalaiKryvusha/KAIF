#!/usr/bin/env node
// bugs/148: the origin's say and review --call must use contour.voiceFileTool (Silero + Glass), never the old beep renderer.
// The fixture voice records the phrase file and plays nothing. --broken removes only the delegation in the temporary copy.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const broken = process.argv.includes('--broken');
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const work = mkdtempSync(join(tmpdir(), 'kaif-bugs148-'));
let bad = 0;
const ok = (condition, name, detail = '') => { console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${condition || !detail ? '' : ' · ' + detail}`); if (!condition) bad++; };
try {
  for (const dir of ['tools/lib', 'framework/tools/contour']) mkdirSync(join(work, dir), { recursive: true });
  cpSync(join(source, 'tools', 'say.mjs'), join(work, 'tools', 'say.mjs'));
  cpSync(join(source, 'tools', 'review.mjs'), join(work, 'tools', 'review.mjs'));
  cpSync(join(source, 'tools', 'lib', 'voice-env.mjs'), join(work, 'tools', 'lib', 'voice-env.mjs'));
  for (const f of readdirSync(join(source, 'framework', 'tools', 'contour')).filter((f) => f.endsWith('.mjs')))
    cpSync(join(source, 'framework', 'tools', 'contour', f), join(work, 'framework', 'tools', 'contour', f));
  const soft = join(work, 'framework', 'tools', 'contour', 'voice-soft.mjs');
  if (broken) {
    const text = readFileSync(soft, 'utf8');
    const block = text.match(/  \/\/ The owner's configured file-based engine[\s\S]*?\n  if \(fileVoice\) \{[\s\S]*?\n  \}\n(?=  const voiceArg)/);
    if (!block) throw new Error('the delegation mutation did not apply');
    writeFileSync(soft, text.replace(block[0], ''));
  }

  mkdirSync(join(work, '.kaif'), { recursive: true });
  mkdirSync(join(work, 'voice'), { recursive: true });
  const capture = join(work, 'capture.jsonl');
  const fixture = join(work, 'voice-fixture.mjs');
  writeFileSync(fixture, "import { appendFileSync, readFileSync } from 'node:fs'; const file=process.argv[2]; appendFileSync(process.env.CAPTURE, JSON.stringify({file,text:readFileSync(file,'utf8')})+'\\n');\n");
  writeFileSync(join(work, '.kaif', 'kaif.json'), JSON.stringify({ contour: { voiceFileTool: [process.execPath, fixture, '{file}'] } }));
  const phraseFile = join(work, 'voice', 'phrase.txt');
  writeFileSync(phraseFile, 'Glass route through say.\n');
  const env = { ...process.env, CAPTURE: capture, KAIF_VOICE_RENDER: '[]', KAIF_VOICE_BASE_TOOL: '', KAIF_VOICE_FILE_TOOL: '' };
  delete env.KAIF_VOICE_FILE_TOOL;
  delete env.KAIF_VOICE_TOOL;
  const say = spawnSync(process.execPath, [join(work, 'tools', 'say.mjs'), '--file', phraseFile, '--play'], { cwd: work, env, encoding: 'utf8', timeout: 30000 });
  const records = () => existsSync(capture) ? readFileSync(capture, 'utf8').trim().split('\n').filter(Boolean).map((x) => JSON.parse(x)) : [];
  ok(broken ? say.status !== 0 && records().length === 0 : say.status === 0 && records()[0]?.text === 'Glass route through say.\n',
    `say uses the configured file tool${broken ? ' — red without delegation' : ''}`, `exit=${say.status} ${say.stdout} ${say.stderr}`.slice(-400));

  if (!broken) {
    const review = spawnSync(process.execPath, [join(work, 'tools', 'review.mjs'), '--call', 'Glass route through review'], { cwd: work, env, encoding: 'utf8', timeout: 30000 });
    const seen = records();
    ok(review.status === 0 && seen.length === 2 && seen[1].text.endsWith('Glass route through review\n'),
      'review --call uses the same file tool and keeps the voice log', `exit=${review.status} records=${seen.length} ${review.stdout} ${review.stderr}`.slice(-500));
    ok(readdirSync(join(work, 'voice')).some((f) => /glass-route-through-review/.test(f)), 'review --call leaves its phrase in voice/');
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
console.log(bad ? `FAIL ${bad}` : broken ? 'PASS: the pre-delegation path is red without calling any voice' : 'PASS: both origin voice paths use the configured Glass tool');
process.exit(bad ? 1 : 0);
