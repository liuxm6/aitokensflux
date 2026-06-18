#!/usr/bin/env python3
"""
aitokensflux — "AI 算力战报" share poster (WeChat Moments), 1080x1920.
Running-app share-card style. Two themes: 'gradient' (brand rainbow / dark)
and 'light' (clean data-card). All numbers are editable parameters.
"""
import os, sys, math, html

LOGO_SRC = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "aitokensflux-logo", "src"))
sys.path.insert(0, LOGO_SRC)
import generate_icon as gi          # noqa
import generate_wordmark as gw      # noqa
import re

W, H = 1080, 1920
CX = W / 2

# ---------- palette ----------
C = dict(magenta="#FF4D8D", orange="#FF9E3D", gold="#FFCE2E",
         green="#34E08A", blue="#33BFFF", violet="#9B6BFF",
         green_cta="#1FBE77", green_deep="#10A862",
         ink="#11142A", dark="#0B1020", light="#F4F6FB")
BLADES = [C["magenta"], C["orange"], C["gold"], C["green"], C["blue"], C["violet"]]

CJK = "Noto Sans CJK SC"
NUM = "DejaVu Sans"     # strong for digits / latin

# ---------- data model ----------
TIERS = [
    (200_000,    "见习构建者", "Builder",  1),
    (800_000,    "进阶编码者", "Coder",    2),
    (2_000_000,  "资深骇客",   "Hacker",   3),
    (4_000_000,  "Token 猎人", "Hunter",   4),
    (7_000_000,  "算力骑士",   "Knight",   5),
    (12_000_000, "算力领主",   "Overlord", 6),
    (float("inf"), "算力之神", "Deity",    7),
]

def tier_for(tokens):
    for thr, cn, en, lv in TIERS:
        if tokens < thr:
            return cn, en, lv
    return TIERS[-1][1], TIERS[-1][2], TIERS[-1][3]

def make_data():
    tokens = 8_620_000
    WH_PER_TOKEN = 0.0004           # ~0.4 Wh / 1K tokens (estimate)
    kwh = tokens * WH_PER_TOKEN / 1000.0
    cn, en, lv = tier_for(tokens)
    d = dict(
        date="2026.06.14", handle="@codemaster",
        tokens=tokens, tokens_disp="8.62M",
        tokens_full=f"{tokens:,} tokens",
        percentile="98.6",
        tier_cn=cn, tier_en=en, tier_lv=lv,
        kwh=kwh, kwh_disp=f"{kwh:.1f}",
        phone=round(kwh / 0.015), ev=round(kwh / 0.15), kettle=round(kwh / 0.11),
        streak=37,
        week=[0.45, 0.62, 0.38, 0.80, 0.55, 0.92, 1.0],  # normalized weekly tokens
        note="电量按 ~0.4 Wh / 1K tokens 估算，仅供娱乐",
    )
    return d

# ---------- helpers ----------
def esc(s): return html.escape(str(s))

def _rgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def blend(fg, bg, f):
    """f*fg + (1-f)*bg -> solid hex (avoids alpha, which the internal renderer drops)."""
    a, b = _rgb(fg), _rgb(bg)
    return "#%02X%02X%02X" % tuple(round(a[i]*f + b[i]*(1-f)) for i in range(3))

def text(x, y, s, size, color, font=CJK, weight="normal", anchor="middle",
         spacing=None, opacity=1.0):
    ls = f' letter-spacing="{spacing}"' if spacing is not None else ""
    op = f' opacity="{opacity}"' if opacity != 1.0 else ""
    wt = f' font-weight="{weight}"' if weight != "normal" else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{font}" font-size="{size}"'
            f'{wt} fill="{color}" text-anchor="{anchor}"{ls}{op}>{esc(s)}</text>')

