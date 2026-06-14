#!/usr/bin/env python3
"""
aitokensflux logo — icon generator  (concept: "Flux Rotor / Aperture")
Minimal-geometric multicolor swirl of flux blades around an open token core.

All petal geometry is computed in ABSOLUTE coordinates (rotation baked in),
emitting plain path data with no transform attributes -> maximum renderer
compatibility (avoids librsvg's nested-transform quirks).
"""
import math

# ---- Palette (vibrant): (deep/tail, bright/bulb) per blade ----
PALETTE = [
    ("#E81E6A", "#FF4D8D"),  # 0 magenta / pink
    ("#FF6A1A", "#FF9E3D"),  # 1 orange
    ("#F0A800", "#FFCE2E"),  # 2 amber / gold
    ("#12B268", "#34E08A"),  # 3 green
    ("#1391E6", "#33BFFF"),  # 4 blue / cyan
    ("#6B3DF2", "#9B6BFF"),  # 5 violet
]
BRIGHT = [b for _, b in PALETTE]
DEEP   = [d for d, _ in PALETTE]


def rot(px, py, ang_deg):
    a = math.radians(ang_deg)
    ca, sa = math.cos(a), math.sin(a)
    return (px * ca - py * sa, px * sa + py * ca)


def petal_points(r_in, r_out, w_tail, w_bulb, lean):
    """Return the control points of one petal pointing 'up' (-y) around (0,0).
    The petal is a tapered, swirled teardrop. Points returned in draw order:
      tail, c1, c2, bulbR, (arc to) bulbL, c3, c4, back to tail
    Swirl is created by leaning the bulb tangentially (+x) more than the tail.
    """
    tail   = (0.0, -r_in)
    # right edge: tail -> bulb right shoulder
    c1 = ( w_tail + lean * 0.25, -r_in - (r_out - r_in) * 0.18)
    c2 = ( w_bulb + lean,        -r_out + w_bulb * 1.15)
    bulbR = ( w_bulb * 0.62 + lean, -r_out + w_bulb * 0.45)
    bulbL = (-w_bulb * 0.62 + lean, -r_out + w_bulb * 0.45)
    # left edge: bulb left shoulder -> tail
    c3 = (-w_bulb + lean,        -r_out + w_bulb * 1.15)
    c4 = (-w_tail + lean * 0.25, -r_in - (r_out - r_in) * 0.18)
    return tail, c1, c2, bulbR, bulbL, c3, c4, w_bulb


def petal_path_abs(cx, cy, ang, r_in, r_out, w_tail, w_bulb, lean):
    tail, c1, c2, bulbR, bulbL, c3, c4, wb = petal_points(
        r_in, r_out, w_tail, w_bulb, lean)

    def T(p):
        x, y = rot(p[0], p[1], ang)
        return (x + cx, y + cy)

    tail = T(tail); c1 = T(c1); c2 = T(c2); bulbR = T(bulbR)
    bulbL = T(bulbL); c3 = T(c3); c4 = T(c4)
    f = lambda p: f"{p[0]:.2f} {p[1]:.2f}"
    d = (f"M {f(tail)} "
         f"C {f(c1)} {f(c2)} {f(bulbR)} "
         f"A {wb:.2f} {wb:.2f} 0 0 1 {f(bulbL)} "
         f"C {f(c3)} {f(c4)} {f(tail)} Z")
    return d


def build_icon(size=512, n=6, core="dot", bg=None, rounded=False,
               flat=False, swirl=0.55, scale=1.0, mono=None):
    cx = cy = size / 2
    r_in  = size * 0.105 * scale
    r_out = size * 0.405 * scale
    w_tail = size * 0.010 * scale
    w_bulb = size * 0.094 * scale
    lean   = size * swirl * 0.16 * scale
    step = 360.0 / n

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" '
             f'height="{size}" viewBox="0 0 {size} {size}" fill="none">']

    defs = ['<defs>']
    if not flat:
        for i in range(n):
            # gradient along the petal's actual radial axis (userSpaceOnUse)
            ang = i * step
            x1, y1 = rot(0, -r_in, ang); x2, y2 = rot(lean, -r_out, ang)
            defs.append(
                f'<linearGradient id="bl{i}" gradientUnits="userSpaceOnUse" '
                f'x1="{x1+cx:.1f}" y1="{y1+cy:.1f}" x2="{x2+cx:.1f}" y2="{y2+cy:.1f}">'
                f'<stop offset="0" stop-color="{DEEP[i]}"/>'
                f'<stop offset="1" stop-color="{BRIGHT[i]}"/></linearGradient>')
    defs.append(
        '<radialGradient id="coreg" cx="0.5" cy="0.42" r="0.62">'
        '<stop offset="0" stop-color="#FFFFFF"/>'
        '<stop offset="1" stop-color="#E9EDF7"/></radialGradient>')
    defs.append('</defs>')
    parts.append("".join(defs))

    if bg:
        if rounded:
            r = size * 0.225
            parts.append(f'<rect width="{size}" height="{size}" rx="{r:.1f}" fill="{bg}"/>')
        else:
            parts.append(f'<rect width="{size}" height="{size}" fill="{bg}"/>')

    for i in range(n):
        d = petal_path_abs(cx, cy, i * step, r_in, r_out, w_tail, w_bulb, lean)
        if mono:
            fill = mono
        else:
            fill = BRIGHT[i] if flat else f'url(#bl{i})'
        parts.append(f'<path d="{d}" fill="{fill}"/>')

    if core == "dot":
        # light/white token core (for dark backgrounds)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{size*0.060*scale:.2f}" fill="url(#coreg)"/>')
    elif core == "dot_dark":
        # navy token core (for light backgrounds)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{size*0.060*scale:.2f}" fill="#0B1020"/>')
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{size*0.024*scale:.2f}" fill="#fff"/>')
    # core == "none": open aperture

    parts.append('</svg>')
    return "\n".join(parts)


if __name__ == "__main__":
    import sys, os
    outdir = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(outdir, exist_ok=True)
    variants = {
        # primary transparent marks (work on any background)
        "icon_color.svg":       dict(n=6, core="none", swirl=0.55, flat=True),
        "icon_color_grad.svg":  dict(n=6, core="none", swirl=0.55, flat=False),
        "icon_5_color.svg":     dict(n=5, core="none", swirl=0.55, flat=True),
        # app tiles
        "icon_tile_dark.svg":   dict(n=6, core="dot",      swirl=0.55, flat=True, bg="#0B1020", rounded=True),
        "icon_tile_light.svg":  dict(n=6, core="dot_dark", swirl=0.55, flat=True, bg="#F4F6FB", rounded=True),
    }
    for name, kw in variants.items():
        open(os.path.join(outdir, name), "w").write(build_icon(size=512, **kw))
        print("wrote", name)
