// tools/lib/slot-form.mjs — the FORM of an instruction slot in a payload template, in one place (version KAIF 2.10, epic UB; origin bugs/139
// and ideas/32 p. 14). The core (framework/installer/KAIF-CORE.mjs → instructionSlotLines) knows ONE form: a slot opens on a line that starts
// with «`<» (its code span not closed on that line, or the line ending in «>`») and closes on a line that ENDS in «>`»; the lines inside are
// the field's to fill and `update-verify` never asks for them. A slot in any other form is misread: closed in the middle of a line, it stays
// open and swallows the template lines after it (step 3 of /end-chat-soft swallowed the heading and the judge rule of step 4 — since 2.9);
// opened in the middle of a line, it is no slot for the core, and the field's filled text reads as a template line «not found».
// This module mirrors the core's opening and closing rule (a twin by necessity: the core ships alone, it cannot import tools/) and names
// every slot not in that form. Read by tools/check-framework.mjs (guard 5za) and tools/sandbox/probes/bugs139-slot-form.mjs.
// [TESTED: 2026-11-18 · the inventory of the payload found the two known slots and three twins, silent after the rewrap; guard 5za — probe
//  tools/sandbox/probes/bugs139-slot-red.mjs: control 0, the five files of 6fa213d exactly 5, a mention 0; the field route on eight clones —
//  no new «not found»; report testcases/reports/2026-11-18_bugs143-clock-placeholder.md]

// Pure: (text) → [{ line, kind }] — `line` 1-based; kinds: «closed mid-line» · «opened mid-line» · «not closed before the next heading»
// · «not closed at the end of the file».
export function slotFindings(text) {
  const out = [];
  let open = null;
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  lines.forEach((l, i) => {
    const t = l.trim();
    if (!open) {
      if (t.startsWith('`<') && (t.endsWith('>`') || t.indexOf('`', 1) < 0)) { if (!t.endsWith('>`') || t === '`<') open = { at: i + 1 }; return; }
      const k = l.indexOf('`<');
      if (k >= 0 && t.indexOf('`<') > 0 && l.slice(k + 1).indexOf('`') < 0) out.push({ line: i + 1, kind: 'opened mid-line' });
      return;
    }
    if (/^#{1,6} /.test(t)) { out.push({ line: open.at, kind: 'not closed before the next heading' }); open = null; return; }
    if (t.endsWith('>`')) { open = null; return; }
    if (t.includes('>`')) { out.push({ line: i + 1, kind: 'closed mid-line' }); open = null; }
  });
  if (open) out.push({ line: open.at, kind: 'not closed at the end of the file' });
  return out;
}
