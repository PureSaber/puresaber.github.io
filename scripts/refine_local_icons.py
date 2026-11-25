from pathlib import Path
from io import BytesIO
from urllib.request import Request, urlopen
from PIL import Image, ImageChops, ImageOps
import json
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
ICONS=ROOT/"assets/tool-icons"
SOURCES={
"wind":["https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a4/65/e6/a465e6fd-6f9a-91df-150d-442e1f20a2c9/AppIcon-85-220-5-0-0-2x-0-0.png/1200x630bb.png"],
"choice":["https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/39/03/0f/39030f4a-5656-ddae-c624-fb7740af5849/AppIcon-0-1x_U007ephone-0-1-0-0-sRGB-85-220-0.png/1200x630wa.jpg","https://acem.sjtu.edu.cn/ec/static/data/20222/spe_202221816423942%E4%B8%9C%E6%96%B9%E8%B4%A2%E5%AF%8C.jpg"],
"jin10":["https://static.oomol.com/logo/third-party/jin10.png"],
"ricequant":["https://avatars.githubusercontent.com/u/13045878?v=4"],
"bigquant":["https://bigquant.com/favicon.ico"],
"xunjie-video":["https://i-cdn.apsgo.com/cdn/HT6kMMXwp9ymcZcx0d3g3aWxrjss4YW6fFMFIaUU.png"],
}
names=["wind","choice","xunjie-video","baostock","joinquant","ricequant","bigquant","jin10","cambridge-dictionary","3dmgame","tushare","acfun"]
def crop(image):
    image=image.convert("RGBA")
    bbox=image.getbbox()
    if bbox and bbox != (0,0,*image.size):
        image=image.crop(bbox)
    elif image.getextrema()[3] == (255,255):
        rgb=image.convert("RGB")
        bg=rgb.getpixel((0,0))
        # Only remove near-white margins from storefront artwork.
        if min(bg)>225:
            diff=ImageChops.difference(rgb,Image.new("RGB",rgb.size,bg)).convert("L").point(lambda x:255 if x>28 else 0)
            b=diff.getbbox()
            if b: image=image.crop(b)
    if not image.getbbox(): raise ValueError("empty image")
    scale=116/max(image.size)
    image=image.resize((max(1,round(image.width*scale)),max(1,round(image.height*scale))),Image.Resampling.LANCZOS)
    canvas=Image.new("RGBA",(128,128))
    canvas.alpha_composite(image,((128-image.width)//2,(128-image.height)//2))
    return canvas
def one(name):
    path=ICONS/f"local-{name}.png"
    old=Image.open(path).convert("RGBA")
    selected="existing retrieved brand asset"
    for url in SOURCES.get(name,[]):
        try:
            with urlopen(Request(url,headers={"User-Agent":"Mozilla/5.0","Accept":"image/*"}),timeout=10) as r:
                raw=r.read(2000001)
            if len(raw)>2000000: raise ValueError("too large")
            with Image.open(BytesIO(raw)) as source:
                if min(source.size)<16: raise ValueError("too small")
                old=source.convert("RGBA")
            selected=url
            break
        except Exception as exc:
            print(f"{name} {url}: {exc}")
    if name=="choice" and selected=="existing retrieved brand asset":
        raise ValueError("Choice incorrect prior favicon must not be kept")
    result=crop(old)
    result.save(path)
    return name,selected
with ThreadPoolExecutor(max_workers=8) as pool:
    rows=list(pool.map(one,names))
for name,source in rows: print(f"{name}: {source}")
(ROOT/"scripts/icon-refinement-sources.json").write_text(json.dumps(dict(rows),indent=2),encoding="utf-8")
