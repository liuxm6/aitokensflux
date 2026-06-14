#!/usr/bin/env python3
"""
aitokensflux — wordmark builder (reusable).
Converts text to exact vector paths so it renders identically everywhere.
Supports per-run coloring and a synthetic 'medium' weight via a matched stroke.
"""
import numpy as np
from matplotlib.textpath import TextPath
from matplotlib.font_manager import FontProperties

MOVETO, LINETO, CURVE3, CURVE4, CLOSEPOLY = 1, 2, 3, 4, 79


def _glyph_segments(ch, fp, size, xoff):
    tp = TextPath((0, 0), ch, size=size, prop=fp)
    v, c = tp.vertices, tp.codes
    if c is None or len(v) == 0:
        return None, size * 0.30
    seg, xs, ys = [], [], []
    i = 0
    while i < len(c):
        code = c[i]
        if code == MOVETO:
            x, y = v[i]; seg.append(f"M{x+xoff:.2f} {-y:.2f}"); xs.append(x+xoff); ys.append(-y); i += 1
        elif code == LINETO:
            x, y = v[i]; seg.append(f"L{x+xoff:.2f} {-y:.2f}"); xs.append(x+xoff); ys.append(-y); i += 1
        elif code == CURVE3:
            x1, y1 = v[i]; x2, y2 = v[i+1]
            seg.append(f"Q{x1+xoff:.2f} {-y1:.2f} {x2+xoff:.2f} {-y2:.2f}"); xs += [x1+xoff, x2+xoff]; ys += [-y1, -y2]; i += 2
        elif code == CURVE4:
            x1, y1 = v[i]; x2, y2 = v[i+1]; x3, y3 = v[i+2]
            seg.append(f"C{x1+xoff:.2f} {-y1:.2f} {x2+xoff:.2f} {-y2:.2f} {x3+xoff:.2f} {-y3:.2f}"); xs += [x1+xoff, x2+xoff, x3+xoff]; ys += [-y1, -y2, -y3]; i += 3
        elif code == CLOSEPOLY:
            seg.append("Z"); i += 1
        else:
            i += 1
    gx = v[:, 0].max()
    return ("".join(seg), xs, ys), gx


def build_wordmark(text, family="DejaVu Sans", weight=400, size=200,
                   tracking=0.02, runs=None, default_color="#11142A"):
    """runs: list of (start_index, end_index_exclusive, color) for coloring.
    Returns dict with per-color path 'd', bbox, and metrics."""
    fp = FontProperties(family=family, weight=weight)

    def color_for(idx):
        if runs:
            for a, b, col in runs:
                if a <= idx < b:
                    return col
        return default_color

    by_color = {}
    xoff = 0.0
    all_x, all_y = [], []
    for idx, ch in enumerate(text):
        if ch == " ":
            xoff += size * 0.32
            continue
        res, gx = _glyph_segments(ch, fp, size, xoff)
        if res is not None:
            d, xs, ys = res
            col = color_for(idx)
            by_color.setdefault(col, []).append(d)
            all_x += xs; all_y += ys
        xoff += gx + size * (0.045 + tracking)

    minx, maxx = (min(all_x), max(all_x)) if all_x else (0, 0)
    miny, maxy = (min(all_y), max(all_y)) if all_y else (0, 0)
    # cap/x metrics
    capH = TextPath((0, 0), "H", size=size, prop=fp).vertices[:, 1].max()
    xH = TextPath((0, 0), "x", size=size, prop=fp).vertices[:, 1].max()
    return {
        "by_color": by_color, "minx": minx, "maxx": maxx,
        "miny": miny, "maxy": maxy, "width": maxx - minx, "height": maxy - miny,
        "capH": capH, "xH": xH,
    }


if __name__ == "__main__":
    wm = build_wordmark("aitokensflux", tracking=0.02,
                        runs=[(8, 12, "#FF4D8D")])  # 'flux' accented
    print("width", round(wm["width"]), "height", round(wm["height"]),
          "capH", round(wm["capH"]), "xH", round(wm["xH"]))
