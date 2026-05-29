#!/usr/bin/env python3
"""Export My Voice Fit promo art into common social / store sizes."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/assets/marketing/myvoice-fit-promo-social-v3.png"
OUT = ROOT / "public/assets/marketing/formats"
BG = (10, 10, 10)


def canvas(w: int, h: int) -> Image.Image:
    return Image.new("RGB", (w, h), BG)


def paste_centered(base: Image.Image, img: Image.Image) -> None:
    x = (base.width - img.width) // 2
    y = (base.height - img.height) // 2
    base.paste(img, (x, y))


def fit_width(img: Image.Image, width: int) -> Image.Image:
    ratio = width / img.width
    height = max(1, round(img.height * ratio))
    return img.resize((width, height), Image.Resampling.LANCZOS)


def fit_height(img: Image.Image, height: int) -> Image.Image:
    ratio = height / img.height
    width = max(1, round(img.width * ratio))
    return img.resize((width, height), Image.Resampling.LANCZOS)


def fit_cover(img: Image.Image, w: int, h: int) -> Image.Image:
    scale = max(w / img.width, h / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - w) // 2
    top = (resized.height - h) // 2
    return resized.crop((left, top, left + w, top + h))


def export_square(src: Image.Image, size: int, name: str) -> None:
    scaled = fit_width(src, size)
    base = canvas(size, size)
    paste_centered(base, scaled)
    base.save(OUT / name, optimize=True)


def export_fit(src: Image.Image, w: int, h: int, name: str, *, cover: bool = False) -> None:
    out = fit_cover(src, w, h) if cover else canvas(w, h)
    if not cover:
        scaled = fit_width(src, w)
        if scaled.height > h:
            scaled = fit_height(src, h)
            paste_centered(out, scaled)
        else:
            paste_centered(out, scaled)
    out.save(OUT / name, optimize=True)


def export_vertical_story(src: Image.Image, w: int, h: int, name: str) -> None:
    base = canvas(w, h)
    scaled = fit_width(src, w)
    top = int(h * 0.06)
    base.paste(scaled, (0, top))
    base.save(OUT / name, optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGB")

    src.save(OUT / "01-master-landscape-1536x1024.png", optimize=True)

    export_square(src, 1080, "02-instagram-post-square-1080x1080.png")
    export_vertical_story(src, 1080, 1920, "03-instagram-story-1080x1920.png")
    export_vertical_story(src, 1080, 1920, "04-whatsapp-status-1080x1920.png")
    export_vertical_story(src, 1080, 1920, "05-tiktok-cover-1080x1920.png")

    export_fit(src, 1200, 630, "06-facebook-link-preview-1200x630.png")
    export_fit(src, 1200, 627, "07-linkedin-post-1200x627.png")
    export_fit(src, 820, 312, "08-facebook-page-cover-820x312.png", cover=True)
    export_fit(src, 1280, 720, "09-youtube-thumbnail-1280x720.png")
    export_fit(src, 1600, 900, "10-twitter-x-post-1600x900.png")
    export_fit(src, 1024, 500, "11-play-store-feature-1024x500.png", cover=True)
    export_fit(src, 1200, 630, "12-web-open-graph-1200x630.png")

    for path in sorted(OUT.glob("*.png")):
        img = Image.open(path)
        jpg_path = path.with_suffix(".jpg")
        img.convert("RGB").save(jpg_path, quality=92, optimize=True)

    print(f"Exported {len(list(OUT.glob('*')))} files to {OUT}")


if __name__ == "__main__":
    main()