# ---- simple vector icons (24x24 viewBox), placed/scaled via group ----
ICONS = {
 "bolt":  '<path d="M13 1 L4 14 H11 L9 23 L20 9 H12.5 Z"/>',
 "phone": '<rect x="6" y="2" width="12" height="20" rx="3"/><rect x="10.5" y="17.5" width="3" height="2" rx="1" fill="#000" opacity="0.18"/>',
 "car":   '<path d="M2 14 L5 8.5 C5.4 7.6 6 7 7 7 H15 C15.8 7 16.4 7.4 16.9 8.1 L20 13 H21 A1.5 1.5 0 0 1 22.5 14.5 V17 H1.5 V15.5 A1.5 1.5 0 0 1 2 14 Z"/><circle cx="7" cy="17.5" r="2.4"/><circle cx="17" cy="17.5" r="2.4"/>',
 "kettle":'<path d="M6 9 H17 A2 2 0 0 1 19 11 V18 A3 3 0 0 1 16 21 H9 A3 3 0 0 1 6 18 Z"/><path d="M17 11 H20 A2.4 2.4 0 0 1 20 16 H17" fill="none" stroke-width="2.2"/>',
 "flame": '<path d="M12 1.5 C13.5 6 18 7.2 18 13 A6 6 0 1 1 6 13 C6 10.2 7.6 9 9 10.6 C9 7.2 10 4.2 12 1.5 Z"/>',
 "crown": '<path d="M3 18.5 L4.6 7.5 L9.2 12 L12 4.5 L14.8 12 L19.4 7.5 L21 18.5 Z"/><rect x="3" y="18.2" width="18" height="3.2" rx="1.2"/>',
 "trend": '<path d="M2 16 L8 10 L12 13 L21 4" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 4 H21 V10" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
}

def icon(name, cx, cy, size, color, stroke=False):
    s = size / 24.0
    tx = cx - size / 2
    ty = cy - size / 2
    body = ICONS[name]
    paint = (f'fill="none" stroke="{color}"' if stroke else f'fill="{color}" stroke="none"')
    return f'<g transform="translate({tx:.1f},{ty:.1f}) scale({s:.3f})" {paint}>{body}</g>'

# ---- brand pieces ----
def icon_inner(flat=True, core="none", swirl=0.55, mono=None):
    svg = gi.build_icon(size=512, n=6, core=core, swirl=swirl, flat=flat, mono=mono)
    inner = re.sub(r'^<svg[^>]*>', '', svg.strip())
    return re.sub(r'</svg>\s*$', '', inner)

INK_X, INK_Y, INK_W, INK_H = 57, 70, 399, 373  # icon ink bbox in 512 box

def place_icon(x, y, h, core="none", mono=None):
    """Place rotor so its ink top-left sits at (x,y), ink height = h."""
    s = h / INK_H
    tx = x - INK_X * s
    ty = y - INK_Y * s
    return f'<g transform="translate({tx:.2f},{ty:.2f}) scale({s:.4f})">{icon_inner(core=core, mono=mono)}</g>', INK_W * s

# vibrant per-letter colors for "flux" (reads as colorful even at small sizes,
# unlike a gradient which muddies when shrunk in the internal renderer)
FLUX_COLORS = ["#FF4D8D", "#B45CE8", "#6E7BFF", "#33BFFF"]  # f l u x

def place_wordmark(x, baseline, cap_px, color, accent=None):
    if accent:
        runs = [(8 + i, 9 + i, FLUX_COLORS[i]) for i in range(4)]
    else:
        runs = None
    wm = gw.build_wordmark("aitokensflux", tracking=0.02, runs=runs, default_color=color)
    ws = cap_px / wm["capH"]
    parts = [f'<g transform="translate({x - wm["minx"]*ws:.2f},{baseline:.2f}) scale({ws:.4f})">']
    for col, ds in wm["by_color"].items():
        parts.append(f'<path d="{" ".join(ds)}" fill="{col}"/>')
    parts.append('</g>')
    return "".join(parts), wm["width"] * ws

