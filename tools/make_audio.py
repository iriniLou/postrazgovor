"""
Готовит фрагменты песен для игр и считает доли (биты) для ритм-игры.

  python tools/make_audio.py "C:/Users/Ирина/Downloads"

Нужен ffmpeg: либо в PATH, либо пакет imageio-ffmpeg (pip install imageio-ffmpeg),
либо путь в переменной окружения FFMPEG. Нужен numpy.

Результат:
  src/audio/<id>.mp3   — фрагмент 45 секунд, моно, 64 кбит/с, с плавным началом и концом
  src/js/beats.js      — моменты долей для каждого фрагмента (для игры «Шайба в ритм»)

Чтобы поменять, с какого места берётся фрагмент, впишите секунду в START (None — выбрать
самое громкое место автоматически) и запустите скрипт ещё раз.
"""
import json
import os
import pathlib
import shutil
import subprocess
import sys

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_AUDIO = ROOT / "src" / "audio"
OUT_BEATS = ROOT / "src" / "js" / "beats.js"

CLIP = 45.0   # длина фрагмента, секунд
SR = 22050

SONGS = {
    "hockey":   "trus_ne_igraet_v_hokkey_-_eduard_hil.mp3",
    "moskva":   "lev-leshhenko-tatjana-anciferova-do-svidanija-moskva.mp3",
    "nezhnost": "Кристалинская - Нежность (А.Пахмутова & Н.Добронравов).mp3",
    "molody":   "Иосиф Кобзон - Как Молоды Мы Были (А.Пахмутова - Н.Добронравов).mp3",
    "belovezh": "belovezhskaya_puscha_bdh.mp3",
    "ptica":    "nadezhda-chepraga-ptica-schastja.mp3",
    "gagarin":  "jurijj-guljaev-sozvezdie-gagarina.mp3",
    "inache":   "valentina-tolkunova-jestradno-simfonicheskijj-orkestr-vsesojuznogo-radio-i-centralnogo-televidenija-ja-ne-mogu-inache.mp3",
}

START = {k: None for k in SONGS}   # например: START["hockey"] = 12.0


def ffmpeg_exe():
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    if shutil.which("ffmpeg"):
        return "ffmpeg"
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


FF = ffmpeg_exe()


def decode(path, start=0.0, dur=None):
    cmd = [FF, "-v", "error", "-ss", str(start)]
    if dur:
        cmd += ["-t", str(dur)]
    cmd += ["-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0


def loudest_start(x):
    sec = SR
    rms = np.array([np.sqrt(np.mean(x[i:i + sec] ** 2) + 1e-12) for i in range(0, len(x) - sec, sec)])
    n = int(CLIP)
    best, best_s = -1, 8
    for s in range(8, max(9, len(rms) - n - 3)):
        v = rms[s:s + n].mean()
        if v > best:
            best, best_s = v, s
    return float(best_s)


def onset_envelope(x, hop=256, n_fft=1024):
    win = np.hanning(n_fft).astype(np.float32)
    frames = 1 + (len(x) - n_fft) // hop
    idx = np.arange(n_fft)[None, :] + hop * np.arange(frames)[:, None]
    spec = np.abs(np.fft.rfft(x[idx] * win, axis=1))
    logs = np.log1p(100 * spec)
    flux = np.maximum(0, np.diff(logs, axis=0))
    env = flux[:, : n_fft // 4].sum(axis=1)          # нижняя половина спектра — ритм-секция
    env = np.concatenate([[0], env])
    env = env - np.convolve(env, np.ones(16) / 16, mode="same")
    env = np.maximum(env, 0)
    env /= env.max() + 1e-9
    # «яркость» каждого кадра — для раскладки шайб по дорожкам
    freqs = np.arange(spec.shape[1])
    centroid = (spec * freqs).sum(axis=1) / (spec.sum(axis=1) + 1e-9)
    return env, centroid, hop / SR


def tempo_period(env, fps):
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    w = np.exp(-0.5 * (np.log2(bpm / 115.0) / 0.9) ** 2)
    w[(bpm < 60) | (bpm > 190)] = 0
    lag = int(np.argmax(ac * w))
    return lag


def track_beats(env, period, tightness=100.0):
    n = len(env)
    score = env.copy()
    back = -np.ones(n, dtype=int)
    lo, hi = int(period * 0.5), int(period * 2)
    for t in range(hi, n):
        prev = np.arange(t - hi, t - lo)
        pen = -tightness * (np.log((t - prev) / period)) ** 2
        cand = score[prev] + pen
        j = int(np.argmax(cand))
        score[t] = env[t] + cand[j]
        back[t] = prev[j]
    t = int(np.argmax(score[-hi:])) + n - hi
    beats = []
    while t >= 0:
        beats.append(t)
        t = back[t]
    return beats[::-1]


def peaks(env, thr=0.35, gap=6):
    out = []
    for i in range(1, len(env) - 1):
        if env[i] > thr and env[i] >= env[i - 1] and env[i] >= env[i + 1]:
            if not out or i - out[-1] >= gap:
                out.append(i)
    return out


def main(src_dir):
    src_dir = pathlib.Path(src_dir)
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)
    beats_all = {}
    for sid, name in SONGS.items():
        path = src_dir / name
        if not path.exists():
            print(f"!! нет файла {path}")
            continue
        start = START[sid]
        if start is None:
            start = loudest_start(decode(path))
        out = OUT_AUDIO / f"{sid}.mp3"
        subprocess.run([FF, "-v", "error", "-y", "-ss", str(start), "-t", str(CLIP), "-i", str(path),
                        "-ac", "1", "-ar", "44100", "-b:a", "64k",
                        "-af", f"afade=t=in:st=0:d=1.2,afade=t=out:st={CLIP - 2.5}:d=2.5",
                        "-map_metadata", "-1", str(out)], check=True)
        # доли считаем по уже готовому фрагменту — так они точно совпадут со звуком в игре
        x = decode(out)
        env, cen, dt = onset_envelope(x)
        period = tempo_period(env, 1 / dt)
        b = track_beats(env, period)
        p = peaks(env)
        cmin, cmax = np.percentile(cen, 10), np.percentile(cen, 90)
        lane = lambda i: int(np.clip((cen[i] - cmin) / (cmax - cmin + 1e-9) * 3, 0, 2))
        beats_all[sid] = {
            "bpm": round(60 / (period * dt), 1),
            "beats": [[round(i * dt, 3), lane(i), round(float(env[i]), 2)] for i in b if 1.0 < i * dt < CLIP - 2.5],
            "onsets": [[round(i * dt, 3), lane(i)] for i in p if 1.0 < i * dt < CLIP - 2.5],
        }
        print(f"{sid:9s} старт {start:6.1f} c  темп ≈{beats_all[sid]['bpm']:5.1f}  долей {len(beats_all[sid]['beats']):3d}"
              f"  {out.stat().st_size // 1024} КБ")
    OUT_BEATS.write_text("// Сгенерировано tools/make_audio.py — моменты долей во фрагментах песен (секунды, дорожка, сила)\n"
                         "window.BEATS = " + json.dumps(beats_all, ensure_ascii=False, separators=(",", ":")) + ";\n",
                         encoding="utf-8")
    print("Готово:", OUT_BEATS)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
