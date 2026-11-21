#!/usr/bin/env node
// Kimi PermissionRequest → a UTF-8 phrase file → a detached file-based voice tool.
// The voice starts before Kimi waits for the owner and never holds the hook runner open.
// [TESTED: 2026-11-21 · selftest; s01 S15 dry-run; Silero + Glass rendered a 7.14 s WAV without playback]
import { spawn } from 'node:child_process';
import { closeSync, existsSync, openSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { loadContourConfig, ownerSeenAt, quietNow } from '../tools/contour/core.mjs';
import { texts } from '../tools/contour/texts.mjs';
import { logPhrase } from '../tools/contour/voice-soft.mjs';

const MARKER = join('.kaif', 'kaif.json');
export function projectRoot(cwd) {
  for (let dir = resolve(cwd || '.'); ;) {
    if (existsSync(join(dir, MARKER))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function voiceCommand(root, phraseFile, env = process.env) {
  let custom = null;
  try {
    const marker = JSON.parse(readFileSync(join(root, MARKER), 'utf8').replace(/^\uFEFF/, ''));
    custom = marker.contour && marker.contour.voiceFileTool;
  } catch { /* no marker-level engine */ }
  try { if (env.KAIF_VOICE_FILE_TOOL) custom = JSON.parse(env.KAIF_VOICE_FILE_TOOL); } catch { custom = null; }
  const prefix = Array.isArray(custom) && custom.length && custom.every((x) => typeof x === 'string')
    ? custom
    : [process.execPath, join(root, '.kaif', 'tools', 'contour', 'voice-soft.mjs'), '--file', '{file}', '--play'];
  return prefix.map((part) => part.replaceAll('{file}', phraseFile));
}

function selftest() {
  let bad = 0;
  const ok = (condition, name) => { console.log((condition ? 'v ' : 'x ') + name); if (!condition) bad++; };
  const root = projectRoot(process.cwd());
  const command = voiceCommand(root || process.cwd(), 'voice/phrase.txt', {});
  const usesDefault = (cmd) => cmd.some((part) => part.endsWith('voice-soft.mjs'));
  ok(usesDefault(command) && command.includes('voice/phrase.txt') && command.includes('--play'),
    'default: the shipped file-based voice runs with playback');
  const custom = voiceCommand(root || process.cwd(), 'voice/\u0444\u0440\u0430\u0437\u0430.txt', {
    KAIF_VOICE_FILE_TOOL: '["pythonw.exe","-I","say.py","--file","{file}"]',
  });
  ok(custom.join(' ') === 'pythonw.exe -I say.py --file voice/\u0444\u0440\u0430\u0437\u0430.txt',
    'custom: KAIF_VOICE_FILE_TOOL substitutes the UTF-8 phrase path without putting the phrase in argv');
  ok(usesDefault(voiceCommand(root || process.cwd(), 'x.txt', { KAIF_VOICE_FILE_TOOL: 'not json' })),
    'a malformed custom command falls back to the shipped voice');
  console.log(bad ? `selftest: ${bad} failed` : 'selftest: all ok');
  return bad ? 1 : 0;
}

function main() {
  const event = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  if (event.hook_event_name !== 'PermissionRequest') return;
  const root = projectRoot(event.cwd || process.cwd());
  if (!root) return;
  const cfg = loadContourConfig(root);
  const phrase = texts(cfg.language).call.permission(cfg.callName, cfg.spokenProjectName);
  const phraseFile = join(root, logPhrase(root, phrase, { slug: 'permission-request' }));
  const command = voiceCommand(root, phraseFile);
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ phrase, phraseFile, command }));
    return;
  }
  if (quietNow(new Date(), cfg, ownerSeenAt(root)).quiet) {
    console.log('KAIF voice: quiet hours — the phrase is logged, no sound');
    return;
  }
  const logFile = join(root, '.kaif', 'kimi-voice.log');
  const log = openSync(logFile, 'a');
  const child = spawn(command[0], command.slice(1), { cwd: root, windowsHide: true, stdio: ['ignore', log, log] });
  child.on('error', (error) => console.error(`voice spawn failed: ${error.message}`));
  child.unref();
  closeSync(log);
  console.log(`KAIF voice: started in the background — ${phraseFile}`);
}

if (process.argv.includes('--selftest')) process.exit(selftest());
else {
  try { main(); } catch { /* Kimi hooks fail open: a voice failure never blocks permission. */ }
}
