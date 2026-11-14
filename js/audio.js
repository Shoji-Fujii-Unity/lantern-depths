/* ============================================================
   六層の灯 −LANTERN DEPTHS− / audio.js
   4チャンネル構成（Lead / Arp / Bass / Drums）のチップチューンBGMと
   多層レイヤー効果音（Tone.js ＆ Web Audio API ハイブリッド対応）
   ============================================================ */
"use strict";

const SND = (function () {
  let muted = localStorage.getItem("ld_sound") === "0";
  let ready = false, mode = "none", AC = null, master = null, noiseBuf = null;
  let bgmTimer = null, bgmStep = 0, bgmBiome = null;
  let stepFlip = 0;

  /* ---------- 音名 → 周波数変換 ---------- */
  const SEMI = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
  function noteFreq(n) {
    if (!n || n === "-") return 0;
    if (typeof n === "number") return n;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    if (!m) return 440;
    const midi = (parseInt(m[2], 10) + 1) * 12 + SEMI[m[1]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /* ---------- 楽曲データ（タイトル＋3バイオーム、各32ステップ＝2小節16分音符ループ×展開） ---------- */
  const SONGS = {
    title: {
      bpm: 84,
      bass: [
        "A2", "-", "-", "A2", "-", "-", "E2", "-",
        "F2", "-", "-", "F2", "-", "-", "C2", "-",
        "D2", "-", "-", "D2", "-", "-", "A1", "-",
        "E2", "-", "-", "E2", "-", "B1", "E2", "-"
      ],
      arp: [
        ["A3", "C4", "E4", "A4"],
        ["F3", "A3", "C4", "E4"],
        ["D3", "F3", "A3", "D4"],
        ["E3", "G#3", "B3", "E4"]
      ],
      lead: [
        "E5", "-", "C5", "D5", "E5", "-", "A4", "-",
        "F5", "-", "E5", "C5", "A4", "-", "-", "-",
        "D5", "-", "C5", "B4", "C5", "-", "A4", "F4",
        "E4", "-", "G#4", "B4", "E5", "-", "-", "-"
      ],
      drum: "....s.......s.......s.......s.h."
    },
    rock: {
      bpm: 104,
      bass: [
        "A2", "-", "A2", "-", "E2", "-", "G2", "-",
        "A2", "-", "A2", "G2", "F2", "-", "G2", "-",
        "F2", "-", "F2", "-", "C2", "-", "F2", "-",
        "G2", "-", "G2", "-", "E2", "-", "G2", "E2"
      ],
      arp: [
        ["A3", "C4", "E4"],
        ["A3", "C4", "G4"],
        ["F3", "A3", "C4"],
        ["G3", "B3", "D4"]
      ],
      lead: [
        "A4", "-", "C5", "-", "E5", "-", "D5", "C5",
        "B4", "-", "G4", "-", "A4", "-", "-", "-",
        "F5", "-", "E5", "-", "C5", "-", "A4", "C5",
        "D5", "-", "B4", "G4", "E5", "-", "-", "-"
      ],
      leadB: [
        "E5", "-", "G5", "E5", "D5", "-", "C5", "-",
        "B4", "C5", "D5", "B4", "C5", "-", "A4", "-",
        "C5", "-", "A4", "F4", "G4", "-", "A4", "B4",
        "C5", "-", "D5", "-", "E5", "-", "-", "-"
      ],
      drum: "k.h.s.h.k.k.s.h.k.h.s.h.k.h.s.hh"
    },
    ruin: {
      bpm: 110,
      bass: [
        "D2", "-", "D2", "A2", "D2", "-", "C2", "-",
        "Bb1", "-", "Bb1", "F2", "C2", "-", "A1", "-",
        "D2", "-", "D2", "A2", "F2", "-", "G2", "-",
        "Eb2", "-", "Eb2", "-", "A1", "-", "A2", "-"
      ],
      arp: [
        ["D3", "F3", "A3", "C4"],
        ["Bb2", "D3", "F3", "A3"],
        ["G3", "Bb3", "D4", "F4"],
        ["A2", "C#3", "E3", "G3"]
      ],
      lead: [
        "A4", "-", "D5", "E5", "F5", "-", "E5", "D5",
        "C5", "-", "A4", "F4", "G4", "-", "A4", "-",
        "Bb4", "-", "D5", "F5", "G5", "-", "F5", "D5",
        "E5", "-", "C#5", "A4", "D5", "-", "-", "-"
      ],
      leadB: [
        "F5", "-", "E5", "D5", "A4", "-", "D5", "-",
        "C5", "D5", "C5", "Bb4", "A4", "-", "-", "-",
        "G4", "-", "Bb4", "D5", "F5", "-", "E5", "D5",
        "C#5", "-", "E5", "-", "A4", "-", "-", "-"
      ],
      drum: "k..hk.s.k.h.k.s.k..hk.s.k.k.s.hh"
    },
    crypt: {
      bpm: 126,
      bass: [
        "E2", "E2", "B1", "E2", "G2", "E2", "B1", "E2",
        "C2", "C2", "G1", "C2", "D2", "D2", "A1", "D2",
        "A1", "A1", "E2", "A1", "F2", "F2", "C2", "F2",
        "B1", "B1", "F#2", "B1", "D#2", "B1", "F#2", "B1"
      ],
      arp: [
        ["E3", "G3", "B3", "E4"],
        ["C3", "E3", "G3", "B3"],
        ["A3", "C4", "E4", "A4"],
        ["B2", "D#3", "F#3", "B3"]
      ],
      lead: [
        "B4", "-", "E5", "F#5", "G5", "-", "F#5", "E5",
        "D#5", "-", "B4", "-", "E5", "-", "-", "-",
        "C5", "-", "E5", "G5", "A5", "-", "G5", "F5",
        "F#5", "-", "D#5", "-", "B4", "-", "-", "-"
      ],
      leadB: [
        "E5", "D#5", "E5", "F#5", "G5", "-", "B5", "-",
        "A5", "-", "G5", "E5", "F#5", "-", "-", "-",
        "G5", "F#5", "E5", "C5", "B4", "-", "E5", "G5",
        "F#5", "-", "D#5", "B4", "E5", "-", "-", "-"
      ],
      drum: "k.h.s.h.k.k.s.h.k.h.s.k.k.s.s.hh"
    }
  };

  /* ---------- Web Audio API 初期化 ---------- */
  function ensureAC() {
    if (!AC) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        AC = new Ctx();
        master = AC.createGain();
        master.gain.value = 0.42;
        master.connect(AC.destination);
        /* ノイズバッファ生成（パーカッション＆効果音用） */
        const len = AC.sampleRate * 1.0;
        noiseBuf = AC.createBuffer(1, len, AC.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      }
    }
    if (AC && AC.state === "suspended") {
      try { AC.resume(); } catch (e) {}
    }
  }

  function init() {
    if (ready && AC && AC.state === "running") return;
    ready = true;
    try {
      ensureAC();
      if (window.Tone && Tone.context && Tone.context.state !== "running") {
        try { Tone.start(); } catch (e) {}
      }
      mode = AC ? "webaudio" : "none";
    } catch (e) {
      mode = "none";
    }
  }

  /* ---------- シンセ基本発音関数 ---------- */
  function osc(freq, dur, type, vol, delay, endFreq, attack) {
    if (muted) return;
    ensureAC();
    if (!AC) return;
    const f0 = noteFreq(freq);
    if (!f0 || f0 <= 0) return;
    const t0 = AC.currentTime + (delay || 0);
    const atk = attack || 0.004;
    const o = AC.createOscillator();
    const g = AC.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(f0, t0);
    if (endFreq) {
      const f1 = Math.max(25, noteFreq(endFreq));
      o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    }
    const peak = Math.max(0.001, vol || 0.12);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.01);
  }

  function noise(dur, vol, delay, filterFreq, filterType) {
    if (muted) return;
    ensureAC();
    if (!AC || !noiseBuf) return;
    const t0 = AC.currentTime + (delay || 0);
    const src = AC.createBufferSource();
    src.buffer = noiseBuf;
    const flt = AC.createBiquadFilter();
    flt.type = filterType || "bandpass";
    flt.frequency.setValueAtTime(filterFreq || 1400, t0);
    const g = AC.createGain();
    g.gain.setValueAtTime(Math.max(0.001, vol || 0.08), t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    src.connect(flt);
    flt.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.01);
  }

  /* ---------- 効果音テーブル（多層チップチューンSE） ---------- */
  const SFX = {
    step: () => {
      stepFlip ^= 1;
      osc(stepFlip ? 135 : 152, 0.032, "triangle", 0.055, 0, stepFlip ? 85 : 95);
      noise(0.022, 0.025, 0, stepFlip ? 900 : 1100, "bandpass");
    },
    splash: () => {
      osc(380, 0.06, "sine", 0.07, 0, 620);
      osc(540, 0.07, "sine", 0.06, 0.04, 880);
      noise(0.08, 0.05, 0, 2200, "bandpass");
    },
    bump: () => {
      osc(115, 0.065, "square", 0.09, 0, 55);
      noise(0.04, 0.04, 0, 400, "lowpass");
    },
    swing: () => {
      noise(0.055, 0.06, 0, 1800, "bandpass");
      osc(340, 0.045, "triangle", 0.06, 0, 140);
    },
    hit: () => {
      noise(0.06, 0.14, 0, 1400, "bandpass");
      osc(210, 0.06, "square", 0.16, 0, 85);
      osc(120, 0.09, "sawtooth", 0.14, 0.02, 55);
    },
    crit: () => {
      osc("A5", 0.05, "square", 0.16, 0, "E6");
      osc("E5", 0.08, "square", 0.18, 0.03, "A3");
      osc(180, 0.12, "sawtooth", 0.2, 0.04, 50);
      noise(0.11, 0.18, 0.02, 2200, "highpass");
    },
    kill: () => {
      osc("A4", 0.06, "square", 0.14, 0);
      osc("E4", 0.06, "square", 0.14, 0.045);
      osc("A3", 0.11, "sawtooth", 0.16, 0.09, 65);
      osc("E5", 0.08, "triangle", 0.12, 0.11, "A5");
      noise(0.14, 0.14, 0.03, 1200, "bandpass");
    },
    hurt: () => {
      osc(220, 0.14, "sawtooth", 0.2, 0, 62);
      osc(165, 0.14, "square", 0.15, 0.01, 48);
      noise(0.09, 0.14, 0, 900, "lowpass");
    },
    miss: () => {
      noise(0.05, 0.06, 0, 2600, "bandpass");
      osc(680, 0.045, "sine", 0.05, 0, 280);
    },
    pick: () => {
      osc("E5", 0.055, "square", 0.12, 0);
      osc("B5", 0.09, "square", 0.13, 0.045);
      osc("E6", 0.08, "triangle", 0.09, 0.09);
    },
    equip: () => {
      noise(0.03, 0.08, 0, 3200, "highpass");
      osc("D5", 0.05, "square", 0.12, 0);
      osc("A5", 0.06, "square", 0.13, 0.04);
      osc("D6", 0.12, "triangle", 0.14, 0.08);
    },
    coin: () => {
      osc("B5", 0.055, "square", 0.13, 0);
      osc("E6", 0.14, "square", 0.14, 0.05);
      osc("B6", 0.12, "triangle", 0.08, 0.055);
    },
    eat: () => {
      noise(0.045, 0.09, 0, 1100, "bandpass");
      osc("A3", 0.055, "triangle", 0.12, 0, "F3");
      noise(0.045, 0.09, 0.08, 1250, "bandpass");
      osc("C4", 0.065, "triangle", 0.12, 0.08, "A3");
      osc("F4", 0.09, "sine", 0.1, 0.16);
    },
    drink: () => {
      ["G3", "B3", "D4", "G4", "B4", "G5"].forEach((f, i) => {
        osc(f, 0.065, i < 3 ? "sine" : "triangle", 0.12, i * 0.042);
      });
    },
    scroll: () => {
      noise(0.18, 0.09, 0, 1900, "bandpass");
      ["C5", "E5", "G5", "B5", "E6"].forEach((f, i) => {
        osc(f, 0.1, "triangle", 0.12, 0.03 + i * 0.045);
        osc(f, 0.08, "square", 0.06, 0.035 + i * 0.045);
      });
    },
    zap: () => {
      osc(1100, 0.07, "square", 0.14, 0, 260);
      osc(880, 0.09, "sawtooth", 0.12, 0.03, 180);
      noise(0.06, 0.08, 0.02, 2800, "highpass");
    },
    boom: () => {
      noise(0.34, 0.22, 0, 650, "lowpass");
      osc(180, 0.32, "sawtooth", 0.2, 0, 38);
      osc(95, 0.35, "square", 0.16, 0.02, 32);
    },
    magic: () => {
      ["E5", "G#5", "B5", "E6"].forEach((f, i) => osc(f, 0.08, "triangle", 0.12, i * 0.04));
    },
    level: () => {
      const notes = ["A4", "C#5", "E5", "A5", "E5", "A5"];
      const durs = [0.08, 0.08, 0.08, 0.14, 0.08, 0.28];
      let t = 0;
      notes.forEach((f, i) => {
        osc(f, durs[i], "square", 0.15, t);
        osc(f, durs[i] * 1.1, "triangle", 0.12, t + 0.01);
        t += durs[i] * 0.88;
      });
      osc("A3", 0.3, "triangle", 0.14, t - 0.24);
    },
    stairs: () => {
      ["E4", "B3", "G3", "E3"].forEach((f, i) => {
        osc(f, 0.07, "triangle", 0.11, i * 0.065);
        noise(0.03, 0.04, i * 0.065, 900, "bandpass");
      });
    },
    die: () => {
      ["A4", "F4", "D4", "A3", "A2"].forEach((f, i) => {
        osc(f, 0.22, "sawtooth", 0.16, i * 0.13);
      });
      noise(0.45, 0.14, 0.1, 500, "lowpass");
    },
    win: () => {
      const mel = ["C5", "E5", "G5", "C6", "G5", "C6", "E6"];
      const dur = [0.09, 0.09, 0.09, 0.16, 0.09, 0.12, 0.38];
      let t = 0;
      mel.forEach((f, i) => {
        osc(f, dur[i], "square", 0.15, t);
        osc(f, dur[i] * 1.1, "triangle", 0.12, t);
        t += dur[i] * 0.9;
      });
      osc("C4", 0.4, "triangle", 0.15, t - 0.35);
      osc("G4", 0.4, "triangle", 0.12, t - 0.35);
    },
    error: () => {
      osc("A2", 0.06, "square", 0.09, 0);
      osc("F2", 0.08, "square", 0.09, 0.055);
    },
    poison: () => {
      osc(340, 0.1, "sine", 0.13, 0, 140);
      osc(280, 0.12, "triangle", 0.11, 0.07, 110);
    },
    steal: () => {
      osc("D6", 0.05, "square", 0.12, 0);
      osc("A5", 0.05, "square", 0.12, 0.04);
      osc("G3", 0.1, "square", 0.12, 0.08);
    },
    web: () => {
      noise(0.09, 0.09, 0, 1600, "bandpass");
      osc(260, 0.08, "triangle", 0.09, 0, 120);
    },
    rest: () => {
      osc("A3", 0.18, "sine", 0.08, 0);
      osc("E4", 0.22, "sine", 0.07, 0.06);
    },
    book: () => {
      noise(0.045, 0.05, 0, 2400, "highpass");
      osc("A5", 0.04, "triangle", 0.08, 0);
      osc("E6", 0.05, "triangle", 0.07, 0.03);
    },
    ui: () => {
      osc("E5", 0.03, "triangle", 0.07, 0);
    },
    quest: () => {
      ["C5", "G5", "C6"].forEach((f, i) => osc(f, 0.14, "triangle", 0.14, i * 0.09));
    }
  };

  function sfx(name) {
    if (muted) return;
    if (!ready) init();
    const f = SFX[name];
    if (f) { try { f(); } catch (e) {} }
  }

  /* ---------- BGM シーケンサ（4ch: Bass / Arp / Lead / Drum） ---------- */
  function tickBgm() {
    if (muted || !bgmBiome) return;
    ensureAC();
    if (!AC || AC.state !== "running") return;

    const S = SONGS[bgmBiome] || SONGS.rock;
    const stepSec = 60 / S.bpm / 4; /* 16分音符 */
    const st = bgmStep % 32;
    const cycle = Math.floor(bgmStep / 32);
    const bar = Math.floor(st / 8) % 4;

    /* 1. Bass (Triangle + 軽い倍音) */
    const bNote = S.bass[st];
    if (bNote && bNote !== "-") {
      osc(bNote, stepSec * 1.75, "triangle", 0.085, 0);
      osc(bNote, stepSec * 0.9, "square", 0.02, 0);
    }

    /* 2. Arpeggio (Pulse/Square 16分アルペジオ) */
    const chord = S.arp[bar];
    if (chord && chord.length) {
      const aNote = chord[st % chord.length];
      osc(aNote, stepSec * 0.85, "square", bgmBiome === "title" ? 0.026 : 0.022, 0);
    }

    /* 3. Lead Melody (偶数サイクルと奇数サイクルでA/Bメロ展開) */
    const leadArr = (cycle % 2 === 1 && S.leadB) ? S.leadB : S.lead;
    const lNote = leadArr ? leadArr[st] : "-";
    if (lNote && lNote !== "-") {
      const nextDash = leadArr[(st + 1) % 32] === "-";
      const dur = stepSec * (nextDash ? 1.85 : 0.92);
      osc(lNote, dur, bgmBiome === "title" ? "triangle" : "square", 0.048, 0, null, 0.008);
      /* ディレイ・エコー（残響感） */
      osc(lNote, dur * 0.75, "triangle", 0.018, stepSec * 1.5, null, 0.01);
    }

    /* 4. Drums (Kick / Snare / Hi-hat) */
    if (S.drum) {
      const dCh = S.drum[st % S.drum.length];
      if (dCh === "k") {
        osc(125, 0.075, "triangle", 0.09, 0, 36);
        noise(0.02, 0.025, 0, 300, "lowpass");
      } else if (dCh === "s") {
        noise(0.075, 0.042, 0, 1800, "bandpass");
        osc(190, 0.045, "triangle", 0.045, 0, 95);
      } else if (dCh === "h") {
        noise(0.025, 0.018, 0, 5200, "highpass");
      }
    }

    bgmStep++;
  }

  function bgm(biome) {
    if (muted) { bgmBiome = biome; return; }
    if (!ready) init();
    if (bgmBiome === biome && bgmTimer) return;
    stopBgm();
    bgmBiome = biome;
    bgmStep = 0;
    const S = SONGS[biome] || SONGS.rock;
    const stepMs = Math.round((60 / S.bpm / 4) * 1000);
    bgmTimer = setInterval(tickBgm, stepMs);
  }

  function stopBgm() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
    bgmBiome = null;
  }

  function setMuted(m) {
    muted = m;
    localStorage.setItem("ld_sound", m ? "0" : "1");
    if (m) {
      if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    } else if (bgmBiome) {
      const b = bgmBiome;
      bgmBiome = null;
      bgm(b);
    }
  }

  return { init, sfx, bgm, stopBgm, setMuted, isMuted: () => muted, mode: () => mode };
})();
