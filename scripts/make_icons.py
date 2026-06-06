"""Generate simple icons for the Form Agree extension.

Run once after cloning the repo:
    python scripts/make_icons.py

Requires Pillow (`pip install pillow`).
"""

from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "icons"
OUT.mkdir(exist_ok=True)

BG = (26, 115, 232)        # Google blue
FG = (255, 255, 255)


def make_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Rounded square background.
    radius = max(2, size // 5)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=BG)

    # White checkmark.
    pad = size * 0.22
    p1 = (pad,                size * 0.55)
    p2 = (size * 0.42,        size - pad)
    p3 = (size - pad,         pad)
    width = max(2, size // 8)
    d.line([p1, p2], fill=FG, width=width)
    d.line([p2, p3], fill=FG, width=width)
    return img


for s in (16, 48, 128):
    path = OUT / f"icon{s}.png"
    make_icon(s).save(path, "PNG")
    print(f"wrote {path}")
