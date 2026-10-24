"""
Собирает игры из папки src/ в ОДИН самодостаточный файл index.html
(стили, скрипты и фрагменты песен встраиваются внутрь — работает без интернета,
можно отправить файлом или открыть с флешки).

Запуск:  python build.py
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "index.html"


def data_uri(rel):
    p = SRC / rel
    return "data:audio/mpeg;base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def inline_audio(js):
    # "audio/hockey.mp3" в коде → встроенный звук
    return re.sub(r'(["\'])(audio/[\w-]+\.mp3)\1', lambda m: '"' + data_uri(m.group(2)) + '"', js)


html = (SRC / "index.html").read_text(encoding="utf-8")
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
              lambda m: "<style>\n" + (SRC / m.group(1)).read_text(encoding="utf-8") + "</style>", html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: "<script>\n" + inline_audio((SRC / m.group(1)).read_text(encoding="utf-8")) + "</script>", html)
html = html.replace("<!-- Собрать один офлайн-файл: python build.py  →  ../index.html -->",
                    "<!-- Этот файл собран автоматически (python build.py) — исходники в папке src. -->")

OUT.write_text(html, encoding="utf-8")
print(f"Готово: {OUT}  ({OUT.stat().st_size / 1024 / 1024:.1f} МБ)")
