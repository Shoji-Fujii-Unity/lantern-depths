/* ============================================================
   六層の灯 −LANTERN DEPTHS− / pixel.js
   ・ART(文字グリッド) → Canvas スプライト化
   ・階層別の床・壁タイルを手続き生成（シード固定で毎回同じ見た目）
   ・3x5 ピクセルフォント / アイコン / 補完のフォールバック
   ============================================================ */
"use strict";

const PX = (function () {
  /* ---------- 基本ユーティリティ ---------- */
  function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, t) {
    const A = typeof a === "string" ? hex2rgb(a) : a, B = typeof b === "string" ? hex2rgb(b) : b;
    return "rgb(" + Math.round(A[0] + (B[0] - A[0]) * t) + "," + Math.round(A[1] + (B[1] - A[1]) * t) + "," + Math.round(A[2] + (B[2] - A[2]) * t) + ")";
  }
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- グリッド → canvas ---------- */
  function grid2cv(grid, override) {
    const h = grid.length, w = grid[0].length;
    const c = cv(w, h), g = c.getContext("2d"), img = g.createImageData(w, h), d = img.data;
    const pal = ART.pal;
    for (let y = 0; y < h; y++) {
      const row = grid[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x] || ".";
        let col = (override && override[ch]) ? override[ch] : pal[ch];
        if (!col || ch === "." || ch === " ") continue;
        const rgb = typeof col === "string" ? hex2rgb(col) : col, i = (y * w + x) * 4;
        d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /* 明暗バリアント（被弾閃光・影用） */
  function shade(src, k) {
    const c = cv(src.width, src.height), g = c.getContext("2d");
    g.drawImage(src, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      if (k > 2) {
        d[i] = Math.min(255, d[i] * k + 90);
        d[i + 1] = Math.min(255, d[i + 1] * k + 70);
        d[i + 2] = Math.min(255, d[i + 2] * k + 70);
      } else {
        d[i] = Math.min(255, d[i] * k);
        d[i + 1] = Math.min(255, d[i + 1] * k);
        d[i + 2] = Math.min(255, d[i + 2] * k);
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function tint(src, color, alpha) {
    const c = cv(src.width, src.height), g = c.getContext("2d");
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "source-atop";
    g.globalAlpha = alpha;
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------- 手続きタイル ---------- */
  const BIOME = {
    rock: {
      name: ["蒼石の坑道", "Slate Cavern", "苍石坑道"],
      fl: "#161d2f", flHi: "#222d48", flLo: "#101524", grout: "#0b0f1b",
      br: "#2c3856", brHi: "#495b85", mortar: "#161d31",
      cap: "#3b496e", capHi: "#6073a8", capLo: "#202840",
      accent: "#6fb0ff", accent2: "#3b4a72", glow: "rgba(110,175,255,0.12)"
    },
    ruin: {
      name: ["朽ちた神殿", "Sunken Ruins", "朽坏神殿"],
      fl: "#1e1913", flHi: "#2b241a", flLo: "#15110d", grout: "#0e0b08",
      br: "#4b3b2a", brHi: "#70573c", mortar: "#261d14",
      cap: "#5c4833", capHi: "#886b4b", capLo: "#33271b",
      accent: "#77cf7f", accent2: "#3c8c52", glow: "rgba(120,215,130,0.12)"
    },
    crypt: {
      name: ["深淵の聖堂", "Abyssal Crypt", "深渊圣堂"],
      fl: "#181124", flHi: "#241936", flLo: "#110b1a", grout: "#0b0712",
      br: "#3b2952", brHi: "#614486", mortar: "#1e142d",
      cap: "#4a3066", capHi: "#7952a3", capLo: "#281938",
      accent: "#c483f2", accent2: "#e2513c", glow: "rgba(196,131,242,0.14)"
    }
  };

  function px(g, x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }

  function mkFloor(biome, variant, seed) {
    const P = BIOME[biome] || BIOME.rock, c = cv(16, 16), g = c.getContext("2d"), R = mulberry(seed * 7919 + variant * 131);
    g.fillStyle = P.fl;
    g.fillRect(0, 0, 16, 16);

    /* サブタイルの石畳分割（単調さを防ぐ互い違い目地） */
    const splitY = 7 + (variant % 2);
    const splitX1 = 8 + ((variant & 1) ? 2 : -2);
    g.fillStyle = mix(P.grout, P.fl, 0.42);
    g.fillRect(0, 15, 16, 1);
    g.fillRect(15, 0, 1, 16);
    g.fillRect(0, splitY, 16, 1);
    g.fillRect(splitX1, 0, 1, splitY);

    /* 石畳のエッジハイライト */
    const hiEdge = mix(P.flHi, "#ffffff", 0.08);
    g.fillStyle = hiEdge;
    g.fillRect(1, 0, splitX1 - 2, 1);
    g.fillRect(splitX1 + 1, 0, 14 - splitX1, 1);
    g.fillRect(1, splitY + 1, 13, 1);
    g.fillRect(0, 1, 1, splitY - 1);
    g.fillRect(0, splitY + 2, 1, 13 - splitY);

    /* 表面の微細な凹凸粒子 */
    for (let i = 0; i < 16; i++) {
      const tx = (R() * 15) | 0, ty = (R() * 15) | 0;
      if (ty === splitY || tx === 15 || ty === 15) continue;
      px(g, tx, ty, R() < 0.48 ? mix(P.flHi, P.fl, 0.35) : mix(P.flLo, P.fl, 0.3));
    }

    if (biome === "crypt" && variant === 0) {
      /* 聖堂の淡い幾何学紋様 */
      const runeCol = mix(P.accent, P.fl, 0.78);
      px(g, 4, 11, runeCol); px(g, 5, 10, runeCol); px(g, 6, 11, runeCol); px(g, 5, 12, runeCol);
    }
    if (variant === 1) {
      /* ひび割れ */
      let x = 3 + ((R() * 7) | 0), y = 2 + ((R() * 4) | 0);
      const crk = mix(P.grout, P.fl, 0.2);
      for (let i = 0; i < 7; i++) {
        px(g, x, y, crk);
        if (i === 3) px(g, x + 1, y - 1, mix(P.flHi, P.fl, 0.4));
        x += R() < 0.45 ? 1 : (R() < 0.2 ? -1 : 0);
        y += R() < 0.25 ? 0 : 1;
        if (y > 13 || x < 1 || x > 14) break;
      }
    }
    if (variant === 2) {
      /* 小石と砂利 */
      for (let i = 0; i < 3; i++) {
        const x = 2 + ((R() * 11) | 0), y = 2 + ((R() * 11) | 0);
        px(g, x, y, P.flHi);
        px(g, x + 1, y, mix(P.flHi, P.fl, 0.4));
        px(g, x, y + 1, P.grout);
      }
    }
    if (variant === 3) {
      /* バイオーム固有の微装飾（鉱石・苔・魔力の結晶） */
      const ac = mix(P.accent, P.fl, 0.35), ac2 = mix(P.accent2, P.fl, 0.45);
      for (let i = 0; i < 4; i++) {
        const x = 2 + ((R() * 12) | 0), y = 2 + ((R() * 12) | 0);
        px(g, x, y, R() < 0.5 ? ac : ac2);
        if (R() < 0.4) px(g, x + 1, y, ac2);
      }
    }
    return c;
  }

  function mkWall(biome, kind, seed) {
    const P = BIOME[biome] || BIOME.rock, c = cv(16, 16), g = c.getContext("2d"), R = mulberry(seed * 104729 + kind.length * 17);
    if (kind === "top") {
      /* 上辺（天井面の縁）＝立体的な笠石（コーニス） */
      g.fillStyle = P.cap;
      g.fillRect(0, 0, 16, 16);
      g.fillStyle = P.capHi;
      g.fillRect(0, 0, 16, 3);
      g.fillStyle = mix(P.capHi, "#ffffff", 0.28);
      g.fillRect(0, 0, 16, 1);
      /* 笠石のブロック区切り */
      g.fillStyle = P.capLo;
      g.fillRect(7, 0, 1, 3);
      g.fillRect(15, 0, 1, 16);
      g.fillRect(0, 11, 16, 4);
      g.fillStyle = mix(P.capHi, P.cap, 0.5);
      g.fillRect(0, 10, 16, 1);
      for (let i = 0; i < 20; i++) {
        px(g, (R() * 15) | 0, 3 + ((R() * 7) | 0), R() < 0.5 ? mix(P.cap, "#ffffff", 0.1) : P.capLo);
      }
      if (biome === "ruin" && R() < 0.55) {
        /* 垂れ下がるツタ・苔 */
        const vx = 2 + ((R() * 11) | 0);
        for (let vy = 10; vy < 15; vy++) {
          px(g, vx + (vy % 2), vy, vy < 13 ? P.accent : P.accent2);
        }
      } else if (biome === "crypt" && R() < 0.45) {
        /* 笠石の刻印 */
        px(g, 4, 6, P.accent2); px(g, 11, 6, P.accent);
      }
      g.fillStyle = P.grout;
      g.fillRect(0, 15, 16, 1);
      return c;
    }
    if (kind === "torch") {
      /* 松明つき壁（鉄製の燭台ブラケット付き） */
      g.drawImage(mkWall(biome, "body", seed), 0, 0);
      g.fillStyle = "#121a2c";
      g.fillRect(6, 7, 4, 8);
      g.fillStyle = "#5c6c90";
      g.fillRect(6, 11, 4, 2);
      g.fillStyle = "#4c3a26";
      g.fillRect(7, 7, 2, 7);
      g.fillStyle = "#8b5c28";
      g.fillRect(7, 7, 1, 6);
      g.fillStyle = "#d8b46a";
      g.fillRect(7, 7, 2, 1);
      return c;
    }

    /* レンガ壁（kind = body） */
    g.fillStyle = P.mortar;
    g.fillRect(0, 0, 16, 16);
    const bh = 5, bw = 8;
    for (let row = 0; row * bh < 16; row++) {
      const off = (row % 2) ? -(bw >> 1) : 0;
      for (let bx = off; bx < 16; bx += bw) {
        const w = Math.min(bw - 1, 16 - bx), h2 = Math.min(bh - 1, 16 - row * bh), y0 = row * bh;
        if (w <= 0 || y0 >= 16) continue;
        const x0 = Math.max(0, bx), rw = w - (x0 - bx);
        if (rw <= 0) continue;
        const tone = R() < 0.3 ? mix(P.br, "#ffffff", 0.08) : (R() < 0.3 ? mix(P.br, "#000000", 0.12) : P.br);
        g.fillStyle = tone;
        g.fillRect(x0, y0, rw, h2);
        g.fillStyle = mix(P.brHi, tone, 0.4);
        g.fillRect(x0, y0, rw, 1);
        if (x0 === bx) g.fillRect(x0, y0, 1, h2 - 1);
        g.fillStyle = mix(P.mortar, tone, 0.3);
        g.fillRect(x0, y0 + h2 - 1, rw, 1);
      }
    }
    /* 壁の下端の接地シャドウ */
    g.fillStyle = mix(P.grout, "#000000", 0.35);
    g.fillRect(0, 15, 16, 1);

    if (R() < 0.4) {
      for (let i = 0; i < 5; i++) px(g, (R() * 15) | 0, (R() * 14) | 0, P.mortar);
    }
    if (biome === "crypt" && R() < 0.45) {
      /* 輝くルーン文字 */
      const x = 4 + ((R() * 7) | 0), y = 5 + ((R() * 6) | 0), col = R() < 0.5 ? P.accent : P.accent2;
      px(g, x, y, col); px(g, x + 2, y, col); px(g, x + 1, y + 1, "#f4f8ff"); px(g, x, y + 2, col); px(g, x + 2, y + 2, col);
    }
    if (biome === "ruin" && R() < 0.5) {
      /* 壁面を這う苔 */
      for (let i = 0; i < 8; i++) px(g, (R() * 16) | 0, 9 + ((R() * 6) | 0), R() < 0.5 ? P.accent : P.accent2);
    }
    if (biome === "rock" && R() < 0.35) {
      /* 蒼石の鉱脈きらめき */
      const x = 3 + ((R() * 10) | 0), y = 4 + ((R() * 8) | 0);
      px(g, x, y, P.accent); px(g, x + 1, y + 1, "#c8d2ea");
    }
    return c;
  }

  function mkWater(biome, frame, seed) {
    const c = cv(16, 16), g = c.getContext("2d"), R = mulberry(seed * 313 + frame);
    g.drawImage(mkFloor(biome, 0, seed), 0, 0);
    /* 水たまりの外縁と深み */
    g.fillStyle = "#102338";
    g.fillRect(3, 3, 10, 10);
    g.fillRect(2, 4, 12, 8);
    g.fillStyle = "#1b3d5e";
    g.fillRect(3, 4, 10, 8);
    g.fillStyle = "#29608c";
    g.fillRect(4, 5, 8, 6);
    /* 水面のハイライトと波紋 */
    g.fillStyle = "#4fa4cc";
    for (let i = 0; i < 4; i++) {
      const x = 4 + ((R() * 7) | 0), y = 5 + ((R() * 5) | 0);
      g.fillRect(x, y, 2, 1);
    }
    g.fillStyle = "#9be6ff";
    const ox = (frame || 0) * 2;
    g.fillRect(4 + ox, 6, 2, 1);
    g.fillRect(9 - ox, 9, 2, 1);
    return c;
  }

  /* ---------- 3x5 ピクセルフォント ---------- */
  const DIG = {};
  function buildDigits() {
    for (const k in ART.digits) {
      const rows = ART.digits[k].split("/"), c = cv(3, 5), g = c.getContext("2d");
      for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) if (rows[y][x] === "1") { g.fillStyle = "#fff"; g.fillRect(x, y, 1, 1); }
      DIG[k] = c;
    }
  }
  function textW(s, sc) {
    let n = 0;
    for (const ch of String(s)) if (DIG[ch.toUpperCase()] || ch === " ") n += 4;
    return Math.max(0, n - 1) * sc;
  }
  function text(g, s, x, y, sc) {
    sc = sc || 1; s = String(s).toUpperCase(); let cx = x;
    for (const ch of s) {
      const d = DIG[ch]; if (!d) { if (ch === " ") cx += 4 * sc; continue; }
      g.drawImage(d, cx, y, 3 * sc, 5 * sc); cx += 4 * sc;
    }
    return cx - x;
  }
  const TEXTC = {};
  function textColored(g, s, x, y, col, sc) {
    sc = sc || 1; s = String(s).toUpperCase();
    let cache = TEXTC[col + sc];
    if (!cache) {
      cache = TEXTC[col + sc] = {};
      for (const k in DIG) {
        const c = cv(DIG[k].width, DIG[k].height), gg = c.getContext("2d");
        gg.drawImage(DIG[k], 0, 0); gg.globalCompositeOperation = "source-atop"; gg.fillStyle = col; gg.fillRect(0, 0, c.width, c.height);
        cache[k] = c;
      }
    }
    let cx = x;
    for (const ch of s) { const d = cache[ch]; if (!d) { if (ch === " ") cx += 4 * sc; continue; } g.drawImage(d, cx, y, 3 * sc, 5 * sc); cx += 4 * sc; }
    return cx - x;
  }

  /* ---------- アイコン（DOM 用 SVG データURL） ---------- */
  const ARROW_UP = ["...11...", "..1111..", ".111111.", "11111111", "...11...", "...11...", "...11...", "...11..."];
  const ARROW_NW = ["111.....", "111.....", "11......", "..11....", "...11...", "....11..", ".....11.", "......11"];
  function flipH(rows) { return rows.map(r => r.split("").reverse().join("")); }
  function flipV(rows) { return rows.slice().reverse(); }
  function transpose(rows) { const o = []; for (let x = 0; x < rows[0].length; x++) { let s = ""; for (let y = 0; y < rows.length; y++) s += rows[y][x]; o.push(s); } return o; }
  const ARROWS = { "0,-1": ARROW_UP, "0,1": flipV(ARROW_UP), "-1,-1": ARROW_NW, "1,-1": flipH(ARROW_NW), "-1,1": flipV(ARROW_NW), "1,1": flipV(flipH(ARROW_NW)) };
  ARROWS["-1,0"] = transpose(ARROW_UP);
  ARROWS["1,0"] = flipH(ARROWS["-1,0"]);

  function gridToSVG(rows, colorFn) {
    let r = "";
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x]; if (ch === "." || ch === " ") continue;
      r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + colorFn(ch) + '"/>';
    }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + rows[0].length + " " + rows.length + '" shape-rendering="crispEdges">' + r + "</svg>");
  }
  function iconURL(name, col) {
    const rows = name.indexOf(",") >= 0 ? ARROWS[name] : ART.icons[name];
    if (!rows) return "";
    return gridToSVG(rows, ch => ch === "1" ? (col || "#dfe6f2") : (ART.pal[ch] || col || "#dfe6f2"));
  }

  /* ---------- gsap フォールバック（未取得時でも動く） ---------- */
  const TW = window.gsap || {
    _q: [],
    to(target, vars) {
      const dur = (vars.duration || .3) * 1000, keys = Object.keys(vars).filter(k => ["duration", "onUpdate", "onComplete", "ease", "delay"].indexOf(k) < 0);
      const from = {}, self = this; keys.forEach(k => from[k] = target[k] || 0);
      const t0 = performance.now() + (vars.delay || 0) * 1000;
      function step() {
        const p = Math.max(0, Math.min(1, (performance.now() - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
        keys.forEach(k => target[k] = from[k] + (vars[k] - from[k]) * e);
        if (vars.onUpdate) vars.onUpdate();
        if (p < 1) requestAnimationFrame(step); else if (vars.onComplete) vars.onComplete();
      }
      requestAnimationFrame(step); self._q.push(target); return target;
    },
    set(target, vars) { Object.keys(vars).forEach(k => target[k] = vars[k]); if (vars.onComplete) vars.onComplete(); }
  };

  return { cv, hex2rgb, mix, mulberry, grid2cv, shade, tint, mkFloor, mkWall, mkWater, buildDigits, text, textColored, textW, iconURL, BIOME, TW };
})();
