/* Local, offline prototype. All metrics, accounts and responses are demo fixtures. */
;(() => {
  'use strict'

  /* Lucide icon nodes, ISC license.
   * ISC License
   *
   * Copyright (c) 2026 Lucide Icons and Contributors
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The following Lucide icons are derived from the Feather project:
   *
   * airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out
   *
   * The MIT License (MIT) (for the icons listed above)
   *
   * Copyright (c) 2013-present Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  const icons = {
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    layers:
      '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    type: '<path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    video:
      '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    'audio-lines':
      '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
    mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
    boxes:
      '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
    'file-text':
      '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'log-in':
      '<path d="m10 17 5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
    'scan-text':
      '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h8"/><path d="M7 12h10"/><path d="M7 16h6"/>',
    'circle-dollar-sign':
      '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    'shield-check':
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    server:
      '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    users:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
    'rotate-ccw':
      '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
    'table-2':
      '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>',
    'sliders-horizontal':
      '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
    compass:
      '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'chart-no-axes-combined':
      '<path d="M12 16v5"/><path d="M16 14.639V21"/><path d="M20 10.656V21"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/><path d="M4 18.463V21"/><path d="M8 14.656V21"/>',
    activity:
      '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    'key-round':
      '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    wallet:
      '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    settings:
      '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
    menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
    route:
      '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    brain:
      '<path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>',
    'flask-conical':
      '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    'circle-help':
      '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    trophy:
      '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
    'chart-pie':
      '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
    gift: '<path d="M12 7v14"/><path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"/><rect x="3" y="7" width="18" height="4" rx="1"/>',
    'book-open':
      '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    'building-2':
      '<path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
    'panel-left-close':
      '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
    'square-pen':
      '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'panel-left': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    pencil:
      '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    'trash-2':
      '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    download:
      '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
    'message-square':
      '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
    'arrow-down-up':
      '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>',
    'layout-grid':
      '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    shield:
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    route:
      '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    wrench:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'eye-off':
      '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'refresh-cw':
      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    upload:
      '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    'chevrons-up-down': '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  }
  // aitokensflux 品牌标：与 /aitokensflux-logo 套件同源的 6 瓣几何，
  // 小尺寸使用各瓣的深色变体以保证在白底上的可辨识度。
  const BRAND_MARK =
    '<svg viewBox="0 0 512 512" fill="none"><path d="M256 202.24C272.38 174.59 349.18 103.99 330.9 70.3A48.13 48.13 0 0 1 271.22 70.3C252.93 103.99 262.14 174.59 256 202.24Z" fill="#E81E6A"/><path d="M302.56 229.12C334.69 229.48 434.24 260.69 454.27 228.01A48.13 48.13 0 0 1 424.43 176.33C386.11 177.33 329.57 220.62 302.56 229.12Z" fill="#FF6A1A"/><path d="M302.56 282.88C318.31 310.89 341.05 412.71 379.38 413.71A48.13 48.13 0 0 1 409.21 362.03C389.18 329.35 323.43 302.02 302.56 282.88Z" fill="#F0A800"/><path d="M256 309.76C239.62 337.41 162.82 408.01 181.1 441.7A48.13 48.13 0 0 1 240.78 441.7C259.07 408.01 249.86 337.41 256 309.76Z" fill="#12B268"/><path d="M209.44 282.88C177.31 282.52 77.76 251.31 57.73 283.99A48.13 48.13 0 0 1 87.57 335.67C125.89 334.67 182.43 291.38 209.44 282.88Z" fill="#1391E6"/><path d="M209.44 229.12C193.69 201.11 170.95 99.29 132.62 98.29A48.13 48.13 0 0 1 102.79 149.97C122.82 182.65 188.57 209.98 209.44 229.12Z" fill="#6B3DF2"/><circle cx="256" cy="256" r="30" fill="#11142A"/></svg>'
  const logos = {
    google:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#replica-logo-0-provider-gemini-green)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#replica-logo-0-provider-gemini-red)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#replica-logo-0-provider-gemini-yellow)"/><defs><linearGradient id="replica-logo-0-provider-gemini-green" gradientUnits="userSpaceOnUse" x1="7" x2="11" y1="15.5" y2="12"><stop stop-color="#08B962"/><stop offset="1" stop-color="#08B962" stop-opacity="0"/></linearGradient><linearGradient id="replica-logo-0-provider-gemini-red" gradientUnits="userSpaceOnUse" x1="8" x2="11.5" y1="5.5" y2="11"><stop stop-color="#F94543"/><stop offset="1" stop-color="#F94543" stop-opacity="0"/></linearGradient><linearGradient id="replica-logo-0-provider-gemini-yellow" gradientUnits="userSpaceOnUse" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stop-color="#FABC12"/><stop offset=".46" stop-color="#FABC12" stop-opacity="0"/></linearGradient></defs></svg>',
    gemini:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#replica-logo-1-provider-gemini-green)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#replica-logo-1-provider-gemini-red)"/><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#replica-logo-1-provider-gemini-yellow)"/><defs><linearGradient id="replica-logo-1-provider-gemini-green" gradientUnits="userSpaceOnUse" x1="7" x2="11" y1="15.5" y2="12"><stop stop-color="#08B962"/><stop offset="1" stop-color="#08B962" stop-opacity="0"/></linearGradient><linearGradient id="replica-logo-1-provider-gemini-red" gradientUnits="userSpaceOnUse" x1="8" x2="11.5" y1="5.5" y2="11"><stop stop-color="#F94543"/><stop offset="1" stop-color="#F94543" stop-opacity="0"/></linearGradient><linearGradient id="replica-logo-1-provider-gemini-yellow" gradientUnits="userSpaceOnUse" x1="3.5" x2="17.5" y1="13.5" y2="12"><stop stop-color="#FABC12"/><stop offset=".46" stop-color="#FABC12" stop-opacity="0"/></linearGradient></defs></svg>',
    qwen: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" fill="url(#replica-logo-2-provider-qwen-gradient)" fill-rule="nonzero"/><defs><linearGradient id="replica-logo-2-provider-qwen-gradient" x1="0%" x2="100%" y1="0%" y2="0%"><stop offset="0%" stop-color="#6336E7" stop-opacity=".84"/><stop offset="100%" stop-color="#6F69F7" stop-opacity=".84"/></linearGradient></defs></svg>',
    deepseek:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" fill="#4D6BFE"/></svg>',
    anthropic:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" fill="currentColor"/></svg>',
    openai:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" fill="currentColor"/></svg>',
  }
  const catalog = {
    'claude-3.7': {
      id: 'claude-3.7',
      name: 'Claude 3.7 Sonnet',
      shortName: 'Claude 3.7',
      provider: 'Anthropic',
      glyph: 'A',
      slug: 'anthropic/claude-3.7-sonnet',
      inputRate: 3,
      outputRate: 15,
      input: '$3.00',
      output: '$15.00',
      inputNote: '缓存输入 $0.30',
      context: '200K',
      contextNote: '最大输出 64K',
      latency: '612ms',
      uptime: '99.98%',
      throughput: '73 tok/s',
      summary: '适合复杂推理与工程任务',
      description:
        'Claude 3.7 Sonnet 在复杂代码、工具调用、长文档理解和多步骤推理之间保持均衡。平台会在可用提供方之间自动选择健康路由，并在故障时切换。',
      tags: ['Reasoning', 'Vision', 'Tool calling', 'JSON mode', 'Streaming'],
    },
    'gpt-4.1': {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      shortName: 'GPT-4.1',
      provider: 'OpenAI',
      glyph: 'O',
      slug: 'openai/gpt-4.1',
      inputRate: 2,
      outputRate: 8,
      input: '$2.00',
      output: '$8.00',
      inputNote: '缓存输入 $0.50',
      context: '1M',
      contextNote: '最大输出 32K',
      latency: '780ms',
      uptime: '99.99%',
      throughput: '88 tok/s',
      summary: '适合工具调用与生产工作负载',
      description:
        'GPT-4.1 面向高可靠工具调用、代码生成与大规模生产任务。它提供超长上下文，并适合需要稳定结构化输出的业务。',
      tags: ['Tool calling', 'Vision', 'Code', 'JSON mode', 'Streaming'],
    },
    'gemini-2.5': {
      id: 'gemini-2.5',
      name: 'Gemini 2.5 Pro',
      shortName: 'Gemini 2.5',
      provider: 'Google',
      glyph: 'G',
      slug: 'google/gemini-2.5-pro',
      inputRate: 1.25,
      outputRate: 10,
      input: '$1.25',
      output: '$10.00',
      inputNote: '缓存输入 $0.31',
      context: '1M',
      contextNote: '最大输出 64K',
      latency: '425ms',
      uptime: '99.96%',
      throughput: '92 tok/s',
      summary: '适合长上下文与多模态分析',
      description:
        'Gemini 2.5 Pro 擅长长文档、图像和复杂上下文混合输入，适合高吞吐分析、知识处理与多模态应用。',
      tags: ['Vision', 'Long context', 'Reasoning', 'Tool calling', 'Streaming'],
    },
    'deepseek-v3': {
      id: 'deepseek-v3',
      name: 'DeepSeek V3',
      shortName: 'DeepSeek V3',
      provider: 'DeepSeek',
      glyph: 'D',
      slug: 'deepseek/deepseek-v3',
      inputRate: 0.27,
      outputRate: 1.1,
      input: '$0.27',
      output: '$1.10',
      inputNote: '缓存输入 $0.07',
      context: '128K',
      contextNote: '最大输出 16K',
      latency: '520ms',
      uptime: '99.94%',
      throughput: '101 tok/s',
      summary: '适合中文、代码与高性价比任务',
      description:
        'DeepSeek V3 在中文理解、代码生成与通用工作负载之间保持较高价格效率，适合吞吐敏感的生产场景。',
      tags: ['Value', 'Code', 'Chinese', 'Fast', 'Streaming'],
    },
    'o3-mini': {
      id: 'o3-mini',
      name: 'o3-mini',
      shortName: 'o3-mini',
      provider: 'OpenAI',
      glyph: 'O',
      slug: 'openai/o3-mini',
      inputRate: 1.1,
      outputRate: 4.4,
      input: '$1.10',
      output: '$4.40',
      inputNote: '缓存输入 $0.55',
      context: '200K',
      contextNote: '最大输出 100K',
      latency: '940ms',
      uptime: '99.95%',
      throughput: '54 tok/s',
      summary: '适合数学、代码与深度推理',
      description: 'o3-mini 面向需要多步思考的数学、工程和代码任务，适合以推理质量优先的工作负载。',
      tags: ['Reasoning', 'Math', 'Code', 'Tool calling', 'Streaming'],
    },
    'claude-haiku': {
      id: 'claude-haiku',
      name: 'Claude 3.5 Haiku',
      shortName: 'Claude Haiku',
      provider: 'Anthropic',
      glyph: 'A',
      slug: 'anthropic/claude-3.5-haiku',
      inputRate: 0.8,
      outputRate: 4,
      input: '$0.80',
      output: '$4.00',
      inputNote: '缓存输入 $0.08',
      context: '200K',
      contextNote: '最大输出 8K',
      latency: '310ms',
      uptime: '99.99%',
      throughput: '128 tok/s',
      summary: '适合低延迟与高并发任务',
      description:
        'Claude 3.5 Haiku 提供较低首 Token 延迟，适合分类、提取、轻量视觉与高并发对话任务。',
      tags: ['Fast', 'Vision', 'Tool calling', 'Code', 'Streaming'],
    },
    'llama-4': {
      id: 'llama-4',
      name: 'Llama 4 Maverick',
      shortName: 'Llama 4',
      provider: 'Meta',
      glyph: 'M',
      slug: 'meta/llama-4-maverick',
      inputRate: 0.22,
      outputRate: 0.88,
      input: '$0.22',
      output: '$0.88',
      inputNote: '缓存输入 $0.05',
      context: '1M',
      contextNote: '最大输出 32K',
      latency: '480ms',
      uptime: '99.91%',
      throughput: '110 tok/s',
      summary: '适合开放模型与多模态场景',
      description:
        'Llama 4 Maverick 提供开放模型生态、长上下文和多模态能力，适合希望保持模型灵活性的团队。',
      tags: ['Open model', 'Vision', 'Long context', 'Fast', 'Streaming'],
    },
    'qwen-3': {
      id: 'qwen-3',
      name: 'Qwen 3 235B',
      shortName: 'Qwen 3',
      provider: 'Qwen',
      glyph: 'Q',
      slug: 'qwen/qwen3-235b',
      inputRate: 0.55,
      outputRate: 2.2,
      input: '$0.55',
      output: '$2.20',
      inputNote: '缓存输入 $0.14',
      context: '128K',
      contextNote: '最大输出 32K',
      latency: '560ms',
      uptime: '99.93%',
      throughput: '90 tok/s',
      summary: '适合中文推理与代码任务',
      description: 'Qwen 3 235B 面向中文、代码和多步骤推理，适合需要中文语境和工具调用能力的业务。',
      tags: ['Reasoning', 'Chinese', 'Code', 'Tool calling', 'Streaming'],
    },
  }
  const modelExtras = {
    'claude-3.7': {
      inputs: ['text', 'image', 'file'],
      usage: 8.2,
      date: '2025-02-24',
      hosts: ['Anthropic', 'Amazon Bedrock', 'Google Vertex'],
    },
    'gpt-4.1': {
      inputs: ['text', 'image', 'file'],
      usage: 7.6,
      date: '2025-04-14',
      hosts: ['OpenAI', 'Azure'],
    },
    'gemini-2.5': {
      inputs: ['text', 'image', 'file', 'audio', 'video'],
      usage: 6.8,
      date: '2025-06-17',
      hosts: ['Google AI Studio', 'Google Vertex'],
    },
    'deepseek-v3': {
      inputs: ['text'],
      usage: 9.1,
      date: '2025-03-24',
      hosts: ['DeepSeek', 'Together', 'Fireworks'],
    },
    'o3-mini': { inputs: ['text'], usage: 3.2, date: '2025-01-31', hosts: ['OpenAI', 'Azure'] },
    'claude-haiku': {
      inputs: ['text', 'image'],
      usage: 5.3,
      date: '2024-10-22',
      hosts: ['Anthropic', 'Amazon Bedrock'],
    },
    'llama-4': {
      inputs: ['text', 'image'],
      usage: 2.7,
      date: '2025-04-05',
      hosts: ['Together', 'Fireworks'],
    },
    'qwen-3': {
      inputs: ['text'],
      usage: 4.5,
      date: '2025-04-28',
      hosts: ['Together', 'Fireworks'],
    },
  }
  const models = Object.values(catalog).map((model) => ({
    ...model,
    ...modelExtras[model.id],
    outputs: ['text'],
    variant: 'standard',
    contextTokens: model.context.endsWith('M') ? 1000000 : parseInt(model.context, 10) * 1000,
    open: ['DeepSeek', 'Meta', 'Qwen'].includes(model.provider),
    zdr: model.provider !== 'DeepSeek',
    tools: model.tags.includes('Tool calling'),
    category: model.tags.includes('Reasoning') ? 'reasoning' : 'general',
  }))
  models.push(
    {
      id: 'qwen-3-free',
      name: 'Qwen 3 235B (free)',
      provider: 'Qwen',
      slug: 'qwen/qwen3-235b:free',
      description: 'Qwen 3 的免费推理变体，支持中文、代码与工具调用。适合评估模型能力和低频实验。',
      inputRate: 0,
      outputRate: 0,
      context: '128K',
      contextTokens: 128000,
      inputs: ['text'],
      outputs: ['text'],
      date: '2025-04-28',
      usage: 1.2,
      hosts: ['Together'],
      variant: 'free',
      open: true,
      zdr: true,
      tools: true,
      category: 'reasoning',
      latency: '810ms',
      throughput: '48 tok/s',
      uptime: '99.82%',
      tags: ['Reasoning', 'Code', 'Tool calling'],
    },
    {
      id: 'flux-1.1-pro',
      name: 'FLUX 1.1 Pro',
      provider: 'Black Forest Labs',
      slug: 'black-forest-labs/flux-1.1-pro',
      description:
        '文本到图像生成模型，擅长细节、文字渲染和提示词遵循。支持多种宽高比，适用于创意制作与产品视觉。',
      inputRate: 0,
      outputRate: 0,
      imagePrice: 0.04,
      context: '4K',
      contextTokens: 4000,
      inputs: ['text'],
      outputs: ['image'],
      date: '2024-10-02',
      usage: 0.12,
      hosts: ['Black Forest Labs'],
      variant: 'standard',
      open: false,
      zdr: true,
      tools: false,
      category: 'creative',
      latency: '2400ms',
      throughput: '1 img/s',
      uptime: '99.95%',
      tags: ['Image generation'],
    },
    {
      id: 'whisper-large-v3',
      name: 'Whisper Large V3',
      provider: 'OpenAI',
      slug: 'openai/whisper-large-v3',
      description:
        '多语言语音识别模型，可将音频转录为文本。支持多种语言，适用于字幕、会议记录和音频内容整理。',
      inputRate: 0,
      outputRate: 0,
      audioPrice: 0.006,
      context: '30s',
      contextTokens: 0,
      inputs: ['audio'],
      outputs: ['transcription'],
      date: '2023-11-06',
      usage: 0.08,
      hosts: ['OpenAI'],
      variant: 'standard',
      open: true,
      zdr: true,
      tools: false,
      category: 'audio',
      latency: '650ms',
      throughput: '30 sec/s',
      uptime: '99.98%',
      tags: ['Transcription'],
    },
    {
      id: 'text-embedding-3-small',
      name: 'Text Embedding 3 Small',
      provider: 'OpenAI',
      slug: 'openai/text-embedding-3-small',
      description:
        '高性价比文本向量模型，将文本转换为用于语义搜索、相似度计算与检索增强生成的向量。支持最高 1536 维输出。',
      inputRate: 0.02,
      outputRate: 0,
      context: '8K',
      contextTokens: 8192,
      inputs: ['text'],
      outputs: ['embeddings'],
      date: '2024-01-25',
      usage: 0.6,
      hosts: ['OpenAI', 'Azure'],
      variant: 'standard',
      open: false,
      zdr: true,
      tools: false,
      category: 'retrieval',
      latency: '92ms',
      throughput: '1800 tok/s',
      uptime: '99.99%',
      tags: ['Embeddings'],
    },
  )
  const modalityNames = {
    all: '全部',
    text: '文本',
    image: '图像',
    video: '视频',
    speech: '语音',
    transcription: '转录',
    embeddings: '向量',
    audio: '音频',
    file: '文件',
  }
  const modalityIcons = {
    all: 'layers',
    text: 'type',
    image: 'image',
    video: 'video',
    speech: 'audio-lines',
    transcription: 'mic',
    embeddings: 'boxes',
    audio: 'audio-lines',
    file: 'file-text',
  }
  const hostNames = [...new Set(models.flatMap((model) => model.hosts))]
  const app = document.getElementById('app')
  const dialog = document.createElement('dialog')
  dialog.className = 'v6-dialog'
  document.body.append(dialog)
  const storageKey = 'tokenflux-v6-demo-v2'
  const defaults = {
    pins: [],
    keys: [
      {
        id: 'key-production',
        name: 'Production App',
        limit: 100,
        used: 24.86,
        enabled: true,
        expiry: '永不过期',
        prefix: 'sk-demo-••••e41a',
        lastUsed: '2 小时前',
      },
      {
        id: 'key-development',
        name: 'Development',
        limit: 20,
        used: 3.12,
        enabled: true,
        expiry: '永不过期',
        prefix: 'sk-demo-••••c782',
        lastUsed: '昨天',
      },
    ],
    rooms: [],
    balance: 42.8,
    transactions: [{ date: '2026-09-18', amount: 50, type: '余额充值', status: '已完成' }],
    settings: { name: 'Demo Workspace', zdr: true, fallback: true },
    chatModels: ['claude-3.7'],
    temperature: 0.7,
  }
  let saved = {}
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    /* File previews may have storage disabled. */
  }
  const state = { ...defaults, ...saved, settings: { ...defaults.settings, ...saved.settings } }
  if (!Array.isArray(state.pins)) state.pins = []
  state.pins = state.pins.filter((id) => models.some((model) => model.id === id))
  if (!Array.isArray(state.keys)) state.keys = defaults.keys
  if (!Array.isArray(state.rooms)) state.rooms = []
  if (!Array.isArray(state.chatModels)) state.chatModels = defaults.chatModels
  state.chatModels = state.chatModels
    .filter((id) => models.some((model) => model.id === id && model.outputs.includes('text')))
    .slice(0, 3)
  if (!state.chatModels.length) state.chatModels = defaults.chatModels
  let route = 'home'
  let params = new URLSearchParams()
  let roomId = state.rooms.some((room) => room.id === state.activeRoom) ? state.activeRoom : ''
  let dialogOpener = null
  let chartObserver = null
  let sectionObserver = null
  let toastTimer = 0
  let catalogFilter = null
  let draftPrompt = ''
  let chatTimer = 0
  let chatPending = false
  let chatGeneration = 0
  let logoIndex = 0
  const charts = []
  const activity = Array.from({ length: 28 }, (_, index) => ({
    id: 'gen_demo_' + (1042 + index),
    model: models[index % 8],
    time: `2026-09-${String(20 - Math.floor(index / 7)).padStart(2, '0')} ${String(18 - (index % 7)).padStart(2, '0')}:24`,
    input: 1240 + index * 103,
    output: 386 + index * 29,
    latency: 320 + index * 17,
    cost: 0.006 + (index % 6) * 0.004,
    ok: index !== 9,
  }))

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      /* Keep working in memory if storage is unavailable. */
    }
  }
  function esc(value) {
    return String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    )
  }
  function icon(name) {
    return `<svg class="v6-icon" aria-hidden="true" viewBox="0 0 24 24">${icons[name] || icons.layers}</svg>`
  }
  function money(value) {
    return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 4 })
  }
  function logo(provider) {
    const prefix = 'v6-logo-' + ++logoIndex + '-'
    const svg = logos[provider.toLowerCase()]
      ?.replaceAll('id="', 'id="' + prefix)
      .replaceAll('url(#', 'url(#' + prefix)
    return `<span class="v6-logo" aria-hidden="true">${svg || esc(provider.slice(0, 1))}</span>`
  }
  function link(path, label, className = 'v6-btn', symbol = '') {
    return `<a class="${className}" href="#/${path}">${symbol ? icon(symbol) : ''}${label}</a>`
  }
  function button(action, label, symbol = '', extra = '', className = 'v6-btn') {
    return `<button type="button" class="${className}" data-action="${action}" ${extra}>${symbol ? icon(symbol) : ''}${label}</button>`
  }
  function iconButton(action, label, symbol, extra = '') {
    return button(
      action,
      '',
      symbol,
      `aria-label="${esc(label)}" title="${esc(label)}" ${extra}`,
      'v6-btn ghost v6-icon-btn',
    )
  }
  function getModel(id) {
    return models.find((model) => model.id === id)
  }
  function tabs(items, active, action, label) {
    return `<div class="v6-tabs" role="tablist" aria-label="${label}">${items.map(([value, text, symbol]) => `<button type="button" role="tab" aria-selected="${value === active}" tabindex="${value === active ? 0 : -1}" class="${value === active ? 'active' : ''}" data-action="${action}" data-value="${value}">${symbol ? icon(symbol) : ''}${text}</button>`).join('')}</div>`
  }
  function search(id, placeholder, value = '') {
    return `<div class="v6-search">${icon('search')}<input class="v6-input" type="search" id="${id}" aria-label="${placeholder}" placeholder="${placeholder}" value="${esc(value)}" autocomplete="off"></div>`
  }
  function empty(title, detail, action = '') {
    return `<div class="v6-empty"><h3>${title}</h3><p>${detail}</p>${action}</div>`
  }
  function stat(label, value, note = '') {
    return `<div class="v6-stat"><small>${label}</small><strong>${value}</strong>${note ? `<div class="v6-muted v6-small">${note}</div>` : ''}</div>`
  }
  function check(name, value, label, checked = false, count = '') {
    return `<label class="v6-check"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''}><span>${label}</span>${count !== '' ? `<small>${count}</small>` : ''}</label>`
  }
  function group(title, symbol, content, open = false) {
    return `<details class="v6-filter" ${open ? 'open' : ''}><summary>${icon(symbol)}${title}${icon('chevron-right')}</summary><div class="v6-filter-body">${content}</div></details>`
  }
  function sectionNav(items) {
    return `<nav class="v6-section-nav" aria-label="页面分区">${items.map(([id, label, symbol], index) => `<a href="#/${route}?${params.toString()}" data-section="${id}" class="${index === 0 ? 'active' : ''}">${icon(symbol)}${label}</a>`).join('')}</nav>`
  }
  function section(id, title, description, content) {
    return `<section id="${id}" class="v6-section"><h2>${title}</h2>${description ? `<p>${description}</p>` : ''}${content}</section>`
  }
  function chart(id, kind = 'usage') {
    return `<div class="v6-chart"><canvas data-chart="${kind}" id="${id}" role="img" aria-label="${kind === 'usage' ? '模型用量趋势' : kind === 'price' ? '模型价格历史' : '性能变化趋势'}，演示数据"></canvas><div class="v6-chart-tooltip" hidden></div></div>`
  }
  function pin(model) {
    return iconButton(
      'pin',
      state.pins.includes(model.id) ? '取消收藏' : '收藏模型',
      'star',
      `data-id="${model.id}" aria-pressed="${state.pins.includes(model.id)}"`,
    )
  }
  function modelPrice(model) {
    return model.imagePrice
      ? `${money(model.imagePrice)} / 张图像`
      : model.audioPrice
        ? `${money(model.audioPrice)} / 分钟`
        : `${money(model.inputRate)}/M 输入 tokens`
  }
  function modelCard(model) {
    return `<article class="v6-model" data-model-id="${model.id}"><div class="v6-model-heading">${logo(model.provider)}${link('models/' + model.id, esc(model.provider + ': ' + model.name), 'v6-model-title')}<span class="v6-badge">${icon(modalityIcons[model.outputs[0]])}</span>${iconButton('copy', '复制模型 ID', 'copy', `data-copy="${esc(model.slug)}"`)}${pin(model)}<span class="v6-volume">${model.usage}B tokens <span title="最近 7 天用量，演示数据">${icon('info')}</span></span></div><a class="v6-model-description" href="#/models/${model.id}">${esc(model.description)}</a><div class="v6-meta">${link('models?author=' + encodeURIComponent(model.provider), 'by ' + esc(model.provider.toLowerCase()), '')}<span>${model.date}</span><span>${model.context} context</span><span>${modelPrice(model)}</span>${!model.imagePrice && !model.audioPrice && model.outputs[0] !== 'embeddings' ? `<span>${money(model.outputRate)}/M 输出 tokens</span>` : ''}</div></article>`
  }
  function rankedRows(list, metric = 'usage') {
    return list
      .map(
        (model, index) =>
          `<a class="v6-ranked-row" href="#/models/${model.id}"><span class="v6-muted">${index + 1}.</span><div class="v6-row">${logo(model.provider)}<div><strong>${esc(model.name)}</strong><small>by ${esc(model.provider)}</small></div></div><div>${metric === 'speed' ? model.throughput : model.usage + 'B tokens'}<small>${metric === 'speed' ? '吞吐量' : '+' + (8 + index * 3) + '%'}</small></div></a>`,
      )
      .join('')
  }

  function renderHeader() {
    const header = document.querySelector('.app-header')
    header.classList.add('v6-header')
    header.innerHTML = `<div class="header-inner"><a class="brand" href="#/home" aria-label="aitokensflux 首页"><span class="brand-mark" aria-hidden="true">${BRAND_MARK}</span><span class="brand-word">aitokens<em>flux</em></span></a><button class="header-search" data-action="search" aria-label="搜索模型与页面">${icon('search')}<span>搜索</span><span class="keycap">⌘ K</span></button><nav class="primary-nav" aria-label="主导航">${link('models', '模型', 'nav-link ' + (['models', 'discover', 'providers'].includes(route.split('/')[0]) ? 'active' : ''))}${link('chat', '聊天', 'nav-link ' + (route === 'chat' ? 'active' : ''))}${link('rankings', '排行榜', 'nav-link ' + (route === 'rankings' ? 'active' : ''))}${link('pricing', '价格', 'nav-link ' + (route === 'pricing' ? 'active' : ''))}${link('docs', '文档', 'nav-link ' + (route === 'docs' ? 'active' : ''))}</nav><div class="header-actions"><details class="v6-dropdown"><summary class="v6-account-btn" aria-label="账户"><span class="v6-avatar">${esc(state.settings.name.slice(0, 1))}</span><span class="v6-account-label">个人</span>${icon('chevron-down')}</summary><div class="v6-menu right">${[
      ['console', '用量概览', 'layout-grid'],
      ['console/keys', 'API Keys', 'key-round'],
      ['console/activity', '活动记录', 'activity'],
      ['console/credits', '余额与账单', 'wallet'],
      ['console/settings', '工作区设置', 'settings'],
      ['console/profile', '个人资料', 'user'],
    ]
      .map(([path, name, symbol]) => link(path, name, '', symbol))
      .join(
        '',
      )}</div></details>${button('mobile-menu', '', 'menu', 'aria-label="打开菜单"', 'v6-btn v6-icon-btn v6-mobile-menu')}</div></div>`
  }
  function footer() {
    return `<footer class="v6-footer"><div><a href="#/home" class="brand"><span class="brand-mark" aria-hidden="true">${BRAND_MARK}</span><span class="brand-word">aitokens<em>flux</em></span></a><p class="v6-small v6-muted">一个 API，连接多种模型。</p><span class="v6-badge">V6 Demo · 本地演示数据</span></div><div><h3>产品</h3>${link('models', '模型目录', '')}${link('discover', '发现模型', '')}${link('rankings', '排行榜', '')}${link('providers', '提供商', '')}</div><div><h3>开发者</h3>${link('docs', '文档', '')}${link('chat', '聊天试用', '')}${link('console/keys', 'API Keys', '')}</div><div><h3>账户</h3>${link('pricing', '价格', '')}${link('console', '用量概览', '')}${link('console/credits', '余额与账单', '')}${link('console/settings', '设置', '')}</div></footer>`
  }

  function renderHome() {
    app.append(document.getElementById('page-home').content.cloneNode(true))
    const home = app.querySelector('.premium-home')
    requestAnimationFrame(() => home.classList.add('route-connected'))
  }

  function renderModels() {
    catalogFilter = {
      query: params.get('q') || '',
      output: params.get('output') || 'all',
      author: params.get('author') || '',
      category: params.get('category') || '',
      host: params.get('provider') || '',
      sort: params.get('sort') || 'newest',
      variant: params.get('variant') || 'all',
      pinned: params.get('pinned') === 'true',
      view: params.get('view') === 'table' ? 'table' : 'list',
    }
    const selectedInputs = (params.get('inputs') || '').split(',')
    const authors = [...new Set(models.map((model) => model.provider))]
    const filterGroups =
      group(
        '输入模态',
        'log-in',
        ['text', 'image', 'file', 'audio', 'video']
          .map((value) =>
            check('input', value, modalityNames[value], selectedInputs.includes(value)),
          )
          .join(''),
        true,
      ) +
      group(
        '上下文长度',
        'scan-text',
        `<label>至少 <output id="context-label">${Number(params.get('context') || 0)}K</output><input type="range" id="context-range" min="0" max="1000" step="8" value="${Number(params.get('context') || 0)}"></label>`,
        Boolean(params.get('context')),
      ) +
      group(
        '输入价格',
        'circle-dollar-sign',
        `<label>最高 <output id="price-label">${params.get('price') ? money(params.get('price')) : '不限'}</output> / 百万 tokens<input type="range" id="price-range" min="0" max="20" step="0.05" value="${Number(params.get('price') ?? 20)}"></label>`,
        Boolean(params.get('price')),
      ) +
      group(
        '类别',
        'tag',
        [
          ['code', '编程'],
          ['reasoning', '推理'],
          ['vision', '视觉理解'],
          ['fast', '低延迟'],
        ]
          .map(([value, label]) =>
            check('category', value, label, catalogFilter.category.split(',').includes(value)),
          )
          .join(''),
      ) +
      group(
        '支持的参数',
        'code',
        [
          ['tools', '工具调用'],
          ['structured', '结构化输出'],
          ['streaming', '流式输出'],
        ]
          .map(([value, label]) =>
            check(
              'parameter',
              value,
              label,
              (params.get('parameters') || '').split(',').includes(value),
            ),
          )
          .join(''),
      ) +
      group('开放权重', 'box', check('open', 'yes', '仅开放权重模型', params.has('open'))) +
      group(
        '零数据保留',
        'shield-check',
        check('zdr', 'yes', '支持零数据保留', params.has('zdr')),
      ) +
      group(
        '输出价格',
        'circle-dollar-sign',
        `<label>最高 <output id="output-price-label">${params.has('outprice') ? money(params.get('outprice')) : '不限'}</output> / 百万 tokens<input type="range" id="output-price-range" min="0" max="30" step="0.1" value="${Number(params.get('outprice') ?? 30)}"></label>`,
        params.has('outprice'),
      ) +
      group(
        '提供商',
        'server',
        hostNames
          .map((host) =>
            check('host', host, esc(host), catalogFilter.host.split(',').includes(host)),
          )
          .join(''),
      ) +
      group(
        '模型作者',
        'users',
        authors
          .map((author) =>
            check(
              'author',
              author,
              esc(author),
              catalogFilter.author.split(',').includes(author),
              models.filter((model) => model.provider === author).length,
            ),
          )
          .join(''),
        !!catalogFilter.author,
      )
    app.innerHTML = `<div class="v6-directory"><aside class="v6-filters" id="catalog-filters" aria-label="模型筛选"><div class="v6-row v6-between v6-mobile-filter"><h3>筛选模型</h3>${button('filters-close', '完成', 'check')}</div>${filterGroups}${button('filters-reset', '重置筛选', 'rotate-ccw', '', 'v6-btn ghost')}</aside><div class="v6-model-main"><div class="v6-title"><h1>模型</h1>${link('discover', '发现模型', 'v6-btn', 'compass')}</div><div class="v6-toolbar">${search('model-search', '搜索模型…', catalogFilter.query)}<select id="model-sort" class="v6-select" aria-label="模型排序">${[
      ['newest', '最新发布'],
      ['popular', '本周热门'],
      ['price', '输入价格：低到高'],
      ['outputprice', '输出价格：低到高'],
      ['context', '上下文：长到短'],
      ['name', '名称 A–Z'],
    ]
      .map(
        ([value, name]) =>
          `<option value="${value}" ${value === catalogFilter.sort ? 'selected' : ''}>${name}</option>`,
      )
      .join('')}</select><select id="model-variant" class="v6-select" aria-label="模型变体">${[
      ['all', '全部变体'],
      ['standard', '标准模型'],
      ['free', '免费模型'],
    ]
      .map(
        ([value, name]) =>
          `<option value="${value}" ${value === catalogFilter.variant ? 'selected' : ''}>${name}</option>`,
      )
      .join(
        '',
      )}</select>${button('pinned-only', '已收藏', 'star', `aria-pressed="${catalogFilter.pinned}"`)}<div class="v6-segment" aria-label="模型展示方式">${[
      ['list', '列表', 'list'],
      ['table', '表格', 'table-2'],
    ]
      .map(
        ([value, label, symbol]) =>
          `<button data-action="model-view" data-value="${value}" class="${catalogFilter.view === value ? 'active' : ''}" aria-label="${label}视图" aria-pressed="${catalogFilter.view === value}">${icon(symbol)}<span class="v6-view-label">${label}</span></button>`,
      )
      .join(
        '',
      )}</div>${button('filters-open', '筛选', 'sliders-horizontal', '', 'v6-btn v6-mobile-filter')}</div>${tabs(
      ['all', 'text', 'image', 'video', 'speech', 'transcription', 'embeddings'].map((value) => [
        value,
        modalityNames[value] +
          (value === 'all'
            ? ''
            : ` <small>${models.filter((model) => model.outputs.includes(value)).length}</small>`),
        modalityIcons[value],
      ]),
      catalogFilter.output,
      'output-modality',
      '输出模态',
    )}<div class="v6-result-count" id="model-count" aria-live="polite"></div><div id="model-results"></div></div></div>`
    filterModels(false)
  }
  function filterModels(sync = true) {
    if (!catalogFilter || !document.getElementById('model-results')) return
    const selected = (name) =>
      [...app.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value)
    const inputs = selected('input'),
      authors = selected('author'),
      hosts = selected('host'),
      categories = selected('category'),
      parameters = selected('parameter')
    const minContext = Number(document.getElementById('context-range').value) * 1000
    const maxPrice = Number(document.getElementById('price-range').value)
    const maxOutput = Number(document.getElementById('output-price-range').value)
    const isOpen = selected('open').length > 0,
      zdr = selected('zdr').length > 0
    const query = document.getElementById('model-search').value.trim().toLowerCase()
    catalogFilter.query = query
    const list = models.filter(
      (model) =>
        (!query ||
          `${model.name} ${model.provider} ${model.slug} ${model.description}`
            .toLowerCase()
            .includes(query)) &&
        (catalogFilter.output === 'all' || model.outputs.includes(catalogFilter.output)) &&
        inputs.every((input) => model.inputs.includes(input)) &&
        (!authors.length || authors.includes(model.provider)) &&
        (!hosts.length || model.hosts.some((host) => hosts.includes(host))) &&
        (!categories.length ||
          categories.some((category) =>
            category === 'vision'
              ? model.inputs.includes('image')
              : category === 'fast'
                ? parseInt(model.latency, 10) < 500
                : category === 'code'
                  ? model.tags.includes('Code')
                  : model.category === category,
          )) &&
        parameters.every((parameter) =>
          parameter === 'tools'
            ? model.tools
            : parameter === 'structured'
              ? model.tags.includes('JSON mode')
              : model.outputs.includes('text'),
        ) &&
        (!catalogFilter.pinned || state.pins.includes(model.id)) &&
        (catalogFilter.variant === 'all' || model.variant === catalogFilter.variant) &&
        model.contextTokens >= minContext &&
        (maxPrice === 20 ||
          (!model.imagePrice && !model.audioPrice && model.inputRate <= maxPrice)) &&
        (maxOutput === 30 ||
          (!model.imagePrice && !model.audioPrice && model.outputRate <= maxOutput)) &&
        (!isOpen || model.open) &&
        (!zdr || model.zdr),
    )
    list.sort((a, b) =>
      catalogFilter.sort === 'price'
        ? a.inputRate - b.inputRate
        : catalogFilter.sort === 'outputprice'
          ? a.outputRate - b.outputRate
          : catalogFilter.sort === 'context'
            ? b.contextTokens - a.contextTokens
            : catalogFilter.sort === 'popular'
              ? b.usage - a.usage
              : catalogFilter.sort === 'name'
                ? a.name.localeCompare(b.name)
                : b.date.localeCompare(a.date),
    )
    document.getElementById('model-count').textContent = `${list.length} 个模型 · 演示目录`
    document.getElementById('model-results').innerHTML = !list.length
      ? empty(
          '没有找到模型',
          '调整搜索词或筛选条件后重试。',
          button('filters-reset', '重置筛选', 'rotate-ccw'),
        )
      : catalogFilter.view === 'list'
        ? `<div class="v6-models">${list.map(modelCard).join('')}</div>`
        : `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>模型</th><th>输入价格</th><th>输出价格 /M</th><th>上下文</th><th>输出模态</th><th>收藏</th></tr></thead><tbody>${list.map((model) => `<tr><td>${link('models/' + model.id, `<span class="v6-row">${logo(model.provider)}${esc(model.name)}</span>`, '')}</td><td>${modelPrice(model)}</td><td>${model.imagePrice || model.audioPrice ? '不适用' : money(model.outputRate)}</td><td>${model.context}</td><td>${modalityNames[model.outputs[0]]}</td><td>${pin(model)}</td></tr>`).join('')}</tbody></table></div>`
    document.getElementById('context-label').textContent = minContext / 1000 + 'K'
    document.getElementById('price-label').textContent = maxPrice === 20 ? '不限' : money(maxPrice)
    document.getElementById('output-price-label').textContent =
      maxOutput === 30 ? '不限' : money(maxOutput)
    if (sync) {
      const next = new URLSearchParams()
      const values = {
        q: query,
        output: catalogFilter.output === 'all' ? '' : catalogFilter.output,
        author: authors.join(','),
        provider: hosts.join(','),
        category: categories.join(','),
        inputs: inputs.join(','),
        parameters: parameters.join(','),
        sort: catalogFilter.sort === 'newest' ? '' : catalogFilter.sort,
        variant: catalogFilter.variant === 'all' ? '' : catalogFilter.variant,
        pinned: catalogFilter.pinned ? 'true' : '',
        context: minContext ? minContext / 1000 : '',
        price: maxPrice < 20 ? maxPrice : '',
        outprice: maxOutput < 30 ? maxOutput : '',
        open: isOpen ? 'true' : '',
        zdr: zdr ? 'true' : '',
        view: catalogFilter.view === 'table' ? 'table' : '',
      }
      Object.entries(values).forEach(([key, value]) => {
        if (value !== '') next.set(key, value)
      })
      params = next
      history.replaceState(null, '', '#/models' + (next.size ? '?' + next.toString() : ''))
    }
  }

  function codeExample(model, language = 'python') {
    const endpoint =
      model.outputs[0] === 'embeddings'
        ? 'embeddings'
        : model.outputs[0] === 'image'
          ? 'images/generations'
          : model.outputs[0] === 'transcription'
            ? 'audio/transcriptions'
            : 'chat/completions'
    const payload =
      model.outputs[0] === 'embeddings'
        ? { model: model.slug, input: 'Hello, world!' }
        : model.outputs[0] === 'image'
          ? { model: model.slug, prompt: 'A sunlit mountain landscape' }
          : { model: model.slug, messages: [{ role: 'user', content: 'Hello, world!' }] }
    if (language === 'curl')
      return endpoint === 'audio/transcriptions'
        ? `curl https://api.example.com/v1/${endpoint} \\\n  -H "Authorization: Bearer $TOKENFLUX_API_KEY" \\\n  -F "model=${model.slug}" \\\n  -F "file=@audio.wav"`
        : `curl https://api.example.com/v1/${endpoint} \\\n  -H "Authorization: Bearer $TOKENFLUX_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(payload, null, 2)}'`
    if (language === 'javascript')
      return `import OpenAI${endpoint === 'audio/transcriptions' ? ', { toFile }' : ''} from 'openai'\n${endpoint === 'audio/transcriptions' ? "import fs from 'node:fs'\n" : ''}\nconst client = new OpenAI({\n  baseURL: 'https://api.example.com/v1',\n  apiKey: process.env.TOKENFLUX_API_KEY\n})\n\nconst response = await client.${endpoint === 'embeddings' ? 'embeddings.create' : endpoint === 'images/generations' ? 'images.generate' : endpoint === 'audio/transcriptions' ? 'audio.transcriptions.create' : 'chat.completions.create'}(${endpoint === 'audio/transcriptions' ? `{ model: '${model.slug}', file: fs.createReadStream('audio.wav') }` : JSON.stringify(payload, null, 2)})\nconsole.log(response)`
    return `import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://api.example.com/v1",\n    api_key=os.environ["TOKENFLUX_API_KEY"]\n)\n\nresponse = client.${endpoint === 'embeddings' ? 'embeddings.create' : endpoint === 'images/generations' ? 'images.generate' : endpoint === 'audio/transcriptions' ? 'audio.transcriptions.create' : 'chat.completions.create'}(\n    model="${model.slug}",\n    ${endpoint === 'embeddings' ? 'input="Hello, world!"' : endpoint === 'images/generations' ? 'prompt="A sunlit mountain landscape"' : endpoint === 'audio/transcriptions' ? 'file=open("audio.wav", "rb")' : 'messages=[{"role": "user", "content": "Hello, world!"}]'}\n)\nprint(response)`
  }
  function codeBlock(model) {
    return `<div class="v6-code" data-code-model="${model.id}"><div class="v6-code-head"><div class="v6-segment" aria-label="代码语言">${['python', 'javascript', 'curl'].map((language, index) => `<button type="button" data-action="code-language" data-value="${language}" aria-pressed="${index === 0}" class="${index === 0 ? 'active' : ''}">${language === 'curl' ? 'cURL' : language === 'python' ? 'Python' : 'JavaScript'}</button>`).join('')}</div>${iconButton('copy-code', '复制代码', 'copy')}</div><pre><code>${esc(codeExample(model))}</code></pre></div>`
  }
  function providerTable(model, sort = 'latency', percentile = 50) {
    const rows = model.hosts.map((name, index) => ({
      name,
      input: model.inputRate * (1 + index * 0.015),
      output: model.outputRate * (1 + index * 0.015),
      latency: parseInt(model.latency, 10) * (1 + index * 0.12) * (percentile / 50),
      throughput: Math.max(1, parseInt(model.throughput, 10) - index * 6),
      uptime: parseFloat(model.uptime) - index * 0.01,
    }))
    rows.sort((a, b) =>
      sort === 'throughput' || sort === 'uptime' ? b[sort] - a[sort] : a[sort] - b[sort],
    )
    return `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>提供商</th>${[
      ['input', '输入 /M'],
      ['output', '输出 /M'],
      ['latency', '延迟'],
      ['throughput', '吞吐量'],
      ['uptime', '可用性'],
    ]
      .map(
        ([value, label]) =>
          `<th><button data-action="provider-sort" data-value="${value}" aria-label="按${label}排序">${label} ${icon('arrow-down-up')}</button></th>`,
      )
      .join(
        '',
      )}</tr></thead><tbody>${rows.map((row) => `<tr><td>${button('provider-info', esc(row.name), 'server', `data-name="${esc(row.name)}" data-model="${model.id}"`, 'v6-btn ghost')}</td><td>${model.imagePrice || model.audioPrice ? modelPrice(model) : money(row.input)}</td><td>${model.imagePrice || model.audioPrice ? '不适用' : money(row.output)}</td><td>${(row.latency / 1000).toFixed(2)} s</td><td>${row.throughput} ${model.imagePrice ? 'img/s' : model.audioPrice ? 'sec/s' : 'tok/s'}</td><td><span class="v6-badge green">${row.uptime.toFixed(2)}%</span></td></tr>`).join('')}</tbody></table></div>`
  }
  function renderDetail(id) {
    const model = getModel(id)
    const sections = [
      ['providers', '提供商', 'server'],
      ['pricing', '价格', 'circle-dollar-sign'],
      ['performance', '性能', 'zap'],
      ['uptime', '可用性', 'activity'],
      ['api', 'API', 'code'],
      ['faq', '常见问题', 'circle-help'],
      ['explore', '相关模型', 'compass'],
    ]
    app.innerHTML = `<div class="v6-shell"><header class="v6-detail-head"><div class="v6-title"><div><div class="v6-row">${logo(model.provider)}<h1>${esc(model.provider + ': ' + model.name)}</h1></div><div class="v6-row v6-slug"><span>${esc(model.slug)}</span>${iconButton('copy', '复制模型 ID', 'copy', `data-copy="${model.slug}"`)}${pin(model)}</div></div><div class="v6-row v6-wrap">${model.outputs.includes('text') ? link('chat?model=' + model.id, '聊天试用', 'v6-btn', 'flask-conical') : link('models/' + model.id + '?section=api', '调用示例', 'v6-btn', 'code')}${link('console/keys', '获取 API Key', 'v6-btn primary', 'key-round')}</div></div><p class="v6-detail-description">${esc(model.description)}</p><div class="v6-stats">${stat('输入 / 输出模态', `<span class="v6-row">${model.inputs.map((value) => `<span title="${modalityNames[value]}">${icon(modalityIcons[value])}</span>`).join('')}${icon('arrow-right')}${icon(modalityIcons[model.outputs[0]])}</span>`)}${stat('输入 / 输出价格', model.imagePrice || model.audioPrice ? modelPrice(model) : money(model.inputRate) + ' / ' + money(model.outputRate), model.imagePrice || model.audioPrice ? '' : '每百万 tokens')}${stat('上下文长度', model.context)}${stat('发布日期', model.date)}</div></header><div class="v6-section-layout">${sectionNav(sections)}<div>${section('providers', '提供商', `此模型由 ${model.hosts.length} 个提供商提供服务。可按价格、延迟、吞吐和可用性查看路由。`, `<div class="v6-toolbar"><span class="v6-badge">演示指标</span><label class="v6-row v6-small" style="margin-left:auto">延迟分位数<select class="v6-select" id="provider-percentile"><option value="50">P50</option><option value="90">P90</option><option value="99">P99</option></select></label></div><div id="provider-table" data-sort="latency">${providerTable(model)}</div>`)}${section('pricing', '价格', '模型费率与单次调用成本。价格使用演示目录中的固定数据。', `<div class="v6-stat-band"><div><small>${model.imagePrice ? '每张图像' : model.audioPrice ? '每分钟音频' : '输入 / 百万 tokens'}</small><strong>${money(model.imagePrice || model.audioPrice || model.inputRate)}</strong></div>${!model.imagePrice && !model.audioPrice ? `<div><small>输出 / 百万 tokens</small><strong>${money(model.outputRate)}</strong></div>` : ''}</div>${!model.imagePrice && !model.audioPrice ? `<div class="v6-row v6-wrap"><label class="v6-form-label">输入 tokens<input class="v6-input" type="number" min="0" max="10000000" id="estimate-input" value="2000"></label><label class="v6-form-label">输出 tokens<input class="v6-input" type="number" min="0" max="1000000" id="estimate-output" value="800" ${model.outputs[0] === 'embeddings' ? 'disabled' : ''}></label><div><span class="v6-muted v6-small">预计单次成本</span><h3 id="estimate-cost">${money((model.inputRate * 2000 + model.outputRate * 800) / 1e6)}</h3></div></div>` : ''}`)}${section('performance', '性能', '吞吐量越高，生成越快；首 token 延迟越低，等待越短。', `<div class="v6-stat-band"><div><small>吞吐量</small><strong>${model.throughput}</strong></div><div><small>首 token 延迟</small><strong>${model.latency}</strong></div></div><div class="v6-row v6-between"><h3>吞吐量趋势</h3><select class="v6-select" data-chart-period="detail-performance" aria-label="性能统计周期"><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></div>${chart('detail-performance', 'performance')}`)}${section('uptime', '可用性', '最近 30 天的服务状态，所有指标为演示样本。', `<div class="v6-row v6-between"><h3>${model.uptime}</h3><span class="v6-badge green">服务正常</span></div><div class="v6-uptime" role="img" aria-label="最近30天每日可用性">${Array.from({ length: 30 }, (_, index) => `<i title="${index + 1} 日：${index === 12 ? '99.5%' : '100%'}" class="${index === 12 ? 'warn' : ''}"></i>`).join('')}</div><div class="v6-row v6-between v6-small v6-muted"><span>30 天前</span><span>今天</span></div>`)}${section('api', 'API 调用', '使用 OpenAI 兼容 SDK。以下 Base URL 为示例地址，接入时替换为你的实际服务地址。', codeBlock(model))}${section('faq', '常见问题', '', `<details class="v6-faq"><summary>这个模型支持哪些输入？</summary><p>支持${model.inputs.map((value) => modalityNames[value]).join('、')}输入，输出类型为${modalityNames[model.outputs[0]]}。</p></details><details class="v6-faq"><summary>如何选择提供商？</summary><p>可在提供商列表中查看性能指标。实际请求的路由取决于服务端配置、可用性和账户策略。</p></details><details class="v6-faq"><summary>免费模型有什么限制？</summary><p>免费变体通常有请求频率和每日用量限制，适合试验和评估。具体限制以服务提供商为准。</p></details>`)}${section(
      'explore',
      '相关模型',
      '',
      `<div class="v6-models">${
        models
          .filter((item) => item.id !== model.id && item.outputs[0] === model.outputs[0])
          .slice(0, 3)
          .map(modelCard)
          .join('') ||
        empty('暂无同类模型', '浏览目录中的其他模型。', link('models', '浏览全部模型', 'v6-btn'))
      }</div>`,
    )}</div></div></div>`
  }

  function renderDiscover() {
    const leaders = [...models]
      .filter((model) => model.outputs.includes('text') && model.variant !== 'free')
      .sort((a, b) => b.usage - a.usage)
    app.innerHTML = `<div class="v6-shell"><div class="v6-title"><div><h1>发现模型</h1><p>从热门用量、任务需求和运行表现找到合适的起点。</p></div>${link('models', `浏览全部 ${models.length} 个模型`, 'v6-btn', 'arrow-right')}</div><section class="v6-discover-lead"><div><div class="v6-eyebrow">本周热门</div><h2>开发者正在使用<br>哪些模型？</h2><p class="v6-muted">探索通用对话、编程和推理模型，查看上下文、费率与提供商。</p><span class="v6-badge">演示数据 · 最近 7 天</span></div><div>${rankedRows(leaders.slice(0, 5))}</div></section><div class="v6-grid-3">${[
      ['最受欢迎', 'deepseek-v3', 'chart-no-axes-combined', '9.1B tokens / 周'],
      ['快速响应', 'claude-haiku', 'zap', '310ms 首 token 延迟'],
      ['复杂推理', 'claude-3.7', 'brain', '推理与工具调用'],
      ['长上下文', 'gemini-2.5', 'scan-text', '1M 上下文'],
      ['免费尝试', 'qwen-3-free', 'gift', '$0 输入 / 输出'],
      ['图像创作', 'flux-1.1-pro', 'image', '$0.04 / 张图像'],
    ]
      .map(
        ([label, id, symbol, metric]) =>
          `<a class="v6-item" href="#/models/${id}"><span class="v6-row v6-muted v6-small">${icon(symbol)}${label}</span><div class="v6-row">${logo(getModel(id).provider)}<h3>${esc(getModel(id).name)}</h3></div><p>${metric}</p></a>`,
      )
      .join(
        '',
      )}</div><section class="v6-home-band" style="width:100%;margin-top:40px"><div class="v6-title"><h2>按任务探索</h2>${link('chat', '在聊天中试用', 'v6-link', 'arrow-right')}</div><div class="v6-grid-3">${[
      ['code', '编程与 Agent', '代码生成、工具调用和结构化输出'],
      ['reasoning', '深度推理', '复杂问题、数学分析和多步骤任务'],
      ['vision', '多模态理解', '理解图像、文档与长上下文'],
    ]
      .map(
        ([category, title, description]) =>
          `<a class="v6-item" href="#/models?category=${category}"><h3>${title}</h3><p>${description}</p><span class="v6-link">探索模型 →</span></a>`,
      )
      .join('')}</div></section></div>`
  }

  function renderRankings() {
    const period = params.get('period') || 'week'
    const metric = params.get('metric') || 'usage'
    const selectedOutput = params.get('output') || 'text'
    const list = models
      .filter((model) => model.outputs.includes(selectedOutput))
      .sort((a, b) =>
        metric === 'speed'
          ? parseInt(b.throughput, 10) - parseInt(a.throughput, 10)
          : b.usage - a.usage,
      )
    const multiplier = period === 'day' ? 0.16 : period === 'month' ? 4.4 : 1
    const sections = [
      ['top-models', '热门模型', 'chart-no-axes-combined'],
      ['leaderboard', '模型榜单', 'trophy'],
      ['market-share', '作者份额', 'chart-pie'],
      ['fastest', '最快模型', 'zap'],
    ]
    app.innerHTML = `<div class="v6-shell">${tabs(
      ['text', 'image', 'transcription', 'embeddings'].map((value) => [
        value,
        modalityNames[value],
        modalityIcons[value],
      ]),
      selectedOutput,
      'ranking-output',
      '排行榜模态',
    )}<div class="v6-section-layout">${sectionNav(sections)}<div><div class="v6-title"><div><h1>AI 模型排行榜</h1><p>按模型用量观察趋势，发现热门模型与提供商。</p><span class="v6-badge">本地演示数据 · 非实时榜单</span></div></div>${section(
      'top-models',
      '热门模型',
      '不同模型的用量变化',
      `<div class="v6-toolbar"><select id="ranking-period" class="v6-select" aria-label="排行榜周期">${[
        ['day', '最近 24 小时'],
        ['week', '最近 7 天'],
        ['month', '最近 30 天'],
      ]
        .map(
          ([value, name]) =>
            `<option value="${value}" ${period === value ? 'selected' : ''}>${name}</option>`,
        )
        .join(
          '',
        )}</select><div class="v6-segment" style="margin-left:auto">${button('chart-scale', '线性', '', 'data-value="linear" aria-pressed="true"', 'active')}${button('chart-scale', '对数', '', 'data-value="log" aria-pressed="false"', '')}</div></div>${chart('rankings-usage')}<div class="v6-legend">${list
        .slice(0, 5)
        .map(
          (model, index) =>
            `<span><i style="--series-color:var(${['--accent', '--info', '--warning', '--muted', '--accent-soft'][index]})"></i>${esc(model.name)}</span>`,
        )
        .join('')}</div>`,
    )}${section('leaderboard', '模型榜单', '', `<div class="v6-toolbar"><label class="v6-row v6-small">排序<select class="v6-select" id="ranking-metric"><option value="usage" ${metric === 'usage' ? 'selected' : ''}>Token 用量</option><option value="speed" ${metric === 'speed' ? 'selected' : ''}>吞吐量</option></select></label></div><div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>排名</th><th>模型</th><th>${metric === 'speed' ? '吞吐量' : 'Tokens'}</th><th>变化</th></tr></thead><tbody>${list.map((model, index) => `<tr><td>${index + 1}.</td><td>${link('models/' + model.id, `<span class="v6-row">${logo(model.provider)}<span>${esc(model.name)}<div class="v6-muted">by ${esc(model.provider)}</div></span></span>`, '')}</td><td>${metric === 'speed' ? model.throughput : (model.usage * multiplier).toFixed(2) + 'B'}</td><td style="color:var(--accent-soft)">+${(8 + index * 3) * (period === 'month' ? 2 : 1)}%</td></tr>`).join('')}</tbody></table></div>`)}${section(
      'market-share',
      '模型作者份额',
      '当前模态下各作者的 Token 用量占比。',
      `<div class="v6-stack">${[...new Set(list.map((model) => model.provider))]
        .map((provider) => {
          const share =
            (list
              .filter((model) => model.provider === provider)
              .reduce((sum, model) => sum + model.usage, 0) /
              list.reduce((sum, model) => sum + model.usage, 0)) *
            100
          return `<div><div class="v6-row v6-between"><span>${esc(provider)}</span><span>${share.toFixed(1)}%</span></div><div style="height:8px;background:var(--border);margin-top:8px;border-radius:2px"><div style="width:${share}%;height:100%;background:var(--accent);border-radius:2px"></div></div></div>`
        })
        .join('')}</div>`,
    )}${section('fastest', '最快模型', '按当前模态的生成吞吐量排序。', rankedRows([...list].sort((a, b) => parseInt(b.throughput, 10) - parseInt(a.throughput, 10)).slice(0, 5), 'speed'))}</div></div></div>`
  }

  function renderProviders() {
    app.innerHTML = `<div class="v6-shell"><div class="v6-title"><div><h1>提供商</h1><p>查看模型覆盖范围、数据保留策略和可用服务。</p></div><span class="v6-badge">演示目录</span></div><div class="v6-toolbar">${search('provider-search', '搜索提供商…')}<label class="v6-check"><input id="provider-zdr" type="checkbox">零数据保留</label></div><div id="provider-results" style="margin-top:24px"></div></div>`
    filterProviders()
  }
  function filterProviders() {
    const query = document.getElementById('provider-search').value.toLowerCase()
    const list = hostNames.filter(
      (name) =>
        name.toLowerCase().includes(query) &&
        (!document.getElementById('provider-zdr').checked || name !== 'DeepSeek'),
    )
    document.getElementById('provider-results').innerHTML = list.length
      ? `<p class="v6-muted v6-small">${list.length} 个提供商</p><div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>提供商</th><th>训练用途</th><th>数据保留</th><th>模型数量</th><th>模型</th></tr></thead><tbody>${list
          .map((name) => {
            const available = models.filter((model) => model.hosts.includes(name))
            return `<tr><td>${button('provider-info', esc(name), 'server', `data-name="${esc(name)}"`, 'v6-btn ghost')}</td><td>不用于训练</td><td>${name === 'DeepSeek' ? '有限保留' : '零数据保留'}</td><td>${available.length}</td><td>${link('models?provider=' + encodeURIComponent(name), '浏览模型 →', 'v6-link')}</td></tr>`
          })
          .join('')}</tbody></table></div>`
      : empty('没有找到提供商', '尝试其他名称，或关闭数据保留筛选。')
  }

  function renderPricing() {
    const features = [
      ['模型访问', '免费变体', '全部模型', '全部模型', '全部模型'],
      ['聊天与 API', '支持', '支持', '支持', '支持'],
      ['活动记录与导出', '支持', '支持', '支持', '支持'],
      ['智能路由与故障回退', '基础路由', '支持', '支持', '支持'],
      ['额度与预算控制', '基础额度', '按 Key 设置', '团队预算', '定制'],
      ['数据保留策略', '依提供商', '可选零保留', '零数据保留', '定制策略'],
      ['团队工作区', '个人', '个人与小团队', '团队', '组织级'],
      ['支持', '文档', '标准支持', '优先支持', '专属支持'],
    ]
    app.innerHTML = `<div class="v6-shell v6-pricing"><div class="v6-title"><div><div class="v6-eyebrow">aitokensflux Pricing</div><h1>价格</h1><p>从个人实验到团队应用，按实际使用量付费。</p></div><span class="v6-badge">方案演示 · 非实际报价</span></div><div class="v6-table-wrap"><table class="v6-table"><thead><tr><th></th>${[
      ['Free', '免费模型', 'models?variant=free', '免费尝试'],
      ['Standard', '按量付费', 'console/credits', '开始使用'],
      ['Business', '团队按量付费', 'console/settings', '配置工作区'],
      ['Enterprise', '定制方案', 'docs?section=business', '查看企业接入'],
    ]
      .map(
        ([name, note, path, label]) =>
          `<th>${name}<small>${note}</small>${link(path, label, 'v6-btn' + (name === 'Standard' ? ' primary' : ''))}</th>`,
      )
      .join(
        '',
      )}</tr></thead><tbody>${features.map((row) => `<tr>${row.map((cell, index) => `<td>${index === 0 ? `<strong>${cell}</strong>` : cell === '支持' ? `<span class="v6-row" style="color:var(--accent-soft)">${icon('check')}支持</span>` : cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="v6-section" style="margin-top:44px"><h2>模型费率</h2><p>输入和输出分别计费；图像、语音模型按对应单位计费。</p>${link('models', '浏览模型价格', 'v6-btn', 'arrow-right')}</div>${section(
      'pricing-faq',
      '常见问题',
      '',
      [
        [
          '是否需要订阅才能使用？',
          '标准方案以余额按量结算，可以根据需求充值。此 Demo 中的充值只更新本地演示余额。',
        ],
        [
          '模型如何计费？',
          '文本模型通常按输入与输出 Token 分别计费；图像或音频模型使用张数、时长等计费单位。每个模型的详情页会显示对应费率。',
        ],
        [
          '余额不足会发生什么？',
          '正式服务会按账户余额和 Key 限额决定请求是否可执行。建议在工作台关注用量并设置预算。',
        ],
        [
          '这里的方案是正式报价吗？',
          '不是。这是展示产品结构的本地 Demo，方案与数据仅用于设计演示。',
        ],
      ]
        .map(
          ([question, answer]) =>
            `<details class="v6-faq"><summary>${question}</summary><p>${answer}</p></details>`,
        )
        .join(''),
    )}</div>`
  }

  function renderDocs() {
    const items = [
      ['quickstart', '快速开始', 'book-open'],
      ['authentication', '身份验证', 'key-round'],
      ['request', '首个请求', 'code'],
      ['model-selection', '模型选择', 'layers'],
      ['routing', '路由与回退', 'route'],
      ['errors', '错误处理', 'circle-help'],
      ['business', '企业接入', 'building-2'],
    ]
    app.innerHTML = `<div class="v6-shell v6-docs-layout">${sectionNav(items)}<article><div class="v6-eyebrow">Documentation</div><h1 id="quickstart">快速开始</h1><p>使用统一的 OpenAI 兼容接口访问多个模型。在现有 SDK 中配置 Base URL、API Key 与模型标识即可开始。</p>${section('authentication', '创建 API Key', '为每个应用使用单独的密钥，设置用量上限，并避免在客户端暴露密钥。', link('console/keys', '管理 API Keys', 'v6-btn', 'key-round'))}${section('request', '发出首个请求', '下方是请求结构示例。api.example.com 为占位地址，请替换成实际网关地址。', codeBlock(models[0]))}${section('model-selection', '选择模型', '模型标识采用 provider/model-name 格式。不同模型支持的模态、上下文与参数不同。', `<p>从目录中选择模型后，可在详情页复制 ID。发送请求前，确认输入类型与模型支持的模态一致。</p>${link('models', '浏览模型目录', 'v6-link', 'arrow-right')}`)}${section('routing', '路由与故障回退', '同一模型可由多个提供商承载。网关按可用性、配置和账户策略选择服务。', `<p>连接错误和可重试的上游错误可触发故障回退。建议在应用侧设置有限的重试次数，并使用指数退避处理临时限流。</p>${link('providers', '查看提供商', 'v6-link', 'arrow-right')}`)}${section(
      'errors',
      '处理错误',
      '',
      `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>状态码</th><th>含义</th><th>处理方式</th></tr></thead><tbody>${[
        ['400', '请求参数错误', '检查模型、模态和参数'],
        ['401', '身份验证失败', '检查 API Key'],
        ['402', '余额不足', '检查余额与额度'],
        ['429', '请求限流', '退避后重试'],
        ['503', '上游暂时不可用', '稍后重试或选择其他模型'],
      ]
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`,
    )}${section('business', '企业接入', '从应用密钥、数据策略与预算开始配置工作区。', `<p>在接入前确认模型覆盖、数据保留要求和流量规模。此 Demo 提供工作区名称、零数据保留与自动回退策略的本地配置。</p>${link('console/settings', '配置工作区', 'v6-btn', 'settings')}`)}</article><aside class="v6-docs-toc"><div class="v6-eyebrow">本页内容</div>${sectionNav(items)}</aside></div>`
  }

  function renderChat() {
    const requestedModel = getModel(params.get('model'))
    if (requestedModel?.outputs.includes('text')) {
      state.chatModels = [requestedModel.id]
      roomId = ''
      state.activeRoom = ''
      params.delete('model')
      history.replaceState(null, '', '#/chat')
      save()
    }
    const room = state.rooms.find((item) => item.id === roomId)
    if (room) state.chatModels = room.models
    app.innerHTML = `<div class="v6-chat"><aside class="v6-chat-sidebar" id="chat-sidebar"><div class="v6-row v6-between"><h3>聊天</h3>${iconButton('chat-sidebar-close', '关闭会话列表', 'panel-left-close')}</div>${button('new-chat', '新建会话', 'square-pen')}${search('room-search', '搜索会话…')}<div class="v6-chat-rooms" id="chat-rooms"></div><span class="v6-badge">本地演示会话</span></aside><div class="v6-chat-workspace"><div class="v6-chat-head">${button('chat-sidebar', '', 'panel-left', 'aria-label="会话列表"', 'v6-btn v6-icon-btn v6-mobile-menu')}${button('choose-model', '添加模型', 'plus')}${state.chatModels.map((id) => `<span class="v6-badge green">${esc(getModel(id)?.name || id)}${iconButton('remove-chat-model', '移除此模型', 'x', `data-id="${id}"`)}</span>`).join('')}<span style="margin-left:auto">${iconButton('chat-settings', '聊天设置', 'settings')}</span></div><div class="v6-chat-body" id="chat-body"></div><div class="v6-compose"><form id="chat-form"><textarea id="chat-prompt" aria-label="消息" placeholder="输入消息…" rows="2" maxlength="12000">${esc(draftPrompt)}</textarea><div class="v6-row v6-between"><span class="v6-badge">${state.chatModels.length} 个模型</span>${chatPending ? button('stop-chat', '', 'square', 'aria-label="停止生成"', 'v6-btn primary v6-icon-btn') : '<button class="v6-btn primary v6-icon-btn" type="submit" aria-label="发送消息" title="发送消息">' + icon('arrow-up') + '</button>'}</div></form><div class="v6-compose-note">本地演示回复，不调用真实模型，也不产生费用。</div></div></div></div>`
    renderChatRooms()
    renderChatBody()
  }
  function renderChatRooms() {
    const query = document.getElementById('room-search')?.value.toLowerCase() || ''
    const matches = state.rooms.filter((room) => room.title.toLowerCase().includes(query))
    document.getElementById('chat-rooms').innerHTML = matches.length
      ? matches
          .map(
            (room) =>
              `<button type="button" class="v6-chat-room ${room.id === roomId ? 'active' : ''}" data-action="open-room" data-id="${room.id}" title="${esc(room.title)}">${esc(room.title)}</button>`,
          )
          .join('')
      : '<p class="v6-small v6-muted" style="text-align:center;margin-top:50px">暂无匹配会话</p>'
  }
  function renderChatBody() {
    const body = document.getElementById('chat-body')
    if (!body) return
    const room = state.rooms.find((item) => item.id === roomId)
    body.innerHTML = room?.messages.length
      ? room.messages
          .map(
            (message) =>
              `<div class="v6-message user"><strong class="v6-small">你</strong><p>${esc(message.prompt)}</p></div><div class="v6-message v6-responses" style="--response-columns:${message.responses.length || 1}">${message.responses.map((response) => `<article class="v6-response"><div class="v6-row">${logo(getModel(response.model)?.provider || 'Model')}<strong class="v6-small">${esc(getModel(response.model)?.name || response.model)}</strong></div><p>${esc(response.text)}</p><div class="v6-row">${iconButton('copy', '复制回复', 'copy', `data-copy="${esc(response.text)}"`)}<span class="v6-muted v6-small">演示回复</span></div></article>`).join('')}${message.pending ? '<p class="v6-muted" role="status">正在准备演示回复…</p>' : ''}${message.stopped ? '<p class="v6-muted v6-small">已停止生成</p>' : ''}</div>`,
          )
          .join('')
      : `<div class="v6-chat-welcome"><h2>今天想探索什么？</h2><div class="v6-grid-2">${[
          ['旗舰模型', 'claude-3.7,gpt-4.1'],
          ['编程助手', 'claude-3.7,deepseek-v3'],
          ['长文档理解', 'gemini-2.5,gpt-4.1'],
          ['推理模型', 'o3-mini,qwen-3'],
        ]
          .map(
            ([title, ids]) =>
              `<button class="v6-item" data-action="chat-preset" data-value="${ids}"><h3>${title}</h3><div class="v6-row">${ids
                .split(',')
                .map((id) => logo(getModel(id).provider))
                .join('')}</div></button>`,
          )
          .join(
            '',
          )}</div><div class="v6-row v6-wrap" style="margin-top:24px">${['解释模型路由', '写一个 Python 快速排序', '制定一份学习计划'].map((prompt) => button('prompt-example', esc(prompt), '', `data-value="${esc(prompt)}"`, 'v6-btn ghost')).join('')}</div></div>`
    body.scrollTop = body.scrollHeight
  }
  function stopChat() {
    clearTimeout(chatTimer)
    chatGeneration++
    chatPending = false
    state.rooms.forEach((room) =>
      room.messages.forEach((message) => {
        if (message.pending) {
          message.pending = false
          message.stopped = true
        }
      }),
    )
    save()
  }
  function sendChat() {
    const prompt = document.getElementById('chat-prompt').value.trim()
    if (!prompt || chatPending) return
    let room = state.rooms.find((item) => item.id === roomId)
    if (!room) {
      room = {
        id: crypto.randomUUID(),
        title: prompt.slice(0, 40),
        models: [...state.chatModels],
        messages: [],
      }
      state.rooms.unshift(room)
      roomId = room.id
    }
    state.activeRoom = room.id
    room.models = [...state.chatModels]
    const message = { prompt, responses: [], pending: true }
    room.messages.push(message)
    draftPrompt = ''
    chatPending = true
    const generation = ++chatGeneration
    const chosenModels = [...state.chatModels]
    save()
    params.delete('model')
    history.replaceState(null, '', '#/chat')
    renderChat()
    chatTimer = setTimeout(() => {
      if (generation !== chatGeneration) return
      message.pending = false
      message.responses = chosenModels.map((id) => {
        const model = getModel(id)
        let text = '这是一条本地预设演示回复。你的消息已保存在当前会话中。\n\n'
        if (/路由/.test(prompt))
          text +=
            '模型路由会在能够提供同一模型的服务商之间分发请求，通常结合可用性、延迟和价格进行选择；当某条路由暂时不可用时，可以按策略切换到其他提供商。'
        else if (/排序/.test(prompt))
          text +=
            '快速排序先选择一个基准值，把其余元素划分为小于和大于基准的两组，再递归排序并合并。平均时间复杂度为 O(n log n)。'
        else if (/计划/.test(prompt))
          text +=
            '1. 明确学习目标与当前基础。\n2. 将内容拆分为每周的小任务。\n3. 安排实践练习和定期复盘。\n4. 根据结果调整下一阶段目标。'
        else
          text += `当前选择的是 ${model.name}，支持 ${model.context} 上下文。可以继续发送消息、切换模型，或在模型详情中查看调用示例。`
        return { model: id, text }
      })
      chatPending = false
      save()
      if (route === 'chat') renderChat()
    }, 600)
  }

  function accountNav() {
    const item = (path, label, symbol, beta = false) =>
      `<a class="v6-side-link${path === route ? ' active' : ''}" href="#/${path}">${icon(symbol)}<span>${label}</span>${beta ? '<em class="v6-beta">Beta</em>' : ''}</a>`
    return `<aside class="v6-sidebar" aria-label="工作台导航"><div class="v6-side-workspace"><button class="v6-workspace-switch" type="button"><span class="v6-ws-avatar">${esc(state.settings.name.slice(0, 1))}</span><span>${esc(state.settings.name)}</span>${icon('chevrons-up-down')}</button></div><div class="v6-side-group">${[
      ['console', '概览', 'layout-grid'],
      ['console/keys', 'API Keys', 'key-round'],
      ['console/files', 'Files', 'file', true],
      ['console/guardrails', '护栏', 'shield'],
      ['console/byok', 'BYOK', 'lock'],
      ['console/routing', '路由', 'route'],
      ['console/presets', '预设', 'layers'],
      ['console/tools', '工具', 'wrench'],
      ['console/observability', '可观测性', 'activity'],
      ['console/settings', '设置', 'settings'],
    ]
      .map(([p, l, s, b]) => item(p, l, s, b))
      .join('')}</div><div class="v6-side-group"><div class="v6-side-label">账户</div>${[
      ['console/profile', '个人资料', 'user'],
      ['console/activity', '活动', 'activity'],
      ['console/logs', '日志', 'list'],
      ['console/credits', '余额', 'wallet'],
      ['console/notifications', '通知', 'bell'],
      ['console/privacy', '隐私', 'eye-off'],
      ['console/preferences', '偏好', 'sliders-horizontal'],
    ]
      .map(([p, l, s, b]) => item(p, l, s, b))
      .join('')}</div></aside>`
  }
  function renderAccount() {
    const page =
      route === 'console/keys'
        ? pageKeys()
        : route === 'console/credits'
          ? pageCredits()
          : route === 'console/settings'
            ? pageSettings()
            : route === 'console/activity'
              ? pageActivity()
              : route === 'console/files'
                ? pageFiles()
                : route === 'console/guardrails'
                  ? pageGuardrails()
                  : route === 'console/byok'
                    ? pageByok()
                    : route === 'console/routing'
                      ? pageRouting()
                      : route === 'console/presets'
                        ? pagePresets()
                        : route === 'console/tools'
                          ? pageTools()
                          : route === 'console/observability'
                            ? pageObservability()
                            : route === 'console/profile'
                              ? pageProfile()
                              : route === 'console/logs'
                                ? pageLogs()
                                : route === 'console/notifications'
                                  ? pageNotifications()
                                  : route === 'console/privacy'
                                    ? pagePrivacy()
                                    : route === 'console/preferences'
                                      ? pagePreferences()
                                      : pageOverview()
    app.innerHTML = `<div class="v6-console">${accountNav()}<main class="v6-console-main">${page}</main></div>`
    if (route === 'console/keys') renderKeys()
    if (route === 'console/activity') filterActivity()
  }

  const head = (title, desc, action = '') =>
    `<div class="v6-title"><div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${action}</div>`
  const card = (title, desc, body, foot = '') =>
    `<section class="v6-panel"><div class="v6-panel-head"><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ''}</div><div class="v6-panel-body">${body}</div>${foot ? `<div class="v6-panel-foot">${foot}</div>` : ''}</section>`
  const field = (label, hint, input) =>
    `<div class="v6-field"><div class="v6-field-text"><span class="v6-field-label">${label}</span>${hint ? `<small>${hint}</small>` : ''}</div>${input}</div>`
  const toggle = (name, on, disabled = false) =>
    `<label class="v6-switch"><input type="checkbox" name="${name}" data-setting="${name}" ${on ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span></span></label>`
  const wsCard = (path, title, desc, symbol) =>
    `<a class="v6-ws-card" href="#/${path}">${icon(symbol)}<div><h3>${title}</h3><p>${desc}</p></div>${icon('arrow-right')}</a>`

  function pageOverview() {
    return `${head('概览', esc(state.settings.name) + ' 工作区的用量与配置。', `<span class="v6-badge">演示数据</span>`)}<div class="v6-metric-row">${[
      ['本周消费', '$0.01', 'requests 101'],
      ['Token 用量', '3.6M', 'tok'],
      ['可用余额', money(state.balance), ''],
    ]
      .map(
        ([label, value, note]) =>
          `<div class="v6-metric"><span class="v6-muted v6-small">${label}</span><strong>${value}</strong>${note ? `<div class="v6-muted v6-small">${note}</div>` : ''}</div>`,
      )
      .join(
        '',
      )}</div><div class="v6-row v6-between" style="margin:34px 0 14px"><h2>本周用量</h2>${link('console/activity', '查看活动', 'v6-link', 'arrow-right')}</div><div class="v6-chart-sm">${chart('account-usage')}</div><div class="v6-ws-grid">${[
      ['console/keys', 'API Keys', '创建和管理此工作区的 API 密钥。', 'key-round'],
      ['console/guardrails', '护栏', '设置预算、模型与提供商限制、隐私和内容策略。', 'shield'],
      ['console/byok', 'BYOK', '在平台上使用你自己的提供商密钥。', 'lock'],
      ['console/routing', '路由', '为模型和提供商设置路由策略。', 'route'],
      ['console/presets', '预设', '保存系统提示词和请求参数的快捷方式。', 'layers'],
      ['console/tools', '工具', '配置插件并控制请求可使用的服务器工具。', 'wrench'],
      [
        'console/observability',
        '可观测性',
        '连接 Langfuse、Datadog 等监控工具跟踪用量。',
        'activity',
      ],
      ['console/settings', '设置', '编辑工作区名称和描述。', 'settings'],
    ]
      .map(([p, t, d, s]) => wsCard(p, t, d, s))
      .join('')}</div>`
  }
  function pageKeys() {
    return `${head('API Keys', '创建和管理你的 API 密钥。', button('create-key', '新建密钥', 'plus', '', 'v6-btn primary'))}${search('key-search', '搜索密钥…')}<div id="key-results" style="margin-top:20px"></div>`
  }
  function pageCredits() {
    return `${head('余额', '个人账户余额与充值。', `<button class="v6-btn ghost" data-action="refresh-credits">${icon('refresh-cw')}刷新</button>`)}${card('可用余额', '', `<div class="v6-balance">${money(state.balance)}</div><p class="v6-muted v6-small">按需付费余额</p>`, `${button('add-credits', '充值', 'plus', '', 'v6-btn primary')}${link('console/activity', '查看用量', 'v6-btn')}${link('pricing', '兑换优惠码', 'v6-link')}`)}${card('自动充值', '余额低于阈值时自动购买额度。', `<div class="v6-row v6-between"><span>当前未启用</span>${button('enable-autotopup', '启用', '', '', 'v6-btn')}</div>`)}${card('交易记录', '', `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>日期</th><th>类型</th><th>金额</th><th>状态</th></tr></thead><tbody>${state.transactions.map((item) => `<tr><td>${esc(item.date)}</td><td>${esc(item.type)}</td><td>${money(item.amount)}</td><td><span class="v6-badge green">${esc(item.status)}</span></td></tr>`).join('')}</tbody></table></div>`)}`
  }
  function pageSettings() {
    return `${head('设置', '管理工作区标识、支出控制和集成。')}${card('常规', '管理工作区名称。', field('名称', '在工作区成员间显示。', `<input class="v6-input" name="workspace" value="${esc(state.settings.name)}" maxlength="60" form="settings-form">`), `<button class="v6-btn primary" type="submit" form="settings-form">保存</button>`)}<form id="settings-form"></form>${card('预算与数据', '管理支出上限和数据共享。', `${field('工作区预算', '设置每日、每周或每月支出上限。', `<span class="v6-muted v6-small">未设置上限</span>`)}${field('自动故障回退', '当前提供商不可用时切换到其他路由。', toggle('fallback', state.settings.fallback))}`, `<button class="v6-btn" type="button">添加预算</button>`)}${card('隐私', '', field('零数据保留', '优先使用不保留请求数据的提供商。', toggle('zdr', state.settings.zdr)))}${card('危险操作', '', `<div class="v6-row v6-between"><div><strong>删除工作区</strong><p class="v6-muted v6-small">无法删除唯一的工作区。</p></div><button class="v6-btn" disabled>删除</button></div>`)}`
  }
  function pageActivity() {
    return `${head('活动', '你在平台上各模型的用量。')}${tabs(
      [
        ['overview', '概览'],
        ['trends', '趋势'],
        ['explore', '探索'],
        ['guardrails', '护栏'],
      ],
      'overview',
      'activity-tab',
      '活动分区',
    )}<div class="v6-metric-row" style="margin-top:18px">${[
      ['总消费', '$0.01'],
      ['请求数', '4K'],
      ['Token 用量', '288M'],
      ['缓存命中率', '89.7%'],
      ['混合 $/1M', '$0.00'],
    ]
      .map(
        ([l, v]) =>
          `<div class="v6-metric"><span class="v6-muted v6-small">${l}</span><strong>${v}</strong></div>`,
      )
      .join(
        '',
      )}</div><div class="v6-row v6-between" style="margin:28px 0 14px"><h2>Token 用量</h2><select class="v6-select" data-chart-period="account-usage"><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></div>${chart('account-usage')}<div class="v6-row v6-between" style="margin:28px 0 14px"><h2>请求记录</h2>${button('export-activity', '导出 CSV', 'download')}</div><div class="v6-toolbar">${search('activity-search', '搜索模型或请求 ID…')}<select class="v6-select" id="activity-status"><option value="all">全部状态</option><option value="success">成功</option><option value="error">失败</option></select><select class="v6-select" id="activity-period"><option value="7">最近 7 天</option><option value="1">最近 24 小时</option></select></div><div id="activity-results" style="margin-top:16px"></div>`
  }
  function pageFiles() {
    return `${head('Files', '上传文件以在支持的模型中使用。', button('upload-file', '上传文件', 'upload', '', 'v6-btn primary'))}${card('文件', '', `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>名称</th><th>大小</th><th>用途</th><th>上传时间</th></tr></thead><tbody><tr><td colspan="4">${empty('还没有文件', '上传文件后可在支持的模型请求中引用。')}</td></tr></tbody></table></div>`)}`
  }
  function pageGuardrails() {
    return `${head('护栏', '设置预算、模型与提供商限制、隐私和内容策略。')}${card('支出上限', '', `<p class="v6-muted">未配置支出上限。</p>`, button('add-guardrail', '添加护栏', 'plus'))}${card('模型限制', '限制此工作区可调用的模型。', `<p class="v6-muted">允许所有模型。</p>`)}${card('提供商限制', '', `<p class="v6-muted">允许所有提供商。</p>`)}`
  }
  function pageByok() {
    return `${head('BYOK', '使用你自己的提供商 API 密钥。')}${card('提供商密钥', '添加提供商密钥后，对应请求将走你的账户计费。', `<p class="v6-muted">尚未配置任何提供商密钥。</p>`, button('add-byok', '添加提供商密钥', 'plus'))}`
  }
  function pageRouting() {
    return `${head('路由', '为模型和提供商设置路由策略。')}${card('提供商排序', '拖动调整提供商优先级，请求将按顺序尝试。', `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>提供商</th><th>优先级</th><th>状态</th></tr></thead><tbody>${['OpenAI', 'Anthropic', 'Google', 'DeepSeek'].map((p, i) => `<tr><td>${p}</td><td>${i + 1}</td><td><span class="v6-badge green">启用</span></td></tr>`).join('')}</tbody></table></div>`)}${field('允许回退', '主要提供商不可用时尝试其他提供商。', toggle('fallback', state.settings.fallback))}`
  }
  function pagePresets() {
    return `${head('预设', '保存系统提示词和请求参数的快捷方式。', button('create-preset', '新建预设', 'plus', '', 'v6-btn primary'))}${card('预设', '', `<p class="v6-muted">还没有预设。预设可快速应用一组系统提示词和参数。</p>`)}`
  }
  function pageTools() {
    return `${head('工具', '配置插件并控制请求可使用的服务器工具。')}${card('插件', '', `<p class="v6-muted">未启用任何插件。</p>`, button('add-tool', '添加插件', 'plus'))}`
  }
  function pageObservability() {
    return `${head('可观测性', '连接监控工具跟踪用量。')}${card('集成', '', `<p class="v6-muted">连接 Langfuse、Datadog 等以跟踪请求和用量。</p>`, button('add-observability', '添加集成', 'plus'))}`
  }
  function pageProfile() {
    return `${head('个人资料', '管理你的账户信息。')}${card('账户', '', `${field('邮箱', '', `<input class="v6-input" value="demo@tokenflux.dev" disabled>`)}${field('显示名称', '', `<input class="v6-input" name="display-name" value="${esc(state.settings.name)}">`)}`, `<button class="v6-btn primary">保存</button>`)}`
  }
  function pageLogs() {
    return `${head('日志', '最近的 API 请求日志。')}${card('请求日志', '', activityTable(activity.slice(0, 8)))}`
  }
  function pageNotifications() {
    return `${head('通知', '管理账户通知。')}${card('通知偏好', '', `${field('用量告警', '余额不足或超限时通知。', toggle('notif-usage', true))}${field('产品更新', '接收新模型和功能公告。', toggle('notif-product', true))}`)}`
  }
  function pagePrivacy() {
    return `${head('隐私', '控制数据和隐私设置。')}${card('数据策略', '', `${field('零数据保留', '优先使用不保留请求数据的提供商。', toggle('zdr', state.settings.zdr))}${field('允许提示词训练', '允许提供商使用你的提示词改进模型。', toggle('train', false))}`)}`
  }
  function pagePreferences() {
    return `${head('偏好', '界面和默认行为设置。')}${card(
      '显示',
      '',
      `${field('主题', '', `<select class="v6-select"><option>跟随系统</option><option>浅色</option><option>深色</option></select>`)}${field(
        '默认模型',
        '',
        `<select class="v6-select">${models
          .slice(0, 5)
          .map((m) => `<option>${esc(m.name)}</option>`)
          .join('')}</select>`,
      )}`,
    )}`
  }
  function renderKeys() {
    const query = document.getElementById('key-search').value.toLowerCase()
    const list = state.keys.filter((key) => key.name.toLowerCase().includes(query))
    document.getElementById('key-results').innerHTML = list.length
      ? `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th></th><th>密钥</th><th>护栏</th><th>过期时间</th><th>最近使用</th><th>用量</th><th>限额</th><th></th></tr></thead><tbody>${list
          .map((key) => {
            const pct = Math.min(100, Math.round((key.used / key.limit) * 100))
            return `<tr><td><input type="checkbox" aria-label="选择 ${esc(key.name)}"></td><td><strong>${esc(key.name)}</strong><div class="v6-muted mono">${esc(key.prefix)}</div></td><td><span class="v6-muted">无护栏</span></td><td>${esc(key.expiry)}</td><td>${key.lastUsed || '从未'}</td><td>${money(key.used)}</td><td><div class="v6-limit"><span class="v6-small">${pct}% · ${money(key.limit)}</span><div class="v6-limit-bar"><i style="width:${pct}%"></i></div></div></td><td><button class="v6-btn ghost" data-action="toggle-key" data-id="${key.id}" role="switch" aria-checked="${key.enabled}"><span class="v6-badge ${key.enabled ? 'green' : ''}">${key.enabled ? '已启用' : '已停用'}</span></button>${iconButton('edit-key', '编辑密钥', 'pencil', `data-id="${key.id}"`)}${iconButton('delete-key', '删除密钥', 'trash-2', `data-id="${key.id}"`)}</td></tr>`
          })
          .join(
            '',
          )}</tbody></table><div class="v6-muted v6-small" style="margin-top:10px">${list.length} 个密钥</div></div>`
      : empty(
          '没有找到密钥',
          '创建一个密钥以连接你的应用。',
          button('create-key', '创建密钥', 'plus'),
        )
  }
  function filteredActivity() {
    const query = document.getElementById('activity-search')?.value.toLowerCase() || ''
    const status = document.getElementById('activity-status')?.value || 'all'
    const period = document.getElementById('activity-period')?.value || '7'
    return activity.filter(
      (item) =>
        (!query || (item.model.name + ' ' + item.id).toLowerCase().includes(query)) &&
        (status === 'all' || item.ok === (status === 'success')) &&
        (period !== '1' || item.time.startsWith('2026-09-20')),
    )
  }
  function activityTable(list) {
    return `<div class="v6-table-wrap"><table class="v6-table"><thead><tr><th>时间</th><th>模型</th><th>输入 / 输出</th><th>成本</th><th>状态</th></tr></thead><tbody>${list.map((item) => `<tr><td>${button('activity-detail', item.time, '', `data-id="${item.id}"`, 'v6-link')}</td><td>${link('models/' + item.model.id, esc(item.model.name), '')}</td><td>${item.input.toLocaleString()} / ${item.output.toLocaleString()}</td><td>${money(item.cost)}</td><td><span class="v6-badge ${item.ok ? 'green' : ''}">${item.ok ? '成功' : '失败'}</span></td></tr>`).join('')}</tbody></table></div>`
  }
  function filterActivity() {
    const list = filteredActivity()
    document.getElementById('activity-results').innerHTML = list.length
      ? activityTable(list) + `<p class="v6-small v6-muted">共 ${list.length} 条记录 · 演示数据</p>`
      : empty('没有匹配的请求', '调整时间、状态或搜索条件。')
  }

  function showDialog(title, body) {
    if (!dialog.open) dialogOpener = document.activeElement
    dialog.innerHTML = `<div class="v6-dialog-head"><h2 id="v6-dialog-title">${title}</h2>${iconButton('close-dialog', '关闭', 'x')}</div><div class="v6-dialog-body">${body}</div>`
    dialog.setAttribute('aria-labelledby', 'v6-dialog-title')
    if (!dialog.open) dialog.showModal()
    dialog.querySelector('input, textarea, select')?.focus()
  }
  function closeDialog() {
    dialog.close()
    if (dialogOpener?.isConnected) dialogOpener.focus()
  }
  function keyDialog(id = '') {
    const key = state.keys.find((item) => item.id === id)
    showDialog(
      key ? '编辑 API Key' : '创建 API Key',
      `<form id="key-form" data-id="${id}"><label class="v6-form-label">名称<input class="v6-input" name="name" required maxlength="60" placeholder="例如 Production App" value="${esc(key?.name || '')}"></label><label class="v6-form-label">额度上限（USD）<input class="v6-input" name="limit" type="number" min="1" max="100000" step="0.01" required value="${key?.limit || 50}"></label><label class="v6-form-label">有效期<select class="v6-select" name="expiry">${['永不过期', '30 天', '90 天', '1 年'].map((value) => `<option ${key?.expiry === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><p class="v6-small v6-muted">仅创建本地演示密钥，无法用于真实 API 请求。</p><div class="v6-dialog-foot">${button('close-dialog', '取消')}<button type="submit" class="v6-btn primary">${key ? '保存' : '创建密钥'}</button></div></form>`,
    )
  }
  function toast(message) {
    document.querySelector('.v6-toast')?.remove()
    clearTimeout(toastTimer)
    const node = document.createElement('div')
    node.className = 'v6-toast'
    node.setAttribute('role', 'status')
    node.textContent = message
    document.body.append(node)
    toastTimer = setTimeout(() => node.remove(), 3000)
  }
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value)
      toast('已复制到剪贴板')
    } catch {
      showDialog(
        '复制内容',
        `<textarea class="v6-input" readonly style="width:100%;min-height:120px" aria-label="待复制内容">${esc(value)}</textarea>`,
      )
      dialog.querySelector('textarea').select()
    }
  }
  function navigate(path) {
    if (location.hash === '#/' + path) render()
    else location.hash = '#/' + path
  }
  function updateQuery(key, value) {
    params.set(key, value)
    navigate(route + '?' + params.toString())
  }
  function searchDialog() {
    showDialog(
      '搜索模型与页面',
      `${search('global-search', '搜索模型、页面或操作…')}<div id="global-results" style="margin-top:12px;max-height:420px;overflow:auto"></div>`,
    )
    renderSearchResults()
  }
  function renderSearchResults() {
    const query = document.getElementById('global-search').value.toLowerCase().trim()
    const pages = [
      ['models', '模型目录', 'layers'],
      ['discover', '发现模型', 'compass'],
      ['providers', '提供商', 'server'],
      ['rankings', '排行榜', 'trophy'],
      ['chat', '聊天试用', 'message-square'],
      ['console/keys', 'API Keys', 'key-round'],
      ['console/credits', '余额与账单', 'wallet'],
      ['console/activity', '活动记录', 'activity'],
      ['docs', '文档', 'book-open'],
    ]
    const matches = pages
      .filter(([path, name]) => (path + name).toLowerCase().includes(query))
      .map(([path, name, symbol]) => ({ path, name, symbol, kind: '页面' }))
      .concat(
        models
          .filter((model) =>
            (model.name + model.provider + model.slug).toLowerCase().includes(query),
          )
          .map((model) => ({
            path: 'models/' + model.id,
            name: model.name,
            symbol: 'layers',
            kind: model.provider,
          })),
      )
    document.getElementById('global-results').innerHTML = matches.length
      ? matches
          .map(
            (item, index) =>
              `<a class="v6-command-item ${index === 0 ? 'active' : ''}" href="#/${item.path}">${icon(item.symbol)}${esc(item.name)}<small>${esc(item.kind)}</small></a>`,
          )
          .join('')
      : '<p class="v6-muted">没有匹配结果。</p>'
  }

  function drawCharts() {
    const colors = getComputedStyle(document.documentElement)
    const seriesColors = ['--accent', '--info', '--warning', '--muted', '--accent-soft'].map(
      (token) => colors.getPropertyValue(token).trim(),
    )
    charts.length = 0
    app.querySelectorAll('canvas[data-chart]').forEach((canvas) => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      const width = rect.width,
        height = rect.height,
        left = 44,
        right = 12,
        top = 12,
        bottom = 30
      const plotWidth = width - left - right,
        plotHeight = height - top - bottom
      const periodControl = app.querySelector(`[data-chart-period="${canvas.id}"]`)
      const period = periodControl
        ? Number(periodControl.value)
        : params.get('period') === 'day'
          ? 24
          : params.get('period') === 'month'
            ? 30
            : 7
      const periodScale =
        params.get('period') === 'day' ? 0.16 : params.get('period') === 'month' ? 4.4 : 1
      const logarithmic = canvas.dataset.scale === 'log'
      const detail = getModel(route.split('/')[1])
      const points = period
      const ranked = models
        .filter((model) => model.outputs.includes(params.get('output') || 'text'))
        .sort((a, b) => b.usage - a.usage)
      const series =
        canvas.id === 'rankings-usage'
          ? ranked.slice(0, 5).map((model) => model.usage)
          : [12.4, 8.6, 6.2, 4.7, 2.3]
      const total = series.reduce((sum, usage) => sum + usage, 0)
      const weights = Array.from(
        { length: points },
        (_, index) => 0.6 + (index / points) * 0.55 + Math.sin(index * 1.9) * 0.09,
      )
      const weightTotal = weights.reduce((sum, weight) => sum + weight, 0)
      const buckets = weights.map((weight) => (total * periodScale * weight) / weightTotal)
      const max =
        canvas.dataset.chart === 'performance'
          ? Math.ceil((parseInt(detail?.throughput || '100', 10) * 1.2) / 10) * 10
          : Math.max(...buckets) * 1.15
      ctx.font = '11px -apple-system, sans-serif'
      ctx.textAlign = 'right'
      for (let index = 0; index <= 4; index++) {
        const y = top + (plotHeight * index) / 4
        ctx.strokeStyle = colors.getPropertyValue('--border').trim()
        ctx.beginPath()
        ctx.moveTo(left, y)
        ctx.lineTo(width - right, y)
        ctx.stroke()
        ctx.fillStyle = colors.getPropertyValue('--muted').trim()
        const tick = logarithmic
          ? Math.expm1(Math.log1p(max) * (1 - index / 4))
          : max * (1 - index / 4)
        ctx.fillText(
          tick.toFixed(tick < 10 && tick > 0 ? 1 : 0) +
            (canvas.dataset.chart === 'usage' ? 'B' : ''),
          left - 8,
          y + 4,
        )
      }
      const data = []
      const unit = plotWidth / points
      for (let index = 0; index < points; index++) {
        const base =
          canvas.dataset.chart === 'performance'
            ? max * (0.67 + Math.sin(index * 1.7) * 0.06)
            : buckets[index]
        const normalized = logarithmic ? Math.log1p(base) / Math.log1p(max) : base / max
        const x = left + unit * index + unit / 2
        data.push({
          x,
          value: base,
          label:
            period === 24 ? `${index}:00` : `第 ${Math.round((index * period) / points) + 1} 天`,
        })
        if (canvas.dataset.chart === 'usage') {
          let y = top + plotHeight
          const shares = series.map((usage) => usage / total)
          shares.forEach((share, series) => {
            const barHeight = plotHeight * normalized * share
            ctx.fillStyle = seriesColors[series]
            ctx.fillRect(left + index * unit + 2, y - barHeight, Math.max(2, unit - 4), barHeight)
            y -= barHeight
          })
        }
        if (index % Math.max(1, Math.floor(points / 6)) === 0) {
          ctx.fillStyle = colors.getPropertyValue('--muted').trim()
          ctx.textAlign = 'center'
          ctx.fillText(data[index].label, x, height - 8)
        }
      }
      if (canvas.dataset.chart !== 'usage') {
        ctx.strokeStyle = seriesColors[0]
        ctx.lineWidth = 2
        ctx.beginPath()
        data.forEach((point, index) => {
          const y = top + plotHeight * (1 - point.value / max)
          if (index === 0) ctx.moveTo(point.x, y)
          else ctx.lineTo(point.x, y)
        })
        ctx.stroke()
      }
      charts.push({ canvas, data })
    })
  }
  function observePage() {
    chartObserver?.disconnect()
    chartObserver = new ResizeObserver(drawCharts)
    app.querySelectorAll('.v6-chart').forEach((node) => chartObserver.observe(node))
    drawCharts()
    sectionObserver?.disconnect()
    sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (current)
          app
            .querySelectorAll('[data-section]')
            .forEach((link) =>
              link.classList.toggle('active', link.dataset.section === current.target.id),
            )
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    app.querySelectorAll('.v6-section[id]').forEach((node) => sectionObserver.observe(node))
  }

  function render() {
    if (route === 'chat') draftPrompt = document.getElementById('chat-prompt')?.value || draftPrompt
    if (dialog.open) closeDialog()
    const raw = (location.hash || '#/home').slice(2)
    const queryIndex = raw.indexOf('?')
    route = queryIndex < 0 ? raw : raw.slice(0, queryIndex)
    params = new URLSearchParams(queryIndex < 0 ? '' : raw.slice(queryIndex + 1))
    if (route === 'models/anthropic-claude-3-7-sonnet') route = 'models/claude-3.7'
    if (
      ![
        'home',
        'models',
        'discover',
        'rankings',
        'providers',
        'chat',
        'pricing',
        'docs',
        'console',
        'console/activity',
        'console/keys',
        'console/credits',
        'console/settings',
        'console/files',
        'console/guardrails',
        'console/byok',
        'console/routing',
        'console/presets',
        'console/tools',
        'console/observability',
        'console/profile',
        'console/logs',
        'console/notifications',
        'console/privacy',
        'console/preferences',
      ].includes(route) &&
      !(route.startsWith('models/') && getModel(route.slice(7)))
    ) {
      route = 'home'
      history.replaceState(null, '', '#/home')
    }
    catalogFilter = null
    app.className = route === 'home' ? '' : 'v6-app'
    document.querySelector('.v6-footer')?.remove()
    app.innerHTML = ''
    renderHeader()
    if (route === 'home') renderHome()
    else if (route === 'models') renderModels()
    else if (route.startsWith('models/')) renderDetail(route.slice(7))
    else if (route === 'discover') renderDiscover()
    else if (route === 'rankings') renderRankings()
    else if (route === 'providers') renderProviders()
    else if (route === 'pricing') renderPricing()
    else if (route === 'docs') renderDocs()
    else if (route === 'chat') renderChat()
    else renderAccount()
    if (route !== 'chat' && route !== 'home') app.insertAdjacentHTML('afterend', footer())
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    app.focus({ preventScroll: true })
    observePage()
    if (params.has('section'))
      requestAnimationFrame(() => document.getElementById(params.get('section'))?.scrollIntoView())
    document.title = `aitokensflux V6 · ${route.startsWith('models/') ? getModel(route.slice(7)).name : { home: '首页', models: '模型', discover: '发现模型', providers: '提供商', rankings: '排行榜', pricing: '价格', docs: '文档', chat: '聊天' }[route] || '工作台'}`
  }

  document.addEventListener('click', (event) => {
    const sectionLink = event.target.closest('[data-section]')
    if (sectionLink) {
      event.preventDefault()
      document.getElementById(sectionLink.dataset.section)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    const oldRoute = event.target.closest('[data-route]')
    if (oldRoute) {
      event.preventDefault()
      navigate(oldRoute.dataset.route.replace('#/', ''))
      return
    }
    const anchor = event.target.closest('a[href^="#/"]')
    if (anchor) {
      if (dialog.open) closeDialog()
      if (location.hash === anchor.getAttribute('href')) {
        event.preventDefault()
        render()
      }
      return
    }
    const target = event.target.closest('[data-action]')
    if (!target) {
      document.querySelectorAll('.v6-dropdown[open]').forEach((menu) => {
        if (!menu.contains(event.target)) menu.open = false
      })
      return
    }
    const { action, id, value } = target.dataset
    if (action === 'search') searchDialog()
    else if (action === 'close-dialog') closeDialog()
    else if (action === 'copy') copy(target.dataset.copy)
    else if (action === 'copy-code')
      copy(target.closest('.v6-code').querySelector('code').textContent)
    else if (action === 'pin') {
      state.pins = state.pins.includes(id)
        ? state.pins.filter((item) => item !== id)
        : [...state.pins, id]
      save()
      app.querySelectorAll(`[data-action="pin"][data-id="${id}"]`).forEach((node) => {
        const pinned = state.pins.includes(id)
        node.setAttribute('aria-pressed', pinned)
        node.setAttribute('aria-label', pinned ? '取消收藏' : '收藏模型')
        node.title = pinned ? '取消收藏' : '收藏模型'
      })
      if (catalogFilter?.pinned) filterModels()
    } else if (action === 'pinned-only') {
      catalogFilter.pinned = !catalogFilter.pinned
      target.setAttribute('aria-pressed', catalogFilter.pinned)
      filterModels()
    } else if (action === 'filters-reset') navigate('models')
    else if (action === 'filters-open' || action === 'filters-close') {
      const panel = document.getElementById('catalog-filters')
      panel.classList.toggle('open', action === 'filters-open')
      if (action === 'filters-open') panel.querySelector('button').focus()
      else app.querySelector('[data-action="filters-open"]').focus()
    } else if (action === 'output-modality') {
      catalogFilter.output = value
      target.parentElement.querySelectorAll('[role=tab]').forEach((tab) => {
        tab.classList.toggle('active', tab === target)
        tab.setAttribute('aria-selected', tab === target)
        tab.tabIndex = tab === target ? 0 : -1
      })
      filterModels()
    } else if (action === 'model-view') {
      catalogFilter.view = value
      target.parentElement.querySelectorAll('button').forEach((node) => {
        node.classList.toggle('active', node === target)
        node.setAttribute('aria-pressed', node === target)
      })
      filterModels()
    } else if (action === 'code-language') {
      const block = target.closest('.v6-code')
      block.querySelectorAll('[data-action="code-language"]').forEach((node) => {
        node.classList.toggle('active', node === target)
        node.setAttribute('aria-pressed', node === target)
      })
      block.querySelector('code').textContent = codeExample(
        getModel(block.dataset.codeModel),
        value,
      )
    } else if (action === 'provider-sort') {
      const table = document.getElementById('provider-table')
      table.dataset.sort = value
      table.innerHTML = providerTable(
        getModel(route.slice(7)),
        value,
        Number(document.getElementById('provider-percentile').value),
      )
    } else if (action === 'provider-info') {
      const name = target.dataset.name
      const available = models.filter((model) => model.hosts.includes(name))
      showDialog(
        esc(name),
        `<span class="v6-badge">提供商策略 · 演示数据</span><p class="v6-muted">提供 ${available.length} 个模型，${name === 'DeepSeek' ? '有限保留请求数据' : '支持零数据保留'}。</p><div class="v6-stack">${available.map((model) => link('models/' + model.id, esc(model.name), 'v6-link')).join('')}</div><div class="v6-dialog-foot">${link('models?provider=' + encodeURIComponent(name), '浏览全部模型', 'v6-btn primary')}</div>`,
      )
    } else if (action === 'ranking-output') updateQuery('output', value)
    else if (action === 'chart-scale') {
      document.getElementById('rankings-usage').dataset.scale = value
      target.parentElement.querySelectorAll('button').forEach((node) => {
        node.classList.toggle('active', node === target)
        node.setAttribute('aria-pressed', node === target)
      })
      drawCharts()
    } else if (action === 'create-key' || action === 'edit-key') keyDialog(id)
    else if (action === 'toggle-key') {
      const key = state.keys.find((item) => item.id === id)
      key.enabled = !key.enabled
      save()
      renderKeys()
    } else if (action === 'delete-key') {
      const key = state.keys.find((item) => item.id === id)
      showDialog(
        '删除演示密钥',
        `<p>确认删除「${esc(key.name)}」？</p><div class="v6-dialog-foot">${button('close-dialog', '取消')}${button('confirm-delete-key', '删除', 'trash-2', `data-id="${id}"`)}</div>`,
      )
    } else if (action === 'confirm-delete-key') {
      state.keys = state.keys.filter((key) => key.id !== id)
      save()
      closeDialog()
      renderKeys()
      toast('演示密钥已删除')
    } else if (action === 'add-credits')
      showDialog(
        '增加演示余额',
        `<form id="credits-form"><label class="v6-form-label">金额（USD）<input class="v6-input" name="amount" type="number" min="1" max="10000" step="0.01" value="20" required></label><p class="v6-muted v6-small">仅更新本地演示余额，不会进行真实支付。</p><div class="v6-dialog-foot">${button('close-dialog', '取消')}<button class="v6-btn primary" type="submit">增加余额</button></div></form>`,
      )
    else if (action === 'activity-detail') {
      const item = activity.find((entry) => entry.id === id)
      showDialog(
        '请求详情',
        `<div class="v6-stack"><div class="v6-muted mono v6-small">${item.id}</div>${stat('模型', esc(item.model.name))}${stat('输入 / 输出 tokens', `${item.input} / ${item.output}`)}${stat('首 token 延迟', item.latency + ' ms')}${stat('状态', item.ok ? '200 · 成功' : '429 · 请求限流')}</div>`,
      )
    } else if (action === 'export-activity') {
      const rows = [
        ['时间', '请求 ID', '模型', '输入 tokens', '输出 tokens', '成本 USD', '状态'],
        ...filteredActivity().map((item) => [
          item.time,
          item.id,
          item.model.slug,
          item.input,
          item.output,
          item.cost,
          item.ok ? '成功' : '失败',
        ]),
      ]
      const csv =
        '\uFEFF' +
        rows
          .map((row) => row.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(','))
          .join('\r\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const download = document.createElement('a')
      download.href = url
      download.download = 'tokenflux-demo-activity.csv'
      download.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } else if (action === 'mobile-menu')
      showDialog(
        '导航',
        `<div class="v6-stack">${[
          ['home', '首页'],
          ['models', '模型'],
          ['discover', '发现模型'],
          ['providers', '提供商'],
          ['rankings', '排行榜'],
          ['chat', '聊天'],
          ['pricing', '价格'],
          ['docs', '文档'],
          ['console', '工作台'],
        ]
          .map(([path, label]) => link(path, label, 'v6-command-item'))
          .join('')}</div>`,
      )
    else if (action === 'choose-model')
      showDialog(
        '选择模型',
        `<form id="chat-models-form"><div class="v6-stack">${models
          .filter((model) => model.outputs.includes('text'))
          .map((model) =>
            check('chat-model', model.id, esc(model.name), state.chatModels.includes(model.id)),
          )
          .join(
            '',
          )}</div><p class="v6-muted v6-small" id="chat-model-error" role="status">选择 1 至 3 个模型</p><div class="v6-dialog-foot"><button type="submit" class="v6-btn primary">完成</button></div></form>`,
      )
    else if (action === 'remove-chat-model') {
      if (state.chatModels.length === 1) {
        toast('至少保留一个模型')
        return
      }
      state.chatModels = state.chatModels.filter((modelId) => modelId !== id)
      const room = state.rooms.find((item) => item.id === roomId)
      if (room) room.models = [...state.chatModels]
      params.delete('model')
      save()
      renderChat()
    } else if (action === 'chat-preset') {
      state.chatModels = value.split(',')
      params.delete('model')
      save()
      renderChat()
    } else if (action === 'prompt-example') {
      document.getElementById('chat-prompt').value = value
      document.getElementById('chat-prompt').focus()
      draftPrompt = value
    } else if (action === 'new-chat') {
      stopChat()
      roomId = ''
      state.activeRoom = ''
      draftPrompt = ''
      params.delete('model')
      history.replaceState(null, '', '#/chat')
      save()
      renderChat()
    } else if (action === 'open-room') {
      stopChat()
      roomId = id
      state.activeRoom = id
      draftPrompt = ''
      params.delete('model')
      save()
      renderChat()
    } else if (action === 'stop-chat') {
      stopChat()
      renderChat()
    } else if (action === 'chat-sidebar' || action === 'chat-sidebar-close')
      document.getElementById('chat-sidebar').classList.toggle('open', action === 'chat-sidebar')
    else if (action === 'chat-settings')
      showDialog(
        '聊天设置',
        `<label class="v6-form-label">Temperature <output id="temperature-value">${state.temperature}</output><input type="range" id="chat-temperature" min="0" max="2" step="0.1" value="${state.temperature}"></label><p class="v6-small v6-muted">参数仅保存在本地。演示回复使用固定样本，不执行模型推理。</p><div class="v6-dialog-foot">${button('close-dialog', '完成', 'check')}</div>`,
      )
  })

  document.addEventListener('submit', (event) => {
    const form = event.target
    if (
      !['key-form', 'credits-form', 'settings-form', 'chat-models-form', 'chat-form'].includes(
        form.id,
      )
    )
      return
    event.preventDefault()
    const data = new FormData(form)
    if (form.id === 'chat-form') {
      sendChat()
      return
    }
    if (form.id === 'key-form') {
      const name = String(data.get('name')).trim(),
        limit = Number(data.get('limit'))
      if (!name || !Number.isFinite(limit) || limit < 1 || limit > 100000) return
      const existing = state.keys.find((key) => key.id === form.dataset.id)
      if (existing) {
        Object.assign(existing, { name, limit, expiry: data.get('expiry') })
        save()
        closeDialog()
        renderKeys()
        toast('密钥已更新')
      } else {
        const secret = 'sk-demo-' + crypto.randomUUID().replaceAll('-', '')
        state.keys.unshift({
          id: crypto.randomUUID(),
          name,
          limit,
          used: 0,
          enabled: true,
          expiry: data.get('expiry'),
          prefix: 'sk-demo-••••' + secret.slice(-4),
        })
        save()
        renderKeys()
        showDialog(
          '演示密钥已创建',
          `<p class="v6-muted">明文仅展示一次。这是演示密钥，无法调用真实 API。</p><div class="v6-row"><input class="v6-input mono" readonly aria-label="新密钥" style="flex:1" value="${secret}">${iconButton('copy', '复制密钥', 'copy', `data-copy="${secret}"`)}</div><div class="v6-dialog-foot">${button('close-dialog', '完成', 'check', '', 'v6-btn primary')}</div>`,
        )
      }
    } else if (form.id === 'credits-form') {
      const amount = Number(data.get('amount'))
      if (!Number.isFinite(amount) || amount < 1 || amount > 10000) return
      state.balance = Math.round((state.balance + amount) * 100) / 100
      state.transactions.unshift({
        date: new Date().toLocaleDateString('sv-SE'),
        amount,
        type: '演示余额',
        status: '已完成',
      })
      save()
      closeDialog()
      render()
      toast('演示余额已更新')
    } else if (form.id === 'settings-form') {
      const name = String(data.get('workspace')).trim()
      if (!name) return
      state.settings.name = name
      save()
      toast('工作区设置已保存')
    } else if (form.id === 'chat-models-form') {
      const selected = data.getAll('chat-model')
      if (!selected.length || selected.length > 3) {
        document.getElementById('chat-model-error').textContent = '请选择 1 至 3 个模型'
        return
      }
      state.chatModels = selected
      const room = state.rooms.find((item) => item.id === roomId)
      if (room) room.models = [...selected]
      params.delete('model')
      save()
      closeDialog()
      renderChat()
    }
  })
  document.addEventListener('input', (event) => {
    const id = event.target.id
    if (['model-search', 'context-range', 'price-range', 'output-price-range'].includes(id))
      filterModels()
    if (id === 'provider-search') filterProviders()
    if (id === 'key-search') renderKeys()
    if (id === 'global-search') renderSearchResults()
    if (id === 'activity-search') filterActivity()
    if (id === 'room-search') renderChatRooms()
    if (id === 'chat-prompt') draftPrompt = event.target.value
    if (id === 'chat-temperature') {
      state.temperature = Number(event.target.value)
      document.getElementById('temperature-value').textContent = state.temperature
      save()
    }
    if (id === 'estimate-input' || id === 'estimate-output') {
      const model = getModel(route.slice(7))
      const input = Math.max(
        0,
        Math.min(10000000, Number(document.getElementById('estimate-input').value) || 0),
      )
      const output = Math.max(
        0,
        Math.min(1000000, Number(document.getElementById('estimate-output').value) || 0),
      )
      document.getElementById('estimate-cost').textContent = money(
        (input * model.inputRate + output * model.outputRate) / 1e6,
      )
    }
  })
  document.addEventListener('change', (event) => {
    const id = event.target.id
    if (id === 'model-sort') {
      catalogFilter.sort = event.target.value
      filterModels()
    }
    if (id === 'model-variant') {
      catalogFilter.variant = event.target.value
      filterModels()
    }
    if (event.target.closest('#catalog-filters')) filterModels()
    if (id === 'provider-zdr') filterProviders()
    if (id === 'provider-percentile') {
      const table = document.getElementById('provider-table')
      table.innerHTML = providerTable(
        getModel(route.slice(7)),
        table.dataset.sort,
        Number(event.target.value),
      )
    }
    if (id === 'ranking-period') updateQuery('period', event.target.value)
    if (id === 'ranking-metric') updateQuery('metric', event.target.value)
    if (id === 'activity-status' || id === 'activity-period') filterActivity()
    if (event.target.dataset.chartPeriod) drawCharts()
    if (event.target.dataset.setting) {
      const key = event.target.dataset.setting
      state.settings[key] = event.target.checked
      save()
      toast('设置已更新')
    }
  })
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      searchDialog()
    }
    if (
      event.target.id === 'global-search' &&
      ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)
    ) {
      event.preventDefault()
      const items = [...dialog.querySelectorAll('.v6-command-item')]
      const current = items.findIndex((node) => node.classList.contains('active'))
      if (event.key === 'Enter') items[current]?.click()
      else {
        const next = (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
        items.forEach((node, index) => node.classList.toggle('active', index === next))
        items[next]?.scrollIntoView({ block: 'nearest' })
      }
    }
    if (
      event.target.getAttribute('role') === 'tab' &&
      ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
    ) {
      event.preventDefault()
      const items = [...event.target.parentElement.querySelectorAll('[role=tab]')]
      const current = items.indexOf(event.target)
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (current + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
      items[next].click()
      items[next].focus()
    }
    if (
      event.target.id === 'chat-prompt' &&
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.isComposing
    ) {
      event.preventDefault()
      sendChat()
    }
    if (event.key === 'Escape') {
      document.querySelectorAll('.v6-dropdown[open]').forEach((menu) => {
        menu.open = false
        menu.querySelector('summary').focus()
      })
      document.getElementById('catalog-filters')?.classList.remove('open')
      document.getElementById('chat-sidebar')?.classList.remove('open')
    }
  })
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect()
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        closeDialog()
    }
  })
  dialog.addEventListener('close', () => {
    if (dialogOpener?.isConnected) dialogOpener.focus()
  })
  app.addEventListener('pointermove', (event) => {
    const record = charts.find((item) => item.canvas === event.target)
    if (!record) return
    const x = event.clientX - record.canvas.getBoundingClientRect().left
    const point = record.data.reduce((nearest, item) =>
      Math.abs(item.x - x) < Math.abs(nearest.x - x) ? item : nearest,
    )
    const tooltip = record.canvas.nextElementSibling
    tooltip.hidden = false
    tooltip.textContent =
      point.label +
      ' · ' +
      point.value.toFixed(1) +
      (record.canvas.dataset.chart === 'usage' ? 'B tokens' : ' tok/s')
  })
  app.addEventListener('pointerout', (event) => {
    if (event.target.matches('canvas[data-chart]')) event.target.nextElementSibling.hidden = true
  })
  window.addEventListener('hashchange', render)
  state.rooms.forEach((room) =>
    room.messages.forEach((message) => {
      if (message.pending) {
        message.pending = false
        message.stopped = true
      }
    }),
  )
  render()
})()
