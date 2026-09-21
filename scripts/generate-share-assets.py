#!/usr/bin/env python3
"""Generate public/og.png, apple-touch-icon.png and favicon.ico."""
from __future__ import annotations

import math
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC = os.path.join(ROOT, "public")

BG = (7, 10, 17, 255)
PANEL = (11, 16, 28, 255)
CYAN = (0, 242, 254, 255)
PURPLE = (139, 92, 246, 255)
AMBER = (251, 191, 36, 255)
WHITE = (243, 244, 246, 255)
MUTED = (156, 163, 175, 255)
DIM = (42, 53, 72, 255)
STROKE = (255, 255, 255, 40)

PARTY = [CYAN, PURPLE, AMBER, (56, 189, 248, 255), (167, 139, 250, 255), (245, 158, 11, 255)]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def load_fonts():
    arial_b = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    arial = "/System/Library/Fonts/Supplemental/Arial.ttf"
    courier = "/System/Library/Fonts/Supplemental/Courier New.ttf"
    title = font(arial_b, 52)
    kicker = font(courier if os.path.exists(courier) else arial, 18)
    body = font(arial, 26)
    small = font(arial, 22)
    brand = font(arial_b, 26)
    return title, kicker, body, small, brand


def draw_mark(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float = 1.0) -> None:
    r = 22 * scale
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=WHITE, width=max(2, int(3 * scale)))
    dots = [(-7.2 * scale, 4.0 * scale, CYAN), (0, -4.2 * scale, PURPLE), (7.2 * scale, 4.0 * scale, AMBER)]
    dr = 3.4 * scale
    for dx, dy, color in dots:
        draw.ellipse((cx + dx - dr, cy + dy - dr, cx + dx + dr, cy + dy + dr), fill=color)


def hemicycle(draw: ImageDraw.ImageDraw, origin_x: int, origin_y: int) -> None:
    n = 0
    for row in range(8):
        count = 12 + row * 4
        radius = 70 + row * 28
        for i in range(count):
            t = i / max(count - 1, 1)
            angle = math.pi + t * math.pi
            x = origin_x + math.cos(angle) * radius
            y = origin_y + math.sin(angle) * radius * 0.62
            lit = (n + row * 3) % 4 == 0
            r = 3.2 + row * 0.22
            color = PARTY[n % len(PARTY)] if lit else DIM
            draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
            n += 1


def make_og() -> None:
    title_f, kicker_f, body_f, small_f, brand_f = load_fonts()
    img = Image.new("RGBA", (1200, 630), BG)
    draw = ImageDraw.Draw(img)

    # faint grid
    for x in range(0, 1200, 40):
        draw.line((x, 0, x, 630), fill=(255, 255, 255, 8), width=1)
    for y in range(0, 630, 40):
        draw.line((0, y, 1200, y), fill=(255, 255, 255, 8), width=1)

    hemicycle(draw, 250, 520)

    draw_mark(draw, 560, 92, 1.05)
    draw.text((600, 76), "NEURALFORMING", font=brand_f, fill=WHITE)

    draw.text((540, 150), "ATTIVISMO CIVICO  ·  GOVERNANCE DELL'IA", font=kicker_f, fill=CYAN)

    draw.text((540, 210), "Il futuro dell'IA", font=title_f, fill=WHITE)
    draw.text((540, 274), "si decide. Non si subisce.", font=title_f, fill=CYAN)

    draw.text(
        (540, 370),
        "Un parlamento in miniatura per governare l'IA.",
        font=body_f,
        fill=MUTED,
    )

    draw.rounded_rectangle((540, 470, 1120, 545), radius=16, outline=(0, 242, 254, 70), width=2)
    draw.text((560, 492), "2–5 giocatori   ·   AGPL-3.0   ·   Relatronica", font=small_f, fill=AMBER)

    out = os.path.join(PUBLIC, "og.png")
    img.convert("RGB").save(out, "PNG", optimize=True)
    print("wrote", out)


def make_icons() -> None:
    size = 180
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    r = 74
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=BG, outline=WHITE, width=8)
    dots = [(-32, 18, CYAN), (0, -22, PURPLE), (32, 18, AMBER)]
    dr = 14
    for dx, dy, color in dots:
        draw.ellipse((cx + dx - dr, cy + dy - dr, cx + dx + dr, cy + dy + dr), fill=color)

    apple = os.path.join(PUBLIC, "apple-touch-icon.png")
    img.save(apple, "PNG", optimize=True)
    print("wrote", apple)

    ico = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    ico_draw = ImageDraw.Draw(ico)
    draw_mark(ico_draw, 16, 16, 0.62)
    fav = os.path.join(PUBLIC, "favicon.ico")
    ico.save(fav, sizes=[(32, 32), (16, 16)])
    print("wrote", fav)


if __name__ == "__main__":
    os.makedirs(PUBLIC, exist_ok=True)
    make_og()
    make_icons()
