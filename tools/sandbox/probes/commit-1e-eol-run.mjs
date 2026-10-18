// tools/sandbox/probes/commit-1e-eol-run.mjs — a functional run of preflight 1e of tools/commit.mjs (session 88, EXP-0170: the edit tool
// rewrote whole files with CRLF twice in one session) on the tool's real path: a LOCAL CLONE of the origin in the OS temp, one tracked LF
// file rewritten with CRLF, `node tools/commit.mjs --msg-file … --only <file> --no-push` — expected: exit 1, the «✋ … CRLF» line naming
// the file, HEAD and version.json unchanged; control — the same commit with the file back to LF passes 1e (the run stops later or commits
// in the clone; the clone is removed). Identity only by environment (bugs/124). usage: node tools/sandbox/probes/commit-1e-eol-run.mjs
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const FILE = 'PHILOSOPHY.md';
const dir = mkdtempSync(join(tmpdir(), 'kaif-1e-'));
const repo = join(dir, 'repo');
execFileSync('git', ['clone', '--quiet', '--no-hardlinks', '--depth', '1', pathToFileURL(process.cwd()).href, repo]);   // the OS temp may sit on another drive: no hardlinks
// the clone checks out the COMMITTED tool — the tool under proof is the working one
writeFileSync(join(repo, 'tools', 'commit.mjs'), readFileSync(join(process.cwd(), 'tools', 'commit.mjs')));
const env = { ...process.env, GIT_AUTHOR_NAME: 'probe', GIT_AUTHOR_EMAIL: 'probe@example.invalid', GIT_COMMITTER_NAME: 'probe',
  GIT_COMMITTER_EMAIL: 'probe@example.invalid' };
const head = () => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
const msg = join(dir, 'm.txt');
writeFileSync(msg, 'probe: preflight 1e\n');
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const lf = readFileSync(join(repo, FILE), 'utf8');
writeFileSync(join(repo, FILE), lf.replace(/\n/g, '\r\n') + 'probe line\r\n');
const h0 = head(), v0 = readFileSync(join(repo, 'version.json'), 'utf8');
const r = spawnSync(process.execPath, ['tools/commit.mjs', '--msg-file', msg, '--only', FILE, '--no-push'], { cwd: repo, env, encoding: 'utf8' });
const out = (r.stdout || '') + (r.stderr || '');
say(r.status === 1 && /стали CRLF/.test(out) && out.includes(FILE), `CRLF over LF: exit ${r.status}, the line names ${FILE}: ${/стали CRLF/.test(out) && out.includes(FILE)}`);
say(head() === h0 && readFileSync(join(repo, 'version.json'), 'utf8') === v0, 'CRLF over LF: HEAD and version.json unchanged');
writeFileSync(join(repo, FILE), lf + 'probe line\n');
const c = spawnSync(process.execPath, ['tools/commit.mjs', '--msg-file', msg, '--only', FILE, '--no-push'], { cwd: repo, env, encoding: 'utf8' });
const cout = (c.stdout || '') + (c.stderr || '');
say(!/стали CRLF/.test(cout), `control (LF): preflight 1e silent (exit ${c.status})`);
rmSync(dir, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : '✅ preflight 1e stops a CRLF-over-LF file before any side effect and is silent on LF');
process.exit(bad ? 1 : 0);
