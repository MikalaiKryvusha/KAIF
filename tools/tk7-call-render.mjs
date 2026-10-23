// tools/tk7-call-render.mjs — a PROBE OUTSIDE the sandbox on purpose: like verify-contour, it reaches this machine's REAL audio engines (the
// sandbox's quiet-child preflight forbids that there, rightly). It imports only the pure functions of the generator (speakable · callWav ·
// pcmOfWav) and never starts the generator.
// [TESTED: 2026-10-23 ≈ 09:08 · run without --play: SAPI ru → 22050 Hz, 8.90 s, glued; eugene --out → 48000 Hz, 5.22 s, glued; call file
//  1.00 s of silence, beep peak −1.3 dBFS; report testcases/reports/2026-10-23_tk7-page-and-call.md]
// Step TK7 (c) of version KAIF 2.10 (origin #165) on the REAL
// engines of this machine, WITHOUT playing a sound: (1) the system voice (Windows SAPI) renders the phrase into a WAV the way signalCall asks
// it to — the file must be a 16-bit mono PCM the glue accepts (pcmOfWav), at CALL_RATE; (2) when KAIF_VOICE_TOOL is set, the tool renders the
// phrase with `--out <wav>` — the probe names whether its file is glued (16-bit mono, its own rate) or the contour falls back to «beeps, then
// the tool speaks»; (3) the call file is composed and its parts are measured: the silence before the beeps, the beeps' peak, the pause, the
// voice. Nothing is played (`--play` plays the composed file ONCE — only when the owner asked to hear it).
// usage: node tools/tk7-call-render.mjs [--play]   (Windows; ≈ 10–40 s — the rich tool loads its model)
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const GEN = pathToFileURL(join(process.cwd(), 'framework', 'tools', 'contour', 'review.mjs')).href;
const { speakable, callWav, pcmOfWav } = await import(GEN);
const PHRASE_IN = 'KAIF: interview #010 waits; Vulkan and Blender 2.10, load 80%';
const RATE_SYS = 22050;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const dir = mkdtempSync(join(tmpdir(), 'kaif-tk7-call-'));
const phrase = speakable(PHRASE_IN, { language: 'ru' });
say(!/[A-Za-z0-9]/.test(phrase), 'speakable (ru): ' + phrase);

// (1) the system voice renders into a file — the same PowerShell call signalCall makes (format asked: 22.05 kHz, 16-bit, mono)
const phraseFile = join(dir, 'p.txt'), sysWav = join(dir, 'sys.wav');
writeFileSync(phraseFile, String.fromCharCode(0xfeff) + phrase, 'utf8');
const q = (p) => p.replace(/'/g, "''");
const ps = spawnSync('powershell.exe', ['-NoProfile', '-Command',
  'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
  "$vs = @($s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name.ToLower().StartsWith('ru') }); if ($vs.Count -eq 0) { exit 3 }; " +
  '$s.SelectVoice($vs[0].VoiceInfo.Name); ' +
  '$f = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(' + RATE_SYS + ', [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono); ' +
  "$s.SetOutputToWaveFile('" + q(sysWav) + "', $f); $s.Speak([IO.File]::ReadAllText('" + q(phraseFile) + "')); $s.Dispose()"], { encoding: 'utf8', timeout: 60000 });
if (ps.status === 3) console.log('SKIP system voice: no ru voice installed (exit 3) — the contour says so and calls with beeps + banner');
else {
  const v = existsSync(sysWav) ? pcmOfWav(readFileSync(sysWav)) : null;
  say(ps.status === 0 && v && v.rate === RATE_SYS && v.pcm.length > RATE_SYS, 'system voice → ' + (v ? v.rate + ' Hz, ' + (v.pcm.length / 2 / v.rate).toFixed(2) + ' s of voice, glued' : 'no usable WAV (exit ' + ps.status + ')'));
}

// (2) the rich tool renders with --out — glued when 16-bit mono, else the fallback
const tool = process.env.KAIF_VOICE_TOOL;
let richV = null;
if (!tool) console.log('SKIP rich tool: no KAIF_VOICE_TOOL on this machine');
else {
  const toolWav = join(dir, 'tool.wav');
  const r = spawnSync(process.execPath, [tool, phrase, '--out', toolWav, '--voice', process.env.KAIF_VOICE || 'default'], { encoding: 'utf8', timeout: 180000 });
  richV = r.status === 0 && existsSync(toolWav) ? pcmOfWav(readFileSync(toolWav)) : null;
  console.log((richV ? 'OK  ' : 'INFO') + ' rich tool (' + (process.env.KAIF_VOICE || 'default') + ') with --out → ' + (richV ? richV.rate + ' Hz, '
    + (richV.pcm.length / 2 / richV.rate).toFixed(2) + ' s of voice — glued into ONE file' : 'no 16-bit mono WAV (exit ' + r.status + ') — the contour falls back to «beeps, then the tool speaks»'));
}

// (3) the composed call — the parts measured
const v = richV || (existsSync(sysWav) ? pcmOfWav(readFileSync(sysWav)) : null);
if (v) {
  const call = callWav(v.pcm, { rate: v.rate }), c = pcmOfWav(call).pcm;
  let firstLoud = -1; for (let k = 0; k < c.length / 2; k++) if (Math.abs(c.readInt16LE(k * 2)) > 0) { firstLoud = k; break; }
  let peak = 0; for (let k = firstLoud; k < firstLoud + v.rate * 0.16; k++) peak = Math.max(peak, Math.abs(c.readInt16LE(k * 2)));
  say(firstLoud >= v.rate && peak > 0.8 * 32767, 'call file: ' + (firstLoud / v.rate).toFixed(2) + ' s of silence, beep peak ' + (20 * Math.log10(peak / 32767)).toFixed(1)
    + ' dBFS, total ' + (c.length / 2 / v.rate).toFixed(2) + ' s (voice ' + (v.pcm.length / 2 / v.rate).toFixed(2) + ' s)');
  if (process.argv.includes('--play')) {
    const f = join(dir, 'call.wav'); writeFileSync(f, call);
    spawnSync('powershell.exe', ['-NoProfile', '-Command', "(New-Object System.Media.SoundPlayer '" + q(f) + "').PlaySync()"], { timeout: 60000 });
    console.log('played once: ' + f);
  }
}
rmSync(dir, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : '✅ the call renders on this machine\'s engines and composes into one file (nothing played unless --play)');
process.exit(bad ? 1 : 0);