# ---------- themes ----------
def theme(name):
    if name == "gradient":
        bgb = C["dark"]
        return dict(
            bg=bgb, bgbase=bgb, use_bggrad=True, watermark=True,
            panel=blend("#FFFFFF", bgb, 0.07), panel_stroke=blend("#FFFFFF", bgb, 0.20),
            track=blend("#FFFFFF", bgb, 0.16),
            text="#FFFFFF", sub="#B6BEDC", faint="#828BB0",
            accent=C["blue"], hero="url(#rainbow)", energy=C["gold"], bar_fill="url(#rainbow)",
            wm_color="#FFFFFF", wm_accent="url(#wmflux)", logo_core="dot",
            badge_fill="url(#rainbow)", badge_text="#0B1020", badge_sub=blend("#0B1020", C["gold"], 0.62),
            divider=blend("#FFFFFF", bgb, 0.14),
            bar_dim=blend(C["blue"], bgb, 0.55), bloom_op=0.20,
            blooms=[(-40, -30, 560, C["magenta"]), (1150, 110, 620, C["violet"]),
                    (-90, 1990, 640, C["blue"]), (1190, 1900, 560, C["green"]),
                    (1200, 1040, 360, C["orange"])],
        )
    if name == "site":
        bgb = "#FFFFFF"
        return dict(  # aitokensflux.com pastel-aurora scheme
            bg=bgb, bgbase=bgb, use_bggrad=False, watermark=False,
            panel="#FFFFFF", panel_stroke="#E9EEF5", track="#E9EEF5",
            text=C["ink"], sub="#5B6172", faint="#9AA0B2",
            accent=C["green_cta"], hero=C["ink"], energy=C["green_cta"], bar_fill="url(#greenbar)",
            wm_color=C["ink"], wm_accent="url(#wmflux)", logo_core="none",
            badge_fill="url(#greenbar)", badge_text="#FFFFFF", badge_sub="#DDF6EA",
            divider="#EAEEF4",
            bar_dim=blend(C["green_cta"], bgb, 0.32), bloom_op=0.85,
            blooms=[(-170, 60, 860, "#A9DCF0"), (-150, 980, 740, "#BFE9EC"),
                    (-110, 2010, 860, "#B7E8C6"), (1300, 700, 980, "#FBD2A6"),
                    (1250, 1640, 800, "#FAD0BE"), (1320, -120, 640, "#CFEAF6")],
        )
    bgb = C["light"]
    return dict(  # light data-card
        bg=bgb, bgbase=bgb, use_bggrad=False, watermark=False,
        panel="#FFFFFF", panel_stroke="#E6E9F2", track="#E6E9F2",
        text=C["ink"], sub="#5B6172", faint="#9AA0B2",
        accent=C["blue"], hero=C["ink"], energy=C["orange"], bar_fill="url(#rainbow)",
        wm_color=C["ink"], wm_accent="url(#wmflux)", logo_core="none",
        badge_fill=C["ink"], badge_text="#FFFFFF", badge_sub="#AEB6D6",
        divider="#E6E9F2",
        bar_dim=blend(C["blue"], bgb, 0.45), bloom_op=0.12,
        blooms=[(1010, 150, 460, C["blue"]), (90, 1780, 460, C["magenta"])],
    )

def panel(x, y, w, h, t, r=28):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{t["panel"]}" '
            f'stroke="{t["panel_stroke"]}" stroke-width="1.5"/>')


