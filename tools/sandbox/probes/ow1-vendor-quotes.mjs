// tools/sandbox/probes/ow1-vendor-quotes.mjs — a PROBE (not a polygon suite; it goes to the network): re-fetches every vendor source that
// researches/34 §2–§4 cites for mid-turn delivery (how an owner's message typed while the agent works reaches the model, how the turn is
// stopped, what a hook sees) and looks for the quoted fragment in the page. Vendor docs drift — a session touching framework/adapters/* or
// the mid-turn rule of plans/119 OW2 re-runs this before it trusts a row of the research document.
// Search is markup-normalized: tags stripped, entities decoded, backticks and double quotes dropped, whitespace collapsed, case folded.
// Verdicts: FOUND · ABSENT (page fetched, fragment not in it — a JS-rendered page can be ABSENT falsely: read the page before calling the
// row refuted) · FETCH-FAIL. Exit 0 — every row FOUND; 1 — any ABSENT or FETCH-FAIL; 2 — usage.
// usage: node tools/sandbox/probes/ow1-vendor-quotes.mjs [--save <dir>]  (pages are saved for reading by hand when --save is given)
// Raises no window and no sound.
// [TESTED: 2026-09-25 16:27 +03:00 · session 74: «all 40 vendor quotes found on their pages», exit 0; a copy with ONE quote altered —
//  ABSENT on exactly that row, exit 1; the first run gave a false ABSENT (the loose tag regex, fixed above); two corrections of the raw
//  scout report (the Codex hook row «turn scope», the Cursor row «second Enter — interrupt») are not on the vendor pages and were replaced
//  by what the pages say — researches/34 §3–§4; report testcases/reports/2026-09-25_ow1-vendor-quotes.md]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
if (argv.some((a) => a.startsWith('--') && a !== '--save')) { console.error('usage: node tools/sandbox/probes/ow1-vendor-quotes.mjs [--save <dir>]'); process.exit(2); }
const SAVE = argv.includes('--save') ? argv[argv.indexOf('--save') + 1] : '';
const RAW = 'https://raw.githubusercontent.com';
const GROK_UG = `${RAW}/xai-org/grok-build/HEAD/crates/codegen/xai-grok-pager/docs/user-guide`;
const GH_DOCS = `${RAW}/github/docs/main/content/copilot/how-tos`;
// [section of researches/34, system, url, fragment] — the fragment is the quoted words, normalized the same way as the page.
const ROWS = [
  ['§2', 'Claude Code', 'https://code.claude.com/docs/en/interactive-mode.md', 'claude code queues the message instead of interrupting the turn'],
  ['§2', 'Claude Code', 'https://code.claude.com/docs/en/interactive-mode.md', 'stop the current response or tool call mid-turn so you can redirect'],
  ['§2', 'Claude Code', 'https://code.claude.com/docs/en/cross-session-messaging.md', 'a message from another session never counts as your consent'],
  ['§3', 'OpenAI Codex', 'https://learn.chatgpt.com/docs/developer-commands', 'inject new instructions into the current turn'],
  ['§3', 'OpenAI Codex', 'https://learn.chatgpt.com/docs/ide/settings', 'or steer the current run'],
  ['§3', 'OpenAI Codex', 'https://learn.chatgpt.com/docs/app-server', 'to append more user input to the active in-flight turn'],
  ['§3', 'OpenAI Codex', 'https://learn.chatgpt.com/docs/app-server', 'turn/interrupt'],
  ['§3', 'OpenAI Codex', 'https://learn.chatgpt.com/docs/hooks', 'when you interrupt an active turn'],
  ['§3', 'OpenAI Codex', 'https://github.com/openai/codex/pull/10656', 'emitting user message turn items'],
  ['§3', 'Cursor', 'https://cursor.com/docs/agent/overview', "delivered at the agent's next tool call"],
  ['§3', 'Cursor', 'https://cursor.com/changelog/08-19-26', 'follow-ups wait for the next tool call instead of cutting the agent off mid-action'],
  ['§3', 'Cursor', 'https://cursor.com/docs/agent/hooks', 'beforesubmitprompt'],
  ['§3', 'GitHub Copilot', 'https://code.visualstudio.com/docs/chat/chat-overview', 'yield after finishing the current tool execution'],
  ['§3', 'GitHub Copilot', 'https://code.visualstudio.com/docs/chat/chat-overview', 'cancels the current request entirely and sends your new message right away'],
  ['§3', 'GitHub Copilot', `${GH_DOCS}/copilot-on-github/use-copilot-agents/manage-and-track-agents.md`, 'implements your input after it finishes its current tool call'],
  ['§3', 'GitHub Copilot', `${GH_DOCS}/copilot-cli/use-copilot-cli/steer-agents.md`, 'is treated as steering and is considered in the context of the current task'],
  ['§3', 'GitHub Copilot', 'https://code.visualstudio.com/docs/copilot/customization/hooks', 'userpromptsubmit'],
  ['§3', 'Windsurf', 'https://docs.devin.ai/desktop/cascade', 'enter again on an empty text box to send it right away'],
  ['§3', 'Windsurf', 'https://docs.devin.ai/desktop/cascade/hooks', 'pre_user_prompt'],
  ['§3', 'Cline', `${RAW}/cline/cline/main/CHANGELOG.md`, 'queued, shown while the current turn streams'],
  ['§3', 'Cline', `${RAW}/cline/cline/main/CHANGELOG.md`, 'they survive aborts'],
  ['§3', 'Cline', 'https://cline.bot/blog/cline-v3-36-hooks', 'taskcancel'],
  ['§3', 'Roo Code', 'https://roocodeinc.github.io/Roo-Code/features/message-queueing', 'queued messages act as approval for the next action'],
  ['§3', 'Zoo Code', 'https://docs.zoocode.dev/features/message-queueing', 'processed as soon as zoo is ready for your next input'],
  ['§3', 'Zoo Code', 'https://github.com/Zoo-Code-Org/Zoo-Code/issues/1518', 'stop the current model turn and read my message immediately'],
  ['§3', 'Zoo Code', 'https://github.com/Zoo-Code-Org/Zoo-Code/pull/1711', 'drain queued user messages'],
  ['§3', 'Google Antigravity', 'https://antigravity.google/changelog', 'added support for queued messages'],
  ['§3', 'Google Antigravity', 'https://antigravity.google/docs/cli/prompting', 'instantly cancels any active agent turn'],
  ['§3', 'Google Antigravity', 'https://antigravity.google/docs/hooks', 'preinvocation'],
  ['§3', 'Grok Build', `${GROK_UG}/03-keyboard-shortcuts.md`, 'injects it mid-turn at the next tool or model safe gap'],
  ['§3', 'Grok Build', `${GROK_UG}/03-keyboard-shortcuts.md`, 'send-now is intentionally interruptive'],
  ['§3', 'Grok Build', `${GROK_UG}/03-keyboard-shortcuts.md`, 'it never cancels a running turn'],
  ['§3', 'Grok Build', 'https://docs.x.ai/build/keyboard-shortcuts', 'esc cancel the running turn'],
  ['§3', 'Grok Build', 'https://docs.x.ai/build/features/hooks', 'userpromptsubmit'],
  ['§4', 'LangGraph', 'https://docs.langchain.com/oss/python/langgraph/interrupts', 'gets suspended at the exact point where'],
  ['§4', 'OpenAI Agents SDK', 'https://openai.github.io/openai-agents-python/streaming/', 'by default this stops the run immediately'],
  ['§4', 'OpenAI Agents SDK', 'https://openai.github.io/openai-agents-python/streaming/', 'after_turn'],
  ['§4', 'Claude Agent SDK', 'https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode', 'send multiple messages that process sequentially, with ability to interrupt'],
  ['§4', 'Anthropic', 'https://www.anthropic.com/engineering/building-effective-agents', 'agents can then pause for human feedback at checkpoints or when encountering blockers'],
  ['§4', 'OpenAI Model Spec', 'https://model-spec.openai.com/2026-08-18.html', 'tool outputs are assumed to contain untrusted data and have no authority by default'],
];
const FETCH_TIMEOUT_MS = 30000;
// A tag is `<` + a letter (or `/letter`) up to the nearest `>` on the SAME line: the loose `<[^>]+>` once ran from a stray `<` of a markdown
// page to a far `>` and ate the quoted sentence with it (a false ABSENT on the Claude Code page, 2026-09-25 16:26).
const norm = (s) => s.replace(/<\/?[a-z][^<>\n]*>/gi, ' ').replace(/&#x27;|&#39;|&rsquo;|&#8217;|’/g, "'").replace(/&quot;|&#34;|[“”]/g, '"')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[`"*]/g, '')
  .replace(/\\/g, '').replace(/\s+/g, ' ').toLowerCase();
const pages = new Map();
const page = async (url) => {
  if (!pages.has(url)) {
    pages.set(url, (async () => {
      try {
        const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (KAIF recon re-verify)' }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        const text = await r.text();
        if (SAVE) { mkdirSync(SAVE, { recursive: true }); writeFileSync(join(SAVE, url.replace(/[^a-z0-9]+/gi, '_').slice(0, 120) + '.txt'), text); }
        return r.ok ? { text: norm(text) } : { fail: `HTTP ${r.status}` };
      } catch (e) { return { fail: String(e.message || e).slice(0, 60) }; }
    })());
  }
  return pages.get(url);
};
let bad = 0;
for (const [sec, sys, url, frag] of ROWS) {
  const p = await page(url);
  const verdict = p.fail ? `FETCH-FAIL (${p.fail})` : p.text.includes(norm(frag)) ? 'FOUND' : 'ABSENT';
  if (verdict !== 'FOUND') bad++;
  console.log(`${verdict.padEnd(12)} ${sec} ${sys.padEnd(18)} «${frag}» ${url}`);
}
console.log(bad ? `❌ ${bad} of ${ROWS.length} row(s) not found on the vendor page — read the page before trusting or refuting the row` : `✅ all ${ROWS.length} vendor quotes found on their pages`);
process.exit(bad ? 1 : 0);
