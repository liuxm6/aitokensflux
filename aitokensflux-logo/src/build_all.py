#!/usr/bin/env python3
"""Build the full aitokensflux logo asset set into ./svg with clean names."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import generate_icon as gi
import compose as cp

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SVG = os.path.join(ROOT, "svg")
os.makedirs(SVG, exist_ok=True)

NAVY = "#11142A"
WHITE = "#FFFFFF"
DARKBG = "#0B1020"
LIGHTBG = "#F4F6FB"

def w(name, content):
    open(os.path.join(SVG, name), "w").write(content)
    print("svg/", name)

# ---- icons (transparent, work on any bg) ----
w("icon-color.svg",       gi.build_icon(512, n=6, core="none", swirl=0.55, flat=True))
w("icon-gradient.svg",    gi.build_icon(512, n=6, core="none", swirl=0.55, flat=False))
w("icon-mono-navy.svg",   gi.build_icon(512, n=6, core="none", swirl=0.55, mono=NAVY))
w("icon-mono-white.svg",  gi.build_icon(512, n=6, core="none", swirl=0.55, mono=WHITE))

# ---- tiles (filled, with token-core dot) ----
w("tile-dark.svg",        gi.build_icon(512, n=6, core="dot",      swirl=0.55, flat=True, bg=DARKBG,  rounded=True))
w("tile-light.svg",       gi.build_icon(512, n=6, core="dot_dark", swirl=0.55, flat=True, bg=LIGHTBG, rounded=True))

# favicon: bolder swirl + slightly larger, dark tile + white core
w("favicon.svg",          gi.build_icon(512, n=6, core="dot", swirl=0.42, flat=True, bg=DARKBG, rounded=True, scale=1.06))

# square filled tiles (no rounding) for OS that mask their own corners (iOS)
w("appicon-dark-square.svg",  gi.build_icon(512, n=6, core="dot", swirl=0.55, flat=True, bg=DARKBG))
w("appicon-light-square.svg", gi.build_icon(512, n=6, core="dot_dark", swirl=0.55, flat=True, bg=LIGHTBG))

# ---- lockups ----
w("lockup-horizontal-light.svg",      cp.horizontal(text_color=NAVY))
w("lockup-horizontal-dark.svg",       cp.horizontal(text_color=WHITE, bg=DARKBG, rounded=True, icon_core="dot"))
w("lockup-horizontal-flux-light.svg", cp.horizontal(text_color=NAVY,  accent="url(#flux)"))
w("lockup-horizontal-flux-dark.svg",  cp.horizontal(text_color=WHITE, accent="url(#flux)", bg=DARKBG, rounded=True, icon_core="dot"))
w("lockup-stacked-light.svg",         cp.stacked(text_color=NAVY))
w("lockup-stacked-dark.svg",          cp.stacked(text_color=WHITE, bg=DARKBG, icon_core="dot"))

print("done")
