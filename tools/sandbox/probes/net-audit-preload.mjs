// tools/sandbox/probes/net-audit-preload.mjs — a PROBE (not a polygon suite): a PRELOAD that lists every network call the
// polygon makes. Origin bug 109: `node` died five times with a native Windows crash (status 3221226505) inside `update`,
// always in the window where the core fetches the PREVIOUS release's artifact from github.com — and nobody had ever
// counted how often a polygon run goes to the network at all. This file wraps the global `fetch` of every node process
// that loads it and appends one line per call to the file named by KAIF_NET_AUDIT_LOG; without that variable it does
// nothing. It changes no behaviour: the real `fetch` is called with the same arguments and its result is returned as is.
//
// Run (Git Bash; the log path is yours, outside the repo):
//   KAIF_NET_AUDIT_LOG=<file> NODE_OPTIONS="--import file:///D:/path/to/repo/tools/sandbox/probes/net-audit-preload.mjs" npm run test:core
// A hermetic polygon (the default since 2026-09-18, tools/lib/sandbox-run.mjs → hermeticArgs) must leave the file EMPTY or
// absent; KAIF_SANDBOX_NETWORK=1 in front of the same line shows what the polygon used to fetch.
// Raises no window and no sound; writes only the one log file.
// [TESTED: 2026-09-18 · smoke 15:30 (one fetch to 127.0.0.1:9 -> one log line, the call itself still answered);
//  hermetic polygon 16:05 -> 16:08 -> 4 lines, "all 27 suites green"; online polygon (KAIF_SANDBOX_NETWORK=1) 16:08 -> 16:11
//  -> 58 lines, 55 to github.com, "all 27 suites green". Report: testcases/reports/2026-09-18_session67-side-runs.md]
import { appendFileSync } from 'node:fs';

const LOG = process.env.KAIF_NET_AUDIT_LOG;
if (LOG && typeof globalThis.fetch === 'function' && !globalThis.__kaifNetAudit) {
  globalThis.__kaifNetAudit = true;
  const realFetch = globalThis.fetch;
  globalThis.fetch = function kaifAuditedFetch(input, init) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || String(input);
      const who = process.argv.slice(1, 5).map((a) => String(a).split(/[\\/]/).slice(-2).join('/')).join(' ');
      appendFileSync(LOG, `${new Date().toISOString()} pid=${process.pid} ${url} :: ${who}\n`);
    } catch { /* the audit must never break the call it watches */ }
    return realFetch.call(this, input, init);
  };
}
