#!/usr/bin/env python3
"""Fetch remaining catalog icons as real local PNGs. Refuse partial catalog rewrites."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse
import hashlib
import re
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "_data/catalog.yaml"
ICONS = ROOT / "assets/tool-icons"
SOURCES = {
    "Wind 金融终端": ("wind", ["https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a4/65/e6/a465e6fd-6f9a-91df-150d-442e1f20a2c9/AppIcon-85-220-5-0-0-2x-0-0.png/1200x630bb.png"]),
    "Choice 数据": ("choice", ["https://acem.sjtu.edu.cn/ec/static/data/20222/spe_202221816423942%E4%B8%9C%E6%96%B9%E8%B4%A2%E5%AF%8C.jpg"]),
    "迅捷视频转换器": ("xunjie-video", []),
    "Tushare": ("tushare", ["https://tushare.pro/favicon.ico"]),
    "Baostock": ("baostock", ["https://www.baostock.com/favicon.ico"]),
    "聚宽（JoinQuant）": ("joinquant", ["https://www.joinquant.com/favicon.ico"]),
    "米筐（Ricequant）": ("ricequant", ["https://www.ricequant.com/favicon.ico"]),
    "BigQuant": ("bigquant", ["https://bigquant.com/favicon.ico"]),
    "金十数据": ("jin10", ["https://static.oomol.com/logo/third-party/jin10.png"]),
    "Cambridge Dictionary": ("cambridge-dictionary", ["https://dictionary.cambridge.org/favicon.ico"]),
    "3DM 游戏网": ("3dmgame", ["https://www.3dmgame.com/favicon.ico"]),
}
def download(url):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "image/*"})
    with urlopen(req, timeout=18) as response:
        if urlparse(response.url).scheme != "https":
            raise ValueError("non-HTTPS redirect")
        content = response.read(2_000_001)
    if len(content) > 2_000_000:
        raise ValueError("image too large")
    return content
def decode(content):
    with Image.open(BytesIO(content)) as source:
        if source.width < 16 or source.height < 16 or source.width * source.height > 16_000_000:
            raise ValueError("invalid image dimensions")
        image = source.convert("RGBA")
        if len(image.getcolors(maxcolors=1) or []) == 1 or not image.getbbox():
            raise ValueError("empty image")
        image.thumbnail((128, 128), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (128,128))
        canvas.alpha_composite(image, ((128-image.width)//2,(128-image.height)//2))
        out = BytesIO()
        canvas.save(out, format="PNG")
        return out.getvalue()
def digest(data):
    return hashlib.sha256(data).hexdigest()
def run():
    data = DATA.read_text(encoding="utf-8")
    entries = list(re.finditer(r"(?m)^- name: (.+)\n(?:(?!- name:)[^\n]*\n)*?  icon_url: (.+)$", data))
    if not entries:
        print("No remote icon references")
        return
    generic = set()
    for size in (16,32,64,128):
        try:
            generic.add(digest(decode(download(f"https://www.google.com/s2/favicons?domain=nonexistent.invalid&sz={size}"))))
        except Exception:
            pass
    def fetch(match):
        name, current = match.group(1,2)
        if name not in SOURCES:
            return (name, None, None, None, "unlisted remote icon")
        slug, fallbacks = SOURCES[name]
        errors = []
        # Preserve existing icon first. Known alternative sources are used only on failure.
        for url in [current, *fallbacks]:
            try:
                png = decode(download(url))
                if digest(png) in generic:
                    raise ValueError("generic fallback icon")
                if "google.com/s2/favicons" in url and not generic:
                    raise ValueError("could not verify generic fallback")
                return (name, f"local-{slug}.png", png, url, None)
            except Exception as exc:
                errors.append(f"{url}: {exc}")
        return (name, None, None, None, " | ".join(errors))
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(fetch, entries))
    failures = [r for r in results if r[-1]]
    for name, filename, png, url, error in results:
        print(f"{name}: {error or url}")
    if failures:
        raise SystemExit(f"{len(failures)} icon(s) unavailable; catalog left unchanged")
    if len({digest(r[2]) for r in results}) != len(results):
        raise SystemExit("Duplicate image content; catalog left unchanged")
    for match, (name, filename, png, url, error) in reversed(list(zip(entries, results))):
        (ICONS / filename).write_bytes(png)
        start, end = match.span(2)
        # Replace the exact icon_url line without changing the rest of the YAML.
        line_start = data.rfind("\n", 0, start) + 1
        data = data[:line_start] + "  icon: " + filename + data[end:]
    DATA.write_text(data, encoding="utf-8")
    print("All remote catalog icons converted to local files.")
if __name__ == "__main__":
    run()
