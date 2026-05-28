#!/usr/bin/env python3
"""Remove outer background from Happy PNGs while keeping black fur (uses rembg)."""
from __future__ import annotations

import io
import sys
from pathlib import Path

from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets" / "happy"
SOURCE_DIR = ASSETS / "source"
SOURCES = {
    "happy-coach-idle.png": SOURCE_DIR / "happy-coach-idle-flat.png",
    "happy-coach-celebrate.png": SOURCE_DIR / "happy-coach-celebrate-flat.png",
}

MAX_DIM = 512


def process(src: Path, dst: Path) -> None:
    out = remove(src.read_bytes())
    im = Image.open(io.BytesIO(out)).convert("RGBA")
    w, h = im.size
    if max(w, h) > MAX_DIM:
        r = MAX_DIM / max(w, h)
        im = im.resize((int(w * r), int(h * r)), Image.Resampling.LANCZOS)
    im.save(dst, optimize=True)
    print(f"Wrote {dst} ({im.size[0]}x{im.size[1]})")


def main() -> int:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for name, src in SOURCES.items():
        if not src.is_file():
            print(f"Missing source: {src}", file=sys.stderr)
            return 1
        process(src, ASSETS / name)
    print("Done. Bump happyCoachAssets.ts cache version after deploy.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