def build_poster(style="gradient"):
    d = make_data()
    t = theme(style)
    M = 80
    P = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" fill="none">']

    # ---- defs ----
    defs = ['<defs>']
    defs.append('<linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0.2">'
                + ''.join(f'<stop offset="{i/5:.2f}" stop-color="{c}"/>' for i, c in enumerate(BLADES))
                + '</linearGradient>')
    defs.append('<linearGradient id="wmflux" x1="0" y1="0" x2="1" y2="0">'
                f'<stop offset="0" stop-color="{C["magenta"]}"/>'
                f'<stop offset="0.5" stop-color="{C["violet"]}"/>'
                f'<stop offset="1" stop-color="{C["blue"]}"/></linearGradient>')
    defs.append('<linearGradient id="bggrad" x1="0" y1="0" x2="0.3" y2="1">'
                '<stop offset="0" stop-color="#10162E"/>'
                '<stop offset="0.55" stop-color="#0B1020"/>'
                '<stop offset="1" stop-color="#070A16"/></linearGradient>')
    defs.append('<linearGradient id="greenbar" x1="0" y1="0" x2="1" y2="0">'
                f'<stop offset="0" stop-color="{C["green"]}"/>'
                f'<stop offset="1" stop-color="{C["green_deep"]}"/></linearGradient>')
    defs.append('</defs>')
    P.append("".join(defs))

    # ---- background ----
    P.append(f'<rect width="{W}" height="{H}" fill="{t["bg"]}"/>')
    if t["use_bggrad"]:
        P.append(f'<rect width="{W}" height="{H}" fill="url(#bggrad)"/>')

    # color blooms: radial gradient from a blended-solid center to the bg color
    # (no element/stop alpha -> renders correctly in the internal renderer too)
    bgb = t["bgbase"]
    blooms = t["blooms"]
    bdefs = ['<defs>']
    for i, (bx, by, br, c) in enumerate(blooms):
        ctr = blend(c, bgb, t["bloom_op"])
        bdefs.append(f'<radialGradient id="bl{i}b"><stop offset="0" stop-color="{ctr}"/>'
                     f'<stop offset="1" stop-color="{bgb}"/></radialGradient>')
    bdefs.append('</defs>')
    P.append("".join(bdefs))
    for i, (bx, by, br, c) in enumerate(blooms):
        P.append(f'<circle cx="{bx}" cy="{by}" r="{br}" fill="url(#bl{i}b)"/>')

    if t["watermark"]:
        # faint rotor watermark behind hero (solid, pre-darkened color)
        wm_icon, _ = place_icon(690, 480, 520, mono=blend(C["violet"], bgb, 0.13))
        P.append(wm_icon)

    # ================= HEADER =================
    licon, liw = place_icon(M, 96, 64, core=t["logo_core"])
    P.append(licon)
    lwm, _ = place_wordmark(M + liw + 22, 150, 40, t["wm_color"], accent=t["wm_accent"])
    P.append(lwm)
    P.append(text(W - M, 128, d["date"], 30, t["sub"], anchor="end"))
    P.append(text(W - M, 168, d["handle"], 26, t["faint"], font=NUM, anchor="end"))

    # ================= TIER BADGE =================
    by = 300
    bw, bh = 392, 86
    bx = CX - bw / 2
    P.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="{bh/2}" fill="{t["badge_fill"]}"/>')
    P.append(icon("crown", bx + 56, by + bh/2, 40, t["badge_text"]))
    P.append(text(bx + 90, by + 40, d["tier_cn"], 40, t["badge_text"], weight="bold", anchor="start"))
    P.append(text(bx + 90, by + 72, f'TOKEN 段位  ·  LV.{d["tier_lv"]}', 22, t["badge_sub"],
                  font=NUM, anchor="start"))

    # ================= HERO =================
    P.append(text(CX, 500, "今 日 T O K E N 消 耗", 34, t["sub"], spacing="2"))
    P.append(text(CX, 690, d["tokens_disp"], 250, t["hero"], font=NUM, weight="bold"))
    P.append(text(CX, 745, d["tokens_full"], 30, t["faint"], font=NUM))
    # percentile bar
    barw, barh, bary = 760, 18, 800
    barx = CX - barw / 2
    pct = float(d["percentile"]) / 100.0
    P.append(f'<rect x="{barx}" y="{bary}" width="{barw}" height="{barh}" rx="{barh/2}" '
             f'fill="{t["track"]}"/>')
    P.append(f'<rect x="{barx}" y="{bary}" width="{barw*pct:.0f}" height="{barh}" rx="{barh/2}" fill="{t["bar_fill"]}"/>')
    P.append(text(CX, 875, f'超过 {d["percentile"]}% 的开发者', 36, t["text"], weight="bold"))

    # ================= ENERGY =================
    P.append(text(CX, 985, "等 效 算 力 电 量", 30, t["sub"], spacing="2"))
    # big kWh with bolt
    P.append(icon("bolt", CX - 250, 1080, 84, t["energy"]))
    P.append(f'<text x="{CX-190}" y="1115" font-family="{NUM}" font-size="170" font-weight="bold" '
             f'fill="{t["energy"]}" text-anchor="start">{d["kwh_disp"]}</text>')
    P.append(text(CX + 270, 1110, "度电", 64, t["text"], weight="bold", anchor="start"))
    P.append(text(CX, 1185, "今天我为代码燃烧的 AI 算力", 32, t["sub"]))

    # ================= ANALOGY CARDS =================
    cards = [("phone", str(d["phone"]), "次", "充满手机"),
             ("car",   str(d["ev"]),    "公里", "电动车续航"),
             ("kettle",str(d["kettle"]),"壶",  "烧开水")]
    cw, ch, gap = 280, 250, 18
    total = cw * 3 + gap * 2
    startx = CX - total / 2
    cardy = 1250
    accents = [C["blue"], C["green"], C["orange"]]
    for i, (icn, num, unit, label) in enumerate(cards):
        x = startx + i * (cw + gap)
        P.append(panel(x, cardy, cw, ch, t, r=30))
        P.append(icon(icn, x + cw/2, cardy + 66, 60, accents[i]))
        P.append(f'<text x="{x+cw/2:.0f}" y="{cardy+170}" font-family="{NUM}" font-size="76" '
                 f'font-weight="bold" fill="{t["text"]}" text-anchor="middle">{num}</text>')
        P.append(text(x + cw/2, cardy + 205, unit, 30, t["sub"]))
        P.append(text(x + cw/2, cardy + 235, label, 28, t["faint"]))

    # ================= STREAK + WEEK =================
    sy = 1570
    P.append(panel(M, sy, W - 2*M, 230, t, r=30))
    P.append(icon("flame", M + 64, sy + 86, 64, C["orange"]))
    P.append(text(M + 110, sy + 72, "连续打卡", 30, t["sub"], anchor="start"))
    P.append(f'<text x="{M+110}" y="{sy+140}" font-family="{NUM}" font-size="78" font-weight="bold" '
             f'fill="{t["text"]}" text-anchor="start">{d["streak"]}<tspan font-size="38"> 天</tspan></text>')
    # weekly bars (right side)
    wkx, wkw = 600, 400
    bw2 = 38
    gap2 = (wkw - bw2 * 7) / 6
    base = sy + 175
    maxh = 120
    days = ["一", "二", "三", "四", "五", "六", "日"]
    for i, v in enumerate(d["week"]):
        bx2 = wkx + i * (bw2 + gap2)
        bh2 = max(8, maxh * v)
        col = t["bar_fill"] if v >= 0.99 else t["bar_dim"]
        P.append(f'<rect x="{bx2:.1f}" y="{base-bh2:.1f}" width="{bw2}" height="{bh2:.1f}" rx="8" fill="{col}"/>')
        P.append(text(bx2 + bw2/2, base + 30, days[i], 22, t["faint"]))
    P.append(text(wkx + wkw, sy + 50, "本周 Token 趋势", 26, t["sub"], anchor="end"))

    # ================= FOOTER =================
    fy = 1854
    fic, fiw = place_icon(M, fy - 30, 40, core=t["logo_core"])
    P.append(fic)
    fwm, _ = place_wordmark(M + fiw + 16, fy, 26, t["wm_color"], accent=t["wm_accent"])
    P.append(fwm)
    P.append(text(W - M, fy - 14, "稳定好用的 AI 编程方案", 26, t["sub"], anchor="end"))
    P.append(text(W - M, fy + 16, "Claude Code / Codex 低成本接入 · aitokensflux.com", 22, t["faint"], font=NUM, anchor="end"))
    P.append(text(CX, fy + 46, d["note"], 19, t["faint"]))

    P.append('</svg>')
    return "\n".join(P)


if __name__ == "__main__":
    outdir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sd = os.path.join(outdir, "svg")
    for style in ("gradient", "light", "site"):
        open(os.path.join(sd, f"poster-{style}.svg"), "w").write(build_poster(style))
        print("wrote svg/poster-%s.svg" % style)
