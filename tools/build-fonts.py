#!/usr/bin/env python3
"""Fetch and trim the three faces this site sets.

Budadiri East runs on three voices and nothing else:

    Vollkorn      the mountain voice — headlines, statements, ledes
    Chivo         the working voice — running text, labels, interface
    IBM Plex Mono the instrument voice — altitudes, refs, dates, status

On a metered connection in Sironko the webfont is the largest single
cost of a first visit, so each face is downloaded from Google Fonts,
instanced to the weight range the site actually varies, subset to the
characters the pages actually contain, and committed.

    Vollkorn   variable, wght 400:800
    Chivo      variable, wght 300:700
    Plex Mono  static 400 and 500, uppercase-and-figures charset only

The mono is never set in running text — it labels and it counts — so it
carries a much smaller character set than the other two.

Run: python3 tools/build-fonts.py
"""
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/media/fonts"
OUT = ROOT / "public/fonts"
CHARS = ROOT / "tools/font-charset.txt"
CHARS_MONO = ROOT / "tools/font-charset-mono.txt"

CSS_API = "https://fonts.googleapis.com/css2?family={}&display=swap"
# Google serves woff2 variable fonts only to a browser it recognises.
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

FACES = [
    # name,           google query,                     instancer axes, charset
    ("vollkorn",      "Vollkorn:wght@400..900",         ["wght=400:800"], CHARS),
    ("chivo",         "Chivo:wght@100..900",            ["wght=300:700"], CHARS),
    ("plex-mono-400", "IBM+Plex+Mono:wght@400",         [],               CHARS_MONO),
    ("plex-mono-500", "IBM+Plex+Mono:wght@500",         [],               CHARS_MONO),
]

FEATURES = "kern,liga,calt,tnum,lnum,ccmp,locl,mark,mkmk"

# The block Google labels `latin`: ASCII, Latin-1 and general punctuation.
# It is the only one of the nine subsets this site needs.
LATIN = "U+0000-00FF"


def fetch(url, referer=None):
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def source(name, query):
    """Download the latin cut of a face, unless it is already here."""
    dest = SRC / f"{name}.woff2"
    if dest.exists():
        return dest

    css = fetch(CSS_API.format(query)).decode("utf8")
    blocks = css.split("@font-face")
    for block in blocks:
        if LATIN not in block:
            continue
        url = re.search(r"src:\s*url\((https://[^)]+)\)", block)
        if url:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(fetch(url.group(1)))
            return dest
    raise SystemExit(f"no latin cut found for {query}")


def run(args):
    subprocess.run(args, check=True, capture_output=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for name, query, axes, charset in FACES:
        src = source(name, query)
        dest = OUT / f"{name}.woff2"
        subset_input = src

        if axes:
            subset_input = Path("/tmp") / f"{name}-instanced.ttf"
            run([sys.executable, "-m", "fontTools.varLib.instancer",
                 str(src), *axes, "-o", str(subset_input)])

        run([
            sys.executable, "-m", "fontTools.subset", str(subset_input),
            f"--output-file={dest}",
            f"--text-file={charset}",
            "--flavor=woff2",
            f"--layout-features={FEATURES}",
            "--no-hinting",
            "--desubroutinize",
            "--name-IDs=1,2,3,4,6",
        ])
        size = dest.stat().st_size
        total += size
        print(f"{name}: {src.stat().st_size // 1024} KB -> {size / 1024:.1f} KB")

    print(f"total webfont payload: {total / 1024:.1f} KB")


if __name__ == "__main__":
    main()
