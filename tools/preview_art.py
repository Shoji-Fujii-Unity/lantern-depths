#!/usr/bin/env python3
"""Render the pixel grids in js/art.js to a PNG contact sheet for visual review.
Pure stdlib (zlib/struct) - no PIL needed. Dev tool only."""
import json, re, sys, zlib, struct, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "js", "art.js"), encoding="utf-8").read()
m = re.search(r"const ART = (\{.*\n\});", src, re.S)
if not m:
    sys.exit("ART block not found")
ART = json.loads(m.group(1))
PAL = {k: (int(v[1:3], 16), int(v[3:5], 16), int(v[5:7], 16)) for k, v in ART["pal"].items()}

def hexcol(h):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))

def cell_rows(grid, w, h):
    """-> list of h rows, each a list of w rgb-or-None. Warn on odd chars."""
    out, bad = [], []
    for y in range(h):
        row = grid[y] if y < len(grid) else ""
        if len(row) != w:
            print(f"  !! width {len(row)} != {w}: {row!r}", file=sys.stderr)
        line = []
        for x in range(w):
            ch = row[x] if x < len(row) else "."
            if ch in ". ":
                line.append(None)
            elif ch in PAL:
                line.append(PAL[ch])
            else:
                bad.append(ch)
                line.append((255, 0, 255))
        out.append(line)
    if bad:
        print("  !! unknown chars: " + " ".join(sorted(set(bad))), file=sys.stderr)
    return out

def parse_digits(digits):
    out = {}
    for k, v in digits.items():
        rows = v.split("/")
        out[k] = [[None if c == "0" else (255, 255, 255) for c in r] for r in rows]
    return out

SC = 8            # sprite scale
IC = 8            # icon scale
DG = 6            # digit scale
GAP = 10
PERROW = 7

sprites = ART["sprites"]
icons = ART["icons"]
digits = parse_digits(ART["digits"])

names = list(sprites.keys())
sh_rows = (len(names) + PERROW - 1) // PERROW
sheet_h = sh_rows * (16 * SC + GAP) + GAP
sheet_w = PERROW * (16 * SC + GAP) + GAP + 300        # right column for icons + digits

bg1, bg2 = (24, 28, 40), (16, 20, 30)
px = [[bg1 if ((x // 8) + (y // 8)) % 2 == 0 else bg2 for x in range(sheet_w)] for y in range(sheet_h)]

def blit(x0, y0, rows, scale):
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c is None:
                continue
            for dy in range(scale):
                yy = y0 + j * scale + dy
                if 0 <= yy < sheet_h:
                    for dx in range(scale):
                        xx = x0 + i * scale + dx
                        if 0 <= xx < sheet_w:
                            px[yy][xx] = c

for idx, name in enumerate(names):
    r, c = divmod(idx, PERROW)
    art = cell_rows(sprites[name], 16, 16)
    blit(GAP + c * (16 * SC + GAP), GAP + r * (16 * SC + GAP), art, SC)

ix = PERROW * (16 * SC + GAP) + GAP
for idx, name in enumerate(icons.keys()):
    art = cell_rows(icons[name], 8, 8)
    blit(ix + (idx % 3) * (8 * IC + GAP), GAP + (idx // 3) * (8 * IC + GAP), art, IC)

dy0 = GAP + ((len(icons) + 2) // 3) * (8 * IC + GAP) + GAP
for idx, ch in enumerate(sorted(digits.keys())):
    r, c = divmod(idx, 4)
    blit(ix + c * 40, dy0 + r * 40, digits[ch], DG)

raw = b"".join(b"\x00" + bytes(v for p in row for v in p) for row in px)

def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

png = (b"\x89PNG\r\n\x1a\n"
       + chunk(b"IHDR", struct.pack(">IIBBBBB", sheet_w, sheet_h, 8, 2, 0, 0, 0))
       + chunk(b"IDAT", zlib.compress(raw, 9))
       + chunk(b"IEND", b""))
out = os.path.join(ROOT, "assets", "art-preview.png")
open(out, "wb").write(png)
print(f"wrote {out}  {sheet_w}x{sheet_h}  sprites={len(names)} icons={len(icons)} digits={len(digits)}")
