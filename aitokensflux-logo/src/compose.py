#!/usr/bin/env python3
"""
aitokensflux — lockup composer.
Assembles the icon + wordmark into horizontal and stacked lockups
(light & dark), plus a monochrome and an accented-'flux' variant.
"""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import generate_icon as gi
import generate_wordmark as gw

# icon ink bbox (measured) within its 512 native box
ICON_N = 512
INK_X, INK_Y, INK_W, INK_H = 57, 70, 399, 373

WM_SIZE = 200  # native wordmark size used for metrics


def icon_inner(flat=True, core="none", swirl=0.55):
    svg = gi.build_icon(size=ICON_N, n=6, core=core, swirl=swirl, flat=flat)
    inner = re.sub(r'^<svg[^>]*>', '', svg.strip())
    inner = re.sub(r'</svg>\s*$', '', inner)
    return inner


def horizontal(ih=260, gap_f=0.34, cap_f=0.56, pad=44,
               text_color="#11142A", accent=None, bg=None, rounded=False,
               icon_core="none"):
    s = ih / INK_H                      # icon scale
    iw = INK_W * s                      # icon ink width
    yc_offset = ih / 2                  # within content area
    # wordmark
    runs = [(8, 12, accent)] if accent else None
    wm = gw.build_wordmark("aitokensflux", tracking=0.02, runs=runs,
                           default_color=text_color)
    capH_target = ih * cap_f
    ws = capH_target / wm["capH"]
    wm_w = wm["width"] * ws
    gap = ih * gap_f

    content_w = iw + gap + wm_w
    W = content_w + 2 * pad
    H = ih + 2 * pad
    yc = pad + yc_offset

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.0f}" height="{H:.0f}" '
             f'viewBox="0 0 {W:.1f} {H:.1f}" fill="none">']
    # defs (accent gradient)
    defs = ['<defs>']
    if accent == "url(#flux)":
        defs.append('<linearGradient id="flux" x1="0" y1="0" x2="1" y2="0">'
                    '<stop offset="0" stop-color="#FF4D8D"/>'
                    '<stop offset="0.5" stop-color="#9B6BFF"/>'
                    '<stop offset="1" stop-color="#33BFFF"/></linearGradient>')
    defs.append('</defs>')
    parts.append("".join(defs))
    if bg:
        if rounded:
            parts.append(f'<rect width="{W:.1f}" height="{H:.1f}" rx="{H*0.18:.1f}" fill="{bg}"/>')
        else:
            parts.append(f'<rect width="{W:.1f}" height="{H:.1f}" fill="{bg}"/>')

    # icon: map native ink top-left (INK_X,INK_Y) -> (pad, yc-ih/2)
    tx = pad - INK_X * s
    ty = (yc - ih / 2) - INK_Y * s
    parts.append(f'<g transform="translate({tx:.2f},{ty:.2f}) scale({s:.4f})">{icon_inner(core=icon_core)}</g>')

    # wordmark: left at x = pad+iw+gap, baseline so cap-midline aligns to yc
    wx = pad + iw + gap - wm["minx"] * ws
    bl = yc + (wm["capH"] * ws) / 2
    parts.append(f'<g transform="translate({wx:.2f},{bl:.2f}) scale({ws:.4f})">')
    for col, ds in wm["by_color"].items():
        parts.append(f'<path d="{" ".join(ds)}" fill="{col}"/>')
    parts.append('</g>')
    parts.append('</svg>')
    return "\n".join(parts)


def stacked(iw_disp=300, gap_f=0.16, cap_f=0.30, pad=48,
            text_color="#11142A", accent=None, bg=None, icon_core="none"):
    s = iw_disp / INK_W
    ih = INK_H * s
    runs = [(8, 12, accent)] if accent else None
    wm = gw.build_wordmark("aitokensflux", tracking=0.03, runs=runs,
                           default_color=text_color)
    cap_target = iw_disp * cap_f
    ws = cap_target / wm["capH"]
    wm_w = wm["width"] * ws
    gap = iw_disp * gap_f
    wm_h = wm["capH"] * ws

    content_w = max(iw_disp, wm_w)
    W = content_w + 2 * pad
    H = ih + gap + wm_h + 2 * pad

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.0f}" height="{H:.0f}" '
             f'viewBox="0 0 {W:.1f} {H:.1f}" fill="none">']
    defs = ['<defs>']
    if accent == "url(#flux)":
        defs.append('<linearGradient id="flux" x1="0" y1="0" x2="1" y2="0">'
                    '<stop offset="0" stop-color="#FF4D8D"/>'
                    '<stop offset="0.5" stop-color="#9B6BFF"/>'
                    '<stop offset="1" stop-color="#33BFFF"/></linearGradient>')
    defs.append('</defs>'); parts.append("".join(defs))
    if bg:
        parts.append(f'<rect width="{W:.1f}" height="{H:.1f}" fill="{bg}"/>')

    cxc = W / 2
    # icon centered horizontally, top area
    tx = cxc - (INK_X + INK_W / 2) * s
    ty = pad - INK_Y * s
    parts.append(f'<g transform="translate({tx:.2f},{ty:.2f}) scale({s:.4f})">{icon_inner(core=icon_core)}</g>')
    # wordmark centered, below
    bl = pad + ih + gap + wm_h
    wx = cxc - (wm["width"] * ws) / 2 - wm["minx"] * ws
    parts.append(f'<g transform="translate({wx:.2f},{bl:.2f}) scale({ws:.4f})">')
    for col, ds in wm["by_color"].items():
        parts.append(f'<path d="{" ".join(ds)}" fill="{col}"/>')
    parts.append('</g></svg>')
    return "\n".join(parts)


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "."
    files = {
        # horizontal
        "lockup_h_light.svg":      horizontal(text_color="#11142A"),
        "lockup_h_light_flux.svg": horizontal(text_color="#11142A", accent="url(#flux)"),
        "lockup_h_dark.svg":       horizontal(text_color="#FFFFFF", bg="#0B1020", rounded=True, icon_core="dot"),
        "lockup_h_dark_flux.svg":  horizontal(text_color="#FFFFFF", accent="url(#flux)", bg="#0B1020", rounded=True, icon_core="dot"),
        # stacked
        "lockup_v_light.svg":      stacked(text_color="#11142A"),
        "lockup_v_dark.svg":       stacked(text_color="#FFFFFF", bg="#0B1020", icon_core="dot"),
    }
    for name, svg in files.items():
        open(os.path.join(outdir, name), "w").write(svg)
        print("wrote", name)
