// probe 9 - two more status-line shapes on the v2.9 reader (twins of the #109 class: a word marker without an anchor).
import { docStatus } from './framework/tools/contour/core.mjs';
for (const s of ['🟢 CLOSED; nothing awaiting', '✅ CLOSED — nothing is awaiting an answer', '🟡 not closed yet: Q2 awaiting']) {
  console.log(JSON.stringify(docStatus('# X\n\n> **Status:** ' + s + '\n')) + ' · ' + s);
}
