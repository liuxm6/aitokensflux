#!/usr/bin/env python3
"""Build a self-contained showcase.html for the aitokensflux brand assets.
Each SVG is embedded as an isolated base64 data-URI <img> (no id collisions)."""
import os, base64

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SVG = os.path.join(ROOT, "svg")

def uri(fn):
    with open(os.path.join(SVG, fn), "rb") as f:
        b = base64.b64encode(f.read()).decode()
    return f"data:image/svg+xml;base64,{b}"

PALETTE = [
    ("Magenta", "#FF4D8D"), ("Orange", "#FF9E3D"), ("Gold", "#FFCE2E"),
    ("Green", "#34E08A"), ("Blue", "#33BFFF"), ("Violet", "#9B6BFF"),
]
NEUTRAL = [("Ink / Navy", "#11142A"), ("Surface dark", "#0B1020"),
           ("Surface light", "#F4F6FB")]

def img(fn, h=None, cls=""):
    style = f'height:{h}px;' if h else ''
    return f'<img class="{cls}" src="{uri(fn)}" style="{style}" alt="{fn}">'

def swatch(name, hexv):
    txt = "#fff" if hexv not in ("#FFCE2E", "#F4F6FB", "#34E08A") else "#11142A"
    return f'''<div class="sw">
      <div class="chip" style="background:{hexv}; color:{txt}">{hexv}</div>
      <div class="swname">{name}</div></div>'''

html = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>aitokensflux — Brand & Logo</title>
<style>
:root {{ color-scheme: light; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color:#11142A; background:#F4F6FB; line-height:1.5; }}
.wrap {{ max-width:1080px; margin:0 auto; padding:48px 28px 96px; }}
.hero {{ background:#fff; border-radius:24px; padding:56px 48px; text-align:center;
         box-shadow:0 1px 0 rgba(17,20,42,.04), 0 24px 60px -28px rgba(17,20,42,.20); }}
.hero img {{ height:96px; }}
.hero p {{ color:#5b6172; margin:18px auto 0; max-width:560px; font-size:15px; }}
h1 {{ font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:#8a90a3;
      margin:64px 0 18px; font-weight:700; }}
.grid {{ display:grid; gap:18px; }}
.g2 {{ grid-template-columns:1fr 1fr; }}
.g3 {{ grid-template-columns:1fr 1fr 1fr; }}
.g6 {{ grid-template-columns:repeat(6,1fr); }}
.card {{ background:#fff; border-radius:18px; padding:34px; display:flex; align-items:center;
         justify-content:center; min-height:150px; box-shadow:0 14px 40px -26px rgba(17,20,42,.30); }}
.card.dark {{ background:#0B1020; }}
.card.tint {{ background:#F4F6FB; box-shadow:inset 0 0 0 1px #e6e9f2; }}
.label {{ font-size:12px; color:#8a90a3; margin:10px 2px 0; }}
.cell {{ display:flex; flex-direction:column; }}
.meaning {{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }}
.meaning .card {{ flex-direction:column; gap:10px; text-align:center; min-height:120px; }}
.dot {{ width:14px; height:14px; border-radius:50%; }}
.mtitle {{ font-weight:700; font-size:15px; }}
.mdesc {{ font-size:13px; color:#5b6172; }}
.sw {{ text-align:center; }}
.chip {{ height:84px; border-radius:14px; display:flex; align-items:flex-end; justify-content:center;
         padding:10px; font-size:12px; font-weight:600; box-shadow:inset 0 0 0 1px rgba(17,20,42,.06); }}
.swname {{ font-size:12px; color:#5b6172; margin-top:8px; }}
.favrow {{ display:flex; align-items:center; gap:28px; flex-wrap:wrap; justify-content:center; }}
.favrow .cell {{ align-items:center; }}
.note {{ background:#fff; border-radius:18px; padding:28px 32px; font-size:14px; color:#3a4051;
         box-shadow:0 14px 40px -26px rgba(17,20,42,.30); }}
.note b {{ color:#11142A; }}
.foot {{ text-align:center; color:#9aa0b2; font-size:12px; margin-top:54px; }}
code {{ background:#eef1f8; padding:2px 7px; border-radius:6px; font-size:12.5px; }}
</style></head>
<body><div class="wrap">

  <div class="hero">
    {img("lockup-horizontal-flux-light.svg")}
    <p>AI API 中转与 Token 接入服务 · 聚合主流模型接口 · 按量计费 · 稳定转发 · 开发者友好</p>
  </div>

  <h1>The idea</h1>
  <div class="meaning">
    <div class="card"><div class="dot" style="background:#FF4D8D"></div>
      <div class="mtitle">聚合 Aggregate</div>
      <div class="mdesc">六道彩色气流 = 汇聚主流模型接口</div></div>
    <div class="card"><div class="dot" style="background:#33BFFF"></div>
      <div class="mtitle">流动 Flux</div>
      <div class="mdesc">统一方向的漩涡 = 稳定转发的数据流</div></div>
    <div class="card"><div class="dot" style="background:#11142A"></div>
      <div class="mtitle">核心 Token</div>
      <div class="mdesc">中心光点 = Token 接入 / 统一入口</div></div>
  </div>

  <h1>Logomark</h1>
  <div class="grid g3">
    <div class="cell"><div class="card tint">{img("icon-color.svg", 116)}</div><div class="label">Primary · color</div></div>
    <div class="cell"><div class="card tint">{img("icon-gradient.svg", 116)}</div><div class="label">Gradient</div></div>
    <div class="cell"><div class="card tint">{img("icon-mono-navy.svg", 116)}</div><div class="label">Mono · ink</div></div>
    <div class="cell"><div class="card dark">{img("icon-color.svg", 116)}</div><div class="label">Color on dark</div></div>
    <div class="cell"><div class="card dark">{img("icon-mono-white.svg", 116)}</div><div class="label">Mono · white</div></div>
    <div class="cell"><div class="card dark">{img("tile-dark.svg", 116)}</div><div class="label">App tile</div></div>
  </div>

  <h1>Lockups — horizontal</h1>
  <div class="grid g2">
    <div class="cell"><div class="card">{img("lockup-horizontal-light.svg", 64)}</div><div class="label">Light · mono</div></div>
    <div class="cell"><div class="card">{img("lockup-horizontal-flux-light.svg", 64)}</div><div class="label">Light · flux accent</div></div>
    <div class="cell"><div class="card dark">{img("lockup-horizontal-dark.svg", 64)}</div><div class="label">Dark · mono</div></div>
    <div class="cell"><div class="card dark">{img("lockup-horizontal-flux-dark.svg", 64)}</div><div class="label">Dark · flux accent</div></div>
  </div>

  <h1>Lockups — stacked</h1>
  <div class="grid g2">
    <div class="cell"><div class="card">{img("lockup-stacked-light.svg", 150)}</div><div class="label">Light</div></div>
    <div class="cell"><div class="card dark">{img("lockup-stacked-dark.svg", 150)}</div><div class="label">Dark</div></div>
  </div>

  <h1>App icon &amp; favicon</h1>
  <div class="card">
    <div class="favrow">
      <div class="cell" style="text-align:center">{img("tile-light.svg", 96)}<div class="label">tile · light</div></div>
      <div class="cell" style="text-align:center">{img("tile-dark.svg", 96)}<div class="label">tile · dark</div></div>
      <div class="cell" style="text-align:center">{img("favicon.svg", 48)}<div class="label">48</div></div>
      <div class="cell" style="text-align:center">{img("favicon.svg", 32)}<div class="label">32</div></div>
      <div class="cell" style="text-align:center">{img("favicon.svg", 16)}<div class="label">16</div></div>
    </div>
  </div>

  <h1>Palette</h1>
  <div class="grid g6">
    {''.join(swatch(n,h) for n,h in PALETTE)}
  </div>
  <div class="grid g3" style="margin-top:18px">
    {''.join(swatch(n,h) for n,h in NEUTRAL)}
  </div>

  <h1>Usage</h1>
  <div class="note">
    <b>Clear space.</b> Keep padding around the logo of at least the height of the token core (the center dot). ·
    <b>Minimum size.</b> Logomark ≥ 20&nbsp;px; horizontal lockup ≥ 120&nbsp;px wide. ·
    <b>Backgrounds.</b> Use the color mark on light/neutral; on photos or dark UI use the dark tile or the white-core version. ·
    <b>Don't</b> recolor individual blades, rotate the wordmark, add shadows to the mono mark, or stretch the lockup. ·
    Files are vector <code>.svg</code> (scales infinitely) plus <code>.png</code>/<code>.ico</code> exports.
  </div>

  <div class="foot">aitokensflux · brand sheet · generated from /svg source files</div>
</div></body></html>'''

open(os.path.join(ROOT, "showcase.html"), "w").write(html)
print("wrote showcase.html", len(html), "bytes")
