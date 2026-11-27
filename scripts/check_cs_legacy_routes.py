#!/usr/bin/env python3
"""Check the existing CS entry and legacy fragment contract without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
LEGACY = set("math programming algorithms systems networks data software infra ai security graphics foundation engineering specializations sequence resources".split())

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.links = [], []
        self.feed(path.read_text(encoding="utf-8"))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "a" and "href" in a:
            self.links.append(a["href"])

def check(root):
    errors = []
    entry = root / "learn/index.html"
    cs = root / "learn/computer-science/index.html"
    pages = {p: Page(p) for p in (entry, cs)}
    if "./computer-science/" not in pages[entry].links:
        errors.append("Learning entry lost CS link")
    missing = LEGACY - set(pages[cs].ids)
    if missing:
        errors.append("Missing legacy anchors: " + ", ".join(sorted(missing)))
    for path, page in pages.items():
        if len(page.ids) != len(set(page.ids)):
            errors.append(f"{path}: duplicate IDs")
        for href in page.links:
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            target = (root / unquote(url.path).lstrip("/") if url.path.startswith("/") else path.parent / unquote(url.path)) if url.path else path
            target = target.resolve()
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                errors.append(f"{path}: missing local target {href}")
            elif url.fragment and target.suffix == ".html":
                # Jekyll/Liquid pages may generate IDs at build time.
                source = target.read_text(encoding="utf-8")
                if "{{" not in source and "{%" not in source:
                    if unquote(url.fragment) not in Page(target).ids:
                        errors.append(f"{path}: missing fragment {href}")
    return errors

if __name__ == "__main__":
    errors = check(ROOT)
    for error in errors:
        print(error, file=sys.stderr)
    print("CS route contract:", "FAIL" if errors else "PASS")
    sys.exit(bool(errors))
