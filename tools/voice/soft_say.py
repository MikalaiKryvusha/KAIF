# tools/voice/soft_say.py — the soft voice's renderer with longer punctuation pauses; the origin's KAIF_VOICE_RENDER for
# framework/tools/contour/voice-soft.mjs (tools/review.mjs sets it). Taken as it stands from the owner's field deployment, whose voice
# settings the owner asked KAIF to take (2026-11-07, decision №156) — the ORIGIN machine's tool, not part of the delivery.
# The owner, 2026-10-18 (chat): «научите голос делать больше паузы на запятых, на тире - на знаках препинания, на точках, между
# предложениями. в раза два больше, чем он сейчас делает».
# How: the machine's Silero model (F:\KLAS\voice\models\v5_ru.pt, run by the KLAS venv Python — a machine resource, never edited from here)
# is loaded ONCE; the phrase is cut after each punctuation mark, every piece is spoken with its mark (the intonation stays natural), and an
# EXTRA silence is put after it — about as long as Silero's own pause, so the pause doubles. Text normalisation is KLAS's `text_norm`.
# Use: <KLAS python> -I tools/voice/soft_say.py "<text>" <out.wav> [voice]
# [NOT-TESTED]
import re
import sys
import wave
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    _s.reconfigure(encoding="utf-8", errors="strict")

KLAS_VOICE_TOOLS = Path(r"F:\KLAS\tools\voice")
MODEL = Path(r"F:\KLAS\voice\models\v5_ru.pt")
SAMPLE_RATE = 48000
PAUSE_SOFT_SEC = 0.30   # extra after , ; : — –  («паузы на запятых, на тире»)
PAUSE_HARD_SEC = 0.55   # extra after . ! ? …  («на точках, между предложениями»)
PIECE = re.compile(r"[^,;:.!?…—–]+[,;:.!?…—–]*")


def main() -> None:
    text, out = sys.argv[1], Path(sys.argv[2])
    voice = sys.argv[3] if len(sys.argv) > 3 else "eugene"
    import torch
    torch.set_num_threads(4)
    model = torch.package.PackageImporter(MODEL).load_pickle("tts_models", "model")
    model.to(torch.device("cpu"))
    sys.path.insert(0, str(KLAS_VOICE_TOOLS))
    from text_norm import normalize

    chunks = []
    for m in PIECE.finditer(text):
        piece = m.group(0).strip()
        if not re.search(r"[0-9A-Za-zА-Яа-яЁё]", piece):
            continue
        spoken = normalize(piece, translit="full")
        audio = model.apply_tts(text=spoken, speaker=voice, sample_rate=SAMPLE_RATE)
        chunks.append(audio)
        tail = piece[-1]
        pause = PAUSE_HARD_SEC if tail in ".!?…" else PAUSE_SOFT_SEC if tail in ",;:—–" else 0.0
        if pause:
            chunks.append(torch.zeros(int(SAMPLE_RATE * pause)))
    if not chunks:
        raise SystemExit("nothing to say")
    audio = torch.cat(chunks)
    pcm = (audio * 32767).clamp(-32768, 32767).to(torch.int16).numpy().tobytes()
    out.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(pcm)
    print(f"done {out} {len(audio) / SAMPLE_RATE:.2f}s pieces={sum(1 for c in chunks if c.abs().max() > 0)}", file=sys.stderr)


if __name__ == "__main__":
    main()
