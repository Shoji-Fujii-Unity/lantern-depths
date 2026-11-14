/* ============================================================
   六層の灯 −LANTERN DEPTHS− / game.js
   元ゲーム NetHack Lite の仕様を継承したドット絵版。
   ============================================================ */
"use strict";

const COLS = 39, ROWS = 29, TS = 16, AMULET_DEPTH = 6;
const LIDX = { ja: 0, en: 1, zh: 2 };
const K_SAVE = "ld_save", K_SCORE = "ld_scores", K_NAME = "ld_name", K_LANG = "ld_lang", K_DIFF = "ld_diff", K_BOOK = "ld_book";

/* ================= i18n ================= */
const I18N = {
  ja: {
    newGame: "冒険開始", cont: "続きから", scores: "ハイスコア", close: "閉じる", save: "スコアを保存", keep: "そのまま潜る",
    deathTitle: "倒れた…", win: "勝利！", victoryMsg: "ヨンドアの護符を手に入れた！",
    name: "冒険者名", hero: "灯守", diff: "難易度", dEasy: "やすらか", dNorm: "ふつう", dHard: "死地",
    hint: "速いスワイプ＝移動／ゆっくりドラッグ＝視点。敵をタップでマジックミサイル。キー: 矢印 WASD hjkl(yubn) g拾う e食べる f魔法 >階段 .探索 m休息 Tab地図",
    hp: "HP", ac: "防御", lv: "Lv", gold: "金", depth: "深さ", xp: "経験", expl: "探索", kills: "討伐", turn: "手", cause: "最期", best: "最高",
    book: "図鑑", helpB: "操作", tabMob: "モンスター", tabItem: "アイテム", noBook: "まだ何も見ていない。",
    hunger0: "満腹", hunger1: "空腹", hunger2: "腹ペコ", hunger3: "飢え死に！",
    pickEmpty: "何も無い。", pick: "{X}を拾った。", eatMsg: "{X}を食べた。", noFood: "食べ物がない。", alreadyFull: "もう十分だ。",
    noStairs: "階段が見当たらない。", descend: "{X}階へ降りた…", ascend: "{X}階へ戻った。", goldMsg: "金貨{X}枚！", gearWorse: "今の装備より弱い。拾わなかった。",
    magicNone: "魔法の照準が見つからない。", wandHit: "{X}に{Y}のダメージ！", finger: "指から光が走った！({X} dmg)",
    crit: "会心の一撃！", lvlup: "レベルアップ！ Lv{X}", dieYou: "{X}を倒した！", dieMob: "{X}に殺された…",
    hitYou: "{X}の一撃！ -{D} HP", missYou: "{X}の攻撃をかわした。", starve: "空腹で倒れそうだ！",
    welcome: "ようこそ、{X}！深さ6の護符を探せ。", restDone: "休息した。", restStop: "休息をやめた。",
    poisSet: "{X}の毒が回った…", poisTick: "毒が体を削る。", webSet: "{X}の糸で足が止まった！",
    steal: "{X}に{G}金盗まれた！", breath: "{X}の灼熱の息！ -{D}", rock: "{X}の石が直撃！ -{D}", drain: "{X}に経験を吸われた…",
    ghostNote: "{X}は壁を抜けてきた！", trollNote: "{X}の傷が塞がった。", zombNote: "{X}は硬い！",
    fntHeal: "泉水を飲んだ。傷が癒える。", fntBad: "泉水は濁っていた… -{D}", fntFull: "これ以上飲めない。",
    stairWarn: "探索{X}％だ。本当に降りる？もう一度 > を押すと降ります。",
    explStart: "探索を始める。", explStop: "探索をやめた。", explDone: "この階は見尽くした。",
    wonHint: "護符を手に入れた！ 深層を潜ってスコアを伸ばせる。", killedBy: "{X}にやられた", byHunger: "飢え",
    tipDepth: "深さ", libNote: "Powered by GSAP / Tone.js / DotGothic16"
  },
  en: {
    newGame: "Start Adventure", cont: "Continue", scores: "High Scores", close: "Close", save: "Save Score", keep: "Keep Descending",
    deathTitle: "You Died", win: "Victory!", victoryMsg: "You got the Amulet of Yendor!",
    name: "Hero name", hero: "Warden", diff: "Difficulty", dEasy: "Calm", dNorm: "Normal", dHard: "Death",
    hint: "Quick flick = move / slow drag = pan camera. Tap a monster to zap it. Keys: arrows WASD hjkl(yubn) g pick e eat f magic > stairs . explore m rest Tab map",
    hp: "HP", ac: "AC", lv: "Lv", gold: "Gold", depth: "Depth", xp: "XP", expl: "Map", kills: "Kills", turn: "Turn", cause: "Slain by", best: "Best",
    book: "Bestiary", helpB: "Keys", tabMob: "Monsters", tabItem: "Items", noBook: "Nothing discovered yet.",
    hunger0: "Satiated", hunger1: "Hungry", hunger2: "Weak", hunger3: "Fainting!",
    pickEmpty: "You see nothing here.", pick: "Picked up {X}.", eatMsg: "You eat the {X}.", noFood: "Nothing to eat.", alreadyFull: "You are already full.",
    noStairs: "No stairs here.", descend: "Descended to depth {X}…", ascend: "Returned to depth {X}.", goldMsg: "You pick up {X} gold pieces!", gearWorse: "Your current gear is better. You leave it.",
    magicNone: "No target in sight.", wandHit: "{X} takes {Y} damage!", finger: "Your finger glows! ({X} dmg)",
    crit: "Critical hit!", lvlup: "Level up! Now Lv {X}.", dieYou: "You slay {X}!", dieMob: "You are killed by {X}…",
    hitYou: "{X} hits you! -{D} HP", missYou: "{X} misses.", starve: "You are dying of hunger!",
    welcome: "Welcome, {X}! Find the Amulet at depth 6.", restDone: "You rest.", restStop: "You stop resting.",
    poisSet: "{X}'s venom courses through you…", poisTick: "The poison sears you.", webSet: "{X} webs your feet!",
    steal: "{X} steals {G} gold!", breath: "{X} breathes fire! -{D}", rock: "{X} hurls a rock! -{D}", drain: "{X} drains your experience…",
    ghostNote: "{X} drifts through the wall!", trollNote: "{X}'s wound closes.", zombNote: "{X} is tough!",
    fntHeal: "You drink from the fountain. You feel better.", fntBad: "The fountain is foul… -{D}", fntFull: "You cannot drink more.",
    stairWarn: "Only {X}% explored. Press > again to descend anyway.",
    explStart: "Exploring.", explStop: "Exploration stopped.", explDone: "This level is fully explored.",
    wonHint: "The Amulet is yours! Keep descending for a higher score.", killedBy: "slain by {X}", byHunger: "hunger",
    tipDepth: "Depth", libNote: "Powered by GSAP / Tone.js / DotGothic16"
  },
  zh: {
    newGame: "开始冒险", cont: "继续", scores: "排行榜", close: "关闭", save: "保存分数", keep: "继续下潜",
    deathTitle: "你死了", win: "胜利！", victoryMsg: "你获得了护身符！",
    name: "勇者名字", hero: "守灯人", diff: "难度", dEasy: "轻松", dNorm: "普通", dHard: "死地",
    hint: "快划＝移动 / 慢拖＝移动视角。点击敌人发射魔法。按键：方向 WASD hjkl(yubn) g拾取 e吃 f魔法 >楼梯 .探索 m休息 Tab地图",
    hp: "HP", ac: "防御", lv: "等级", gold: "金币", depth: "深度", xp: "经验", expl: "探索", kills: "击杀", turn: "回合", cause: "死因", best: "最高",
    book: "图鉴", helpB: "操作", tabMob: "怪物", tabItem: "道具", noBook: "尚未发现任何内容。",
    hunger0: "饱食", hunger1: "饥饿", hunger2: "虚弱", hunger3: "快饿死了！",
    pickEmpty: "这里什么也没有。", pick: "拾取了{X}。", eatMsg: "你吃了{X}。", noFood: "没有食物。", alreadyFull: "你已经吃饱了。",
    noStairs: "这里没有楼梯。", descend: "下到了{X}层…", ascend: "回到了{X}层。", goldMsg: "拾取了{X}枚金币！", gearWorse: "你已有更好的装备，没有拾取。",
    magicNone: "视野中没有目标。", wandHit: "{X}受到{Y}点伤害！", finger: "指尖放出光芒！({X}伤害)",
    crit: "会心一击！", lvlup: "升级！现在是 Lv {X}。", dieYou: "你击败了{X}！", dieMob: "你被{X}杀死了…",
    hitYou: "{X}攻击了你！-{D} HP", missYou: "{X}的攻击落空了。", starve: "快要饿死了！",
    welcome: "欢迎你，{X}！在深度6寻找护身符。", restDone: "你休息了一会儿。", restStop: "你停止了休息。",
    poisSet: "{X}的毒液流遍全身…", poisTick: "毒液侵蚀着你。", webSet: "{X}的蛛网缠住了你！",
    steal: "{X}偷走了{G}金币！", breath: "{X}喷出烈焰！-{D}", rock: "{X}掷出石块！-{D}", drain: "{X}吸取了你的经验…",
    ghostNote: "{X}穿墙而来！", trollNote: "{X}的伤口愈合了。", zombNote: "{X}很硬！",
    fntHeal: "你喝了泉水，伤处愈合。", fntBad: "泉水浑浊不堪…-{D}", fntFull: "再也喝不下了。",
    stairWarn: "只探索了{X}%。再按一次 > 仍要下去。",
    explStart: "开始探索。", explStop: "探索中止。", explDone: "本层已全部探索。",
    wonHint: "护身符到手！可继续下潜刷分。", killedBy: "被{X}杀死", byHunger: "饥饿",
    tipDepth: "深度", libNote: "使用 GSAP / Tone.js / DotGothic16"
  }
};

/* ================= モンスター／アイテム定義 ================= */
/* 数値は NetHack Lite から継承。全11種のモンスターに固有2フレームスプライトを割り当て */
const MOBS = [
  { id: "rat", s: "r", art: "rat", art2: "rat2", scale: .88, hp: 4, dmg: [1, 3], xp: 2, min: 1, trait: "quick",
    n: ["巨大ネズミ", "giant rat", "巨鼠"], d: ["素早い。ときどき2回動く。", "Quick: sometimes moves twice.", "行动敏捷，偶尔移动两次。"] },
  { id: "kobold", s: "k", art: "kobold", art2: "kobold2", scale: .92, hp: 6, dmg: [1, 4], xp: 4, min: 1, trait: "rock",
    n: ["コーボールド", "kobold", "狗头人"], d: ["遠くから石を投げてくる。", "Hurls rocks from a distance.", "会从远处投掷石块。"] },
  { id: "bat", s: "b", art: "bat0", art2: "bat1", scale: .88, hp: 5, dmg: [1, 3], xp: 3, min: 1, trait: "erratic",
    n: ["ジャイアントバット", "giant bat", "大蝙蝠"], d: ["不規則に飛び回り、咬んでくる。", "Flits about erratically.", "不规则地乱飞。"] },
  { id: "goblin", s: "g", art: "goblin", art2: "goblin2", scale: .96, hp: 10, dmg: [1, 6], xp: 8, min: 2, trait: "steal",
    n: ["ゴブリン", "goblin", "哥布林"], d: ["金を盗んで逃げる。", "Steals gold and flees.", "偷金币后逃跑。"] },
  { id: "snake", s: "S", art: "snake", art2: "snake2", scale: .96, hp: 9, dmg: [2, 4], xp: 9, min: 2, trait: "poison",
    n: ["大蛇", "snake", "大蛇"], d: ["咬まれると毒を受ける。", "Its bite poisons you.", "被咬会中毒。"] },
  { id: "zombie", s: "Z", art: "zombie", art2: "zombie2", scale: 1.0, hp: 14, dmg: [1, 8], xp: 12, min: 3, trait: "tough",
    n: ["ゾンビ", "zombie", "僵尸"], d: ["打たれ強く、動きは鈍い。", "Tough, but slow.", "坚硬但行动迟缓。"] },
  { id: "orc", s: "o", art: "orc", art2: "orc2", scale: 1.12, hp: 16, dmg: [1, 8], xp: 16, min: 3, trait: "fierce",
    n: ["オーク", "orc", "兽人"], d: ["一撃が重い。", "Strikes hard.", "攻击沉重。"] },
  { id: "spider", s: "x", art: "spider", art2: "spider2", scale: .98, hp: 14, dmg: [2, 5], xp: 18, min: 4, trait: "web",
    n: ["ジャイアントスパイダー", "giant spider", "巨蜘蛛"], d: ["糸で足を止め、毒を置く。", "Webs you and injects venom.", "用蛛网定身并下毒。"] },
  { id: "ghost", s: "h", art: "ghost", art2: "ghost2", scale: 1.02, hp: 18, dmg: [2, 6], xp: 26, min: 4, trait: "drain",
    n: ["幽霊", "ghost", "幽灵"], d: ["壁を抜け、経験を吸う。", "Passes walls, drains XP.", "穿墙并吸取经验。"] },
  { id: "troll", s: "T", art: "troll", art2: "troll2", scale: 1.24, hp: 30, dmg: [3, 6], xp: 40, min: 5, trait: "regen",
    n: ["トロル", "troll", "巨魔"], d: ["傷が自然に塞がる。", "Regenerates wounds.", "伤口会自动愈合。"] },
  { id: "dragon", s: "D", art: "dragon", art2: "dragon2", scale: 1.32, hp: 50, dmg: [4, 8], xp: 90, min: 6, trait: "breath",
    n: ["レッドドラゴン", "red dragon", "红龙"], d: ["直線状に火炎ブレス。", "Breathes fire in a line.", "直线喷火。"] }
];
const MOBDEF = {}; MOBS.forEach(m => MOBDEF[m.id] = m);

const ITN = {
  heal: ["治療薬", "potion of healing", "治疗药水"], poison: ["毒薬", "poison potion", "毒药"],
  scrollT: ["テレポートの巻物", "scroll of teleportation", "传送卷轴"], scrollL: ["照明の巻物", "scroll of light", "照明卷轴"],
  food: ["保存食", "food ration", "口粮"], wand: ["マジックミサイルの杖", "wand of magic missile", "魔法飞弹杖"],
  amulet: ["ヨンドアの護符", "Amulet of Yendor", "尤恩多尔护身符"], fountain: ["泉水", "fountain", "泉水"],
  rock: ["岩", "rock", "岩石"], moss: ["光る苔", "glowing moss", "发光苔"], water: ["浅い水", "shallow water", "浅水"]
};
const WEAPONS = [
  { n: ["短剣", "dagger", "匕首"], d: [1, 4], spr: "wpn0" },
  { n: ["レイピア", "rapier", "细剑"], d: [1, 6], spr: "wpn1" },
  { n: ["ロングソード", "long sword", "长剑"], d: [1, 8], spr: "wpn2" },
  { n: ["ドラゴンスレイヤー", "dragon slayer", "屠龙剑"], d: [2, 7], spr: "wpn3" }
];
const ARMORS = [
  { n: ["革鎧", "leather armor", "皮甲"], a: 3, spr: "arm0" },
  { n: ["鎖帷子", "chain mail", "锁甲"], a: 6, spr: "arm1" },
  { n: ["プレート", "plate mail", "板甲"], a: 9, spr: "arm2" }
];
const ITICON = { heal: "pHeal", poison: "pPois", scrollT: "scroll", scrollL: "scrollL", food: "ration", wand: "wand", amulet: "amulet", wpn: "sword", armor: "armor", gold: "gold", fountain: "fountain" };
const DIFFS = { easy: { dmg: .7, cnt: .8, xp: 1.25, hp: 15 }, normal: { dmg: 1, cnt: 1, xp: 1, hp: 12 }, hard: { dmg: 1.35, cnt: 1.35, xp: .9, hp: 10 } };

/* ================= 状態 ================= */
let S = null,
  lang = ["ja", "en", "zh"].indexOf(localStorage.getItem(K_LANG)) >= 0 ? localStorage.getItem(K_LANG) : "ja",
  diff = Object.prototype.hasOwnProperty.call(DIFFS, localStorage.getItem(K_DIFF)) ? localStorage.getItem(K_DIFF) : "normal";
let cell = 24, visW = 15, visH = 16, cellOverride = 0, busy = false, warnDown = false;
let mapMode = 1; /* 0: 小, 1: 標準, 2: 大 */
const cam = { x: 0, y: 0, follow: true, shake: 0, sx: 0, sy: 0 };
const fx = [], parts = [], floats = [], amb = [];
let forceReveal = false;   /* デバッグ/スクリーンショット用: 全マス可視化 */
let flash = 0, flashCol = "#ff3a2a";
let book = JSON.parse(localStorage.getItem(K_BOOK) || '{"seen":{},"items":{}}');
const $ = id => document.getElementById(id);
function T(k, r) { let t = (I18N[lang] && I18N[lang][k]) || k; if (r) for (const p in r) t = t.split("{" + p + "}").join(r[p]); return t; }
const rnd = n => Math.floor(Math.random() * n), d = s => 1 + rnd(s), D = () => DIFFS[diff] || DIFFS.normal;
const mobName = m => MOBDEF[m.id] ? MOBDEF[m.id].n[LIDX[lang]] : m.id;
function itemName(it) {
  if (it.kind === "wpn") return WEAPONS[it.tier || 0].n[LIDX[lang]];
  if (it.kind === "armor") return ARMORS[it.tier || 0].n[LIDX[lang]];
  return ITN[it.kind] ? ITN[it.kind][LIDX[lang]] : it.kind;
}
function itemSprKey(it) {
  if (!it) return "sword";
  if (it.kind === "wpn") return WEAPONS[it.tier || 0] ? WEAPONS[it.tier || 0].spr : "sword";
  if (it.kind === "armor") return ARMORS[it.tier || 0] ? ARMORS[it.tier || 0].spr : "armor";
  return ITICON[it.kind] || "gold";
}
const biomeOf = dp => dp <= 2 ? "rock" : dp <= 4 ? "ruin" : "crypt";
const biomeName = b => (PX.BIOME[b] && PX.BIOME[b].name) ? PX.BIOME[b].name[LIDX[lang]] : b;
const isWall = (L, x, y) => x < 0 || y < 0 || x >= COLS || y >= ROWS || L.grid[y][x] === "#";

/* ================= スプライト生成 ================= */
const SPR = {}, TILE = {}, WATER = {}, ICONU = {}, ICN = {};
function buildSprites() {
  PX.buildDigits();
  for (const k in ART.sprites) SPR[k] = PX.grid2cv(ART.sprites[k]);
  SPR.fountain0 = SPR.fountain;
  SPR.fountain1 = SPR.fountain2;
  for (const id in MOBDEF) {
    const m = MOBDEF[id];
    const mk = artName => {
      if (!artName || !ART.sprites[artName]) return null;
      let c = m.pal ? PX.grid2cv(ART.sprites[artName], m.pal) : SPR[artName];
      if (!c) return null;
      if (id === "ghost") c = PX.tint(c, "#9fc8ff", .22);
      return c;
    };
    const base = mk(m.art);
    const alt = mk(m.art2) || base;
    SPR["mob_" + id] = base;
    SPR["mob_" + id + "0"] = base;
    SPR["mob_" + id + "1"] = alt;
    SPR["mobd_" + id] = base ? PX.shade(base, 2.6) : null;
    SPR["mobd_" + id + "0"] = SPR["mobd_" + id];
    SPR["mobd_" + id + "1"] = alt ? PX.shade(alt, 2.6) : SPR["mobd_" + id];
  }
  for (const b of ["rock", "ruin", "crypt"]) {
    WATER[b] = [0, 1, 2].map(f => PX.mkWater(b, f, 2));
    TILE[b] = {
      fl: [0, 1, 2, 3].map(v => PX.mkFloor(b, v, 3)),
      wb: [0, 1, 2].map(v => PX.mkWall(b, "body", v + 1)),
      wt: [0, 1].map(v => PX.mkWall(b, "top", v + 1)),
      torch: PX.mkWall(b, "torch", 9)
    };
  }
  for (const k in ITICON) ICONU[k] = SPR[ITICON[k]] ? SPR[ITICON[k]].toDataURL() : "";
  for (const k of ["bag", "bread", "wand", "stairs", "compass", "book", "snd", "mute", "help", "eye", "sword", "shield", "drop", "map"])
    ICONU["i_" + k] = PX.iconURL(k);
  for (const k of ["0,-1", "0,1", "-1,0", "1,0", "-1,-1", "1,-1", "-1,1", "1,1"]) ICONU["a_" + k] = PX.iconURL(k, "#dbe4f5");
  /* HUD 用の dataURL は作り置き（段階別武器・防具も含む） */
  for (const k of ["pHeal", "pPois", "scroll", "scrollL", "ration", "wand", "sword", "wpn0", "wpn1", "wpn2", "wpn3", "armor", "arm0", "arm1", "arm2", "gold", "amulet", "fountain"]) {
    ICN[k] = SPR[k] ? SPR[k].toDataURL() : "";
  }
}

/* ================= 階段・視界 ================= */
function los(L, x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx - dy, x = x0, y = y0;
  for (let i = 0; i < 200; i++) {
    if (x === x1 && y === y1) return true;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    if (x === x1 && y === y1) return true;
    if (isWall(L, x, y)) return false;
  }
  return false;
}
function genLevel(depth) {
  const L = { depth: depth, biome: biomeOf(depth), grid: [], explored: [], visible: [], light: [], mons: [], items: [], decor: {}, torch: {}, spawn: { x: 3, y: 3 } };
  for (let y = 0; y < ROWS; y++) { L.grid.push(Array(COLS).fill("#")); L.explored.push(new Array(COLS).fill(0)); L.visible.push(new Array(COLS).fill(0)); L.light.push(new Array(COLS).fill(0)); }
  const rooms = []; let guard = 0;
  while (rooms.length < 9 + Math.min(5, depth) && guard++ < 400) {
    const w = 4 + rnd(8), h = 3 + rnd(5), x = 1 + rnd(COLS - w - 2), y = 1 + rnd(ROWS - h - 2);
    if (rooms.some(r => x < r.x2 + 1 && x + w > r.x - 1 && y < r.y2 + 1 && y + h > r.y - 1)) continue;
    rooms.push({ x: x, y: y, x2: x + w - 1, y2: y + h - 1, cx: (x + x + w - 1) >> 1, cy: (y + y + h - 1) >> 1 });
  }
  if (!rooms.length) rooms.push({ x: 1, y: 1, x2: 6, y2: 4, cx: 3, cy: 2 });
  for (const r of rooms) for (let y = r.y; y <= r.y2; y++) for (let x = r.x; x <= r.x2; x++) L.grid[y][x] = ".";
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1], b = rooms[i]; let x = a.cx, y = a.cy;
    while (x !== b.cx) { if (L.grid[y][x] === "#") L.grid[y][x] = "."; x += x < b.cx ? 1 : -1; }
    while (y !== b.cy) { if (L.grid[y][x] === "#") L.grid[y][x] = "."; y += y < b.cy ? 1 : -1; }
    L.grid[y][x] = ".";
  }
  const R0 = rooms[0], Rn = rooms[rooms.length - 1];
  L.grid[Rn.y2][Rn.cx] = ">";
  if (depth > 1) L.grid[R0.cy][R0.cx] = "<";
  L.spawn = { x: R0.cx, y: R0.cy };

  const floors = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (L.grid[y][x] === ".") floors.push([x, y]);
  const far = f => { const f2 = floors.filter(f); return f2.length ? f2[rnd(f2.length)] : null; };
  const dis = p => Math.abs(p[0] - R0.cx) + Math.abs(p[1] - R0.cy);

  /* 松明: 壁に沿って灯りを配置 */
  let tc = 0;
  for (const p of floors) {
    if (dis(p) < 4) continue;
    if (L.grid[p[1] - 1] && L.grid[p[1] - 1][p[0]] === "#" && tc++ % 3 === 0 && Math.random() < .5) L.torch[p[0] + "," + (p[1] - 1)] = 1;
  }
  /* 装飾（通行可） */
  for (let i = 0; i < 7 + rnd(5); i++) {
    const p = far(q => L.grid[q[1]][q[0]] === "." && !L.decor[q[0] + "," + q[1]]);
    if (p) L.decor[p[0] + "," + p[1]] = { t: Math.random() < .42 ? "water" : (Math.random() < .5 ? "rock" : "moss"), v: rnd(3) };
  }
  /* 敵（数値は継承＋難易度補正） */
  const n = Math.round((6 + Math.floor(depth * 1.8)) * D().cnt), pool = MOBS.filter(m => m.min <= depth);
  for (let i = 0; i < n; i++) {
    const m = pool[rnd(pool.length)], p = far(q => dis(q) > 7 && !monsterAt(L, q[0], q[1]) && !L.decor[q[0] + "," + q[1]]);
    if (!p) continue;
    const hp = m.hp + (depth > m.min ? rnd(depth) : 0);
    L.mons.push({ id: m.id, x: p[0], y: p[1], dx: p[0], dy: p[1], face: 1, hp: hp, maxhp: hp, dmg: m.dmg, xp: m.xp, flee: 0, hurt: 0, wob: Math.random() * 6 });
  }
  /* アイテム（出現比率も継承） */
  const put = (kind, extra) => {
    const p = far(q => dis(q) > 3 && L.grid[q[1]][q[0]] === "." && !L.decor[q[0] + "," + q[1]] && itemAt(L, q[0], q[1]) < 0);
    if (p) L.items.push(Object.assign({ kind: kind, x: p[0], y: p[1], bob: Math.random() * 6 }, extra || {}));
  };
  if (depth === AMULET_DEPTH) put("amulet");
  for (let i = 0; i < 5 + Math.min(4, depth >> 1); i++) {
    const r = Math.random();
    if (r < .28) put(Math.random() < .75 ? "heal" : "poison");
    else if (r < .42) put("scrollT"); else if (r < .55) put("scrollL"); else if (r < .78) put("food");
    else if (r < .9) put("wpn", { tier: Math.min(3, depth >> 1) });
    else put("armor", { tier: Math.min(2, (depth / 3) | 0) });
  }
  for (let i = 0; i < 2; i++) put("food");
  if (depth === 1) put("wand"); else if (Math.random() < .4) put("wand");
  for (let i = 0; i < 4; i++) { const p = far(() => true); if (p) L.items.push({ kind: "gold", amt: 5 + rnd(20 * depth), x: p[0], y: p[1], bob: Math.random() * 6 }); }
  const fp = far(q => dis(q) > 5); if (fp) L.decor[fp[0] + "," + fp[1]] = { t: "fountain", v: 0 };
  return L;
}

const monsterAt = (L, x, y) => L.mons.find(m => m.x === x && m.y === y);
const itemAt = (L, x, y) => L.items.findIndex(it => it.x === x && it.y === y);
const cur = () => S.levels[S.depth];
const keyOf = (x, y) => x + "," + y;

/* 灯り: プレイヤーの灯＋松明。遠いほど暗い */
function updateVis() {
  const L = cur(), R = 9;
  for (let y = 0; y < ROWS; y++) { L.visible[y].fill(0); L.light[y].fill(0); }
  for (let y = Math.max(0, S.py - R); y <= Math.min(ROWS - 1, S.py + R); y++)
    for (let x = Math.max(0, S.px - R); x <= Math.min(COLS - 1, S.px + R); x++) {
      const dd = Math.sqrt((x - S.px) * (x - S.px) + (y - S.py) * (y - S.py));
      if (dd > R) continue;
      if ((x === S.px && y === S.py) || los(L, S.px, S.py, x, y)) {
        L.visible[y][x] = 1; L.explored[y][x] = 1;
        L.light[y][x] = Math.max(0, 1 - dd / (R + .5));
      }
    }
  for (const k in L.torch) {
    const p = k.split(","), tx = +p[0], ty = +p[1];
    for (let y = Math.max(0, ty - 4); y <= Math.min(ROWS - 1, ty + 4); y++)
      for (let x = Math.max(0, tx - 4); x <= Math.min(COLS - 1, tx + 4); x++) {
        const dd = Math.hypot(x - tx, y - ty);
        if (dd > 4 || L.grid[y][x] === "#" || !L.visible[y][x]) continue;
        L.light[y][x] = Math.min(1, Math.max(L.light[y][x], .85 - dd * .17));
      }
  }
  if (forceReveal) for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (L.grid[y][x] !== "#") { L.explored[y][x] = 1; L.visible[y][x] = 1; L.light[y][x] = 1; }
}

/* ================= 演出（VFX・パーティクル） ================= */
function msg(t, cls) { S.log.push({ t: t, c: cls || "c-sys" }); if (S.log.length > 4) S.log.shift(); refreshHud(); }
function addFloat(x, y, txt, col, big) {
  if (floats.length > 16) floats.shift();
  floats.push({ x: x + (Math.random() - .5) * .45, y: y + (Math.random() - .5) * .25, txt: txt, col: col, t: 0, life: 820, big: big ? 2 : 1 });
}
function burst(tx, ty, col, n, spd) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, v = (spd || 26) * (.4 + Math.random());
    parts.push({ x: tx + .5, y: ty + .5, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 12, c: col, t: 0, life: 380 + rnd(280), s: 1 + rnd(2) });
  }
}
function addSlash(x0, y0, x1, y1, col, crit) {
  fx.push({ kind: "slash", x: x1 + .5, y: y1 + .5, ang: Math.atan2(y1 - y0, x1 - x0), col: col || "#ffe066", crit: !!crit, t: 0, life: crit ? 280 : 210 });
}
function addRing(x, y, col, maxR, dur) {
  fx.push({ kind: "ring", x: x + .5, y: y + .5, col: col || "#ffe066", maxR: maxR || 1.6, t: 0, life: dur || 380 });
}
function addBeam(x0, y0, x1, y1, col) {
  fx.push({ kind: "beam", x0: x0 + .5, y0: y0 + .5, x1: x1 + .5, y1: y1 + .5, col: col || "#6fb0ff", t: 0, life: 260 });
  addRing(x1, y1, col || "#6fb0ff", 1.1, 300);
}
function shake(n) { cam.shake = Math.min(10, cam.shake + n); }
function doFlash(col, n) { flashCol = col; flash = n; }
const score = () => Math.floor(S.xp * 1.5) + S.gold + S.depth * 20 + S.lvl * 10 + S.kills * 3 + (S.won ? 500 : 0);

/* ================= ゲーム本体 ================= */
function newGame() {
  const nm = $("heroName").value.trim() || T("hero");
  localStorage.setItem(K_NAME, nm);
  S = {
    v: 1, name: nm, px: 3, py: 3, pdx: 3, pdy: 3, face: 1, hp: D().hp, maxhp: D().hp, lvl: 1, xp: 0, gold: 0, ac: 2,
    wepT: -1, armT: -1, depth: 1, turn: 0, hunger: 200, levels: {}, log: [], won: false, dead: false,
    inv: { heal: 0, poison: 0, scrollT: 0, scrollL: 0, food: 3, wand: 0 }, kills: 0, pois: 0, slow: 0, steps: 0
  };
  S.levels[1] = genLevel(1);
  const L = S.levels[1]; S.px = L.spawn.x; S.py = L.spawn.y; S.pdx = S.px; S.pdy = S.py;
  cam.x = clampCamX(S.px + .5 - visW / 2); cam.y = clampCamY(S.py + .5 - visH / 2); cam.follow = true;
  book.items.fountain = book.items.fountain || 0;
  msg(T("welcome", { X: nm }), "c-you");
  hideOverlays(); updateVis(); refreshHud(); saveRun(); SND.bgm(L.biome);
  toast("B1 · " + biomeName(L.biome));
}

function movePlayer(dx, dy, silent) {
  if (!S || S.dead || busy) return false;
  const L = cur(), nx = S.px + dx, ny = S.py + dy;
  if (dx) S.face = dx;
  if (isWall(L, nx, ny)) { if (!silent) { SND.sfx("bump"); bumpFX(nx, ny); } return false; }
  const m = monsterAt(L, nx, ny);
  if (m) { attack(m, L); cam.follow = true; endTurn(); return true; }
  /* 足元の砂埃エフェクト */
  parts.push({ x: S.px + .5, y: S.py + .82, vx: -dx * 8 + (Math.random() - .5) * 8, vy: -4 - Math.random() * 6, c: "#5d74a8", t: 0, life: 220, s: 1 });
  S.px = nx; S.py = ny; S.steps++;
  const dc = L.decor[keyOf(nx, ny)];
  if (dc && dc.t === "water") {
    SND.sfx("splash");
    addRing(nx, ny, "#54e6da", .75, 360);
    for (let i = 0; i < 4; i++) parts.push({ x: nx + .5, y: ny + .7, vx: (Math.random() - .5) * 18, vy: -16 - rnd(12), c: "#9be6ff", t: 0, life: 320, s: 1 });
  } else {
    SND.sfx("step");
  }
  cam.follow = true;
  const gi = itemAt(L, nx, ny);
  if (gi >= 0 && L.items[gi].kind === "gold") {
    const g = L.items[gi]; S.gold += g.amt; L.items.splice(gi, 1);
    msg(T("goldMsg", { X: g.amt }), "c-item"); SND.sfx("coin");
    addFloat(nx, ny, "+" + g.amt, "#ffd24a");
    burst(nx, ny, "#ffe066", 7, 22);
  }
  endTurn(); return true;
}
function bumpFX(x, y) { for (let i = 0; i < 5; i++) parts.push({ x: x + .5, y: y + .5, vx: (Math.random() - .5) * 32, vy: (Math.random() - .5) * 32, c: "#8e9ab8", t: 0, life: 220, s: 1 }); }

function attack(m, L) {
  /* プレイヤーの踏み込み演出 */
  S.pdx = S.px + (m.x - S.px) * .38;
  S.pdy = S.py + (m.y - S.py) * .38;
  const roll = d(20);
  if (roll + S.lvl <= m.hp / 4 + 6) {
    addSlash(S.px, S.py, m.x, m.y, "#8ea0c8", false);
    msg(T("missYou", { X: mobName(m) }), "c-sys"); addFloat(m.x, m.y, "MISS", "#8ea0c8"); SND.sfx("miss");
    return;
  }
  const w = S.wepT >= 0 ? WEAPONS[S.wepT].d : [1, 3];
  let dmg = d(w[1]) * w[0] + Math.floor(S.lvl / 2);
  const crit = roll >= 19;
  if (crit) dmg = Math.round(dmg * 1.8) + 2;
  if (MOBDEF[m.id].trait === "tough") { if (dmg > 2) dmg -= 2; if (Math.random() < .25) msg(T("zombNote", { X: mobName(m) }), "c-mob"); }
  m.hp -= dmg; m.hurt = 240;
  m.dx = m.x + (m.x - S.px) * .25; m.dy = m.y + (m.y - S.py) * .25;
  SND.sfx(crit ? "crit" : "hit"); shake(crit ? 5 : 2.5);
  const slashCol = crit ? "#ffe066" : (S.wepT === 3 ? "#ff9a3c" : "#f4f8ff");
  addSlash(S.px, S.py, m.x, m.y, slashCol, crit);
  if (crit) addRing(m.x, m.y, "#ffe066", 1.2, 280);
  addFloat(m.x, m.y, String(dmg), crit ? "#ffe066" : "#ffffff", crit);
  burst(m.x, m.y, crit ? "#ffe066" : "#e2513c", crit ? 12 : 6, crit ? 36 : 26);
  if (m.hp <= 0) {
    L.mons.splice(L.mons.indexOf(m), 1); gainXP(Math.round(m.xp * D().xp)); SND.sfx("kill");
    burst(m.x, m.y, "#ff9a3c", 16, 42);
    addRing(m.x, m.y, "#ff9a3c", 1.3, 320);
    S.kills++;
    book.seen[m.id] = (book.seen[m.id] || 0) + 1; saveBook();
    msg(T("dieYou", { X: mobName(m) }), "c-good");
    if (crit) msg(T("crit"), "c-good");
    if (Math.random() < .35) L.items.push({ kind: "gold", amt: Math.floor(m.xp * 1.5 + rnd(m.xp * 3 + 4)), x: m.x, y: m.y, bob: 0 });
  } else msg("→ " + mobName(m) + " -" + dmg, "c-you");
}
function gainXP(x) {
  S.xp += x;
  while (S.xp >= S.lvl * S.lvl * 8 + 10) {
    S.lvl++; S.maxhp += 2; S.hp = Math.min(S.maxhp, S.hp + 4);
    msg(T("lvlup", { X: S.lvl }), "c-good"); SND.sfx("level");
    addFloat(S.px, S.py, "LV UP", "#ffe066", true);
    burst(S.px, S.py, "#ffe066", 20, 46);
    addRing(S.px, S.py, "#ffe066", 2.2, 480);
  }
}
function hurtPlayer(dd, src, kind) {
  dd = Math.max(1, Math.round(dd * D().dmg));
  S.hp -= dd; S.hurtT = 260; SND.sfx("hurt"); shake(3.5); doFlash("#ff3a2a", .45);
  addFloat(S.px, S.py, "-" + dd, "#ff6a5a");
  burst(S.px, S.py, "#ff6a5a", 6, 24);
  if (src) msg(kind || T("hitYou", { X: mobName(src), D: dd }), "c-bad");
  if (S.hp <= 0) die(src);
}

/* 敵の手番：継承の追跡ルール＋種族別の特殊行動 */
function monsterTurn() {
  const L = cur();
  for (const m of [...L.mons]) {
    if (m.hp <= 0) continue;
    const tr = MOBDEF[m.id].trait, dx = S.px - m.x, dy = S.py - m.y, dist = Math.max(Math.abs(dx), Math.abs(dy));
    if (dx) m.face = Math.sign(dx);
    if (tr === "regen" && m.hp < m.maxhp && Math.random() < .5) {
      m.hp = Math.min(m.maxhp, m.hp + 2);
      if (L.visible[m.y][m.x]) {
        parts.push({ x: m.x + .5, y: m.y + .4, vx: (Math.random() - .5) * 10, vy: -14, c: "#6ddc6d", t: 0, life: 280, s: 1 });
        if (Math.random() < .3) msg(T("trollNote", { X: mobName(m) }), "c-mob");
      }
    }
    if (dist === 1) {
      m.dx = m.x + Math.sign(dx) * .32;
      m.dy = m.y + Math.sign(dy) * .32;
      if (d(20) + S.depth > 10 + S.ac * 2) {
        let dd = d(m.dmg[1]) * m.dmg[0];
        if (tr === "fierce") dd += 2;
        addSlash(m.x, m.y, S.px, S.py, "#ff6a5a", false);
        hurtPlayer(dd, m);
        if (S.dead) return;
        if (!S.dead && tr === "poison" && Math.random() < .6) { S.pois = Math.max(S.pois, 8); msg(T("poisSet", { X: mobName(m) }), "c-bad"); SND.sfx("poison"); addRing(S.px, S.py, "#77cf7f", 1.1, 320); }
        if (!S.dead && tr === "web") { if (Math.random() < .55) { S.slow = 3; msg(T("webSet", { X: mobName(m) }), "c-bad"); SND.sfx("web"); addRing(S.px, S.py, "#c483f2", 1.1, 320); } if (Math.random() < .35) { S.pois = Math.max(S.pois, 5); } }
        if (!S.dead && tr === "drain") { const st = Math.min(S.xp, 6); S.xp -= st; S.hunger = Math.max(0, S.hunger - 5); msg(T("drain", { X: mobName(m) }), "c-bad"); addFloat(S.px, S.py, "-XP", "#c483f2"); addRing(S.px, S.py, "#c483f2", 1.2, 340); }
        if (!S.dead && tr === "steal" && S.gold > 0) {
          const g = Math.min(S.gold, 5 + rnd(15)); S.gold -= g; m.flee = 4;
          msg(T("steal", { X: mobName(m), G: g }), "c-bad"); SND.sfx("steal"); addFloat(S.px, S.py, "-" + g, "#ffd24a");
        }
      } else { msg(T("missYou", { X: mobName(m) }), "c-sys"); addFloat(S.px, S.py, "MISS", "#8ea0c8"); }
      continue;
    }
    /* 遠距離攻撃 */
    if ((tr === "rock" || tr === "breath") && dist <= 5 && dist >= 2 && los(L, m.x, m.y, S.px, S.py) && Math.random() < (tr === "breath" ? .3 : .28)) {
      if (tr === "breath") {
        const dd = d(4) + d(4); SND.sfx("boom");
        burstLine(m.x, m.y, S.px, S.py, "#ff9a3c", 20);
        addBeam(m.x, m.y, S.px, S.py, "#ff6a2a");
        addRing(S.px, S.py, "#ff9a3c", 1.8, 380);
        hurtPlayer(dd, m, T("breath", { X: mobName(m), D: Math.max(1, Math.round(dd * D().dmg)) }));
        doFlash("#ff7a2a", .6); shake(6);
      } else {
        const dd = Math.max(1, Math.ceil(d(m.dmg[1]) * m.dmg[0] / 2)); SND.sfx("hit");
        addBeam(m.x, m.y, S.px, S.py, "#9db0d6");
        parts.push({ x: m.x + .5, y: m.y + .5, vx: (S.px - m.x) * 26, vy: (S.py - m.y) * 26, c: "#8e9ab8", t: 0, life: 260, s: 2 });
        hurtPlayer(dd, m, T("rock", { X: mobName(m), D: Math.max(1, Math.round(dd * D().dmg)) }));
      }
      if (S.dead) return;
      continue;
    }
    /* 移動 */
    let tx, ty;
    const sighted = dist <= 8 && los(L, m.x, m.y, S.px, S.py);
    if (m.flee > 0) { m.flee--; tx = -Math.sign(dx); ty = -Math.sign(dy); }
    else if (sighted) { tx = Math.sign(dx); ty = Math.sign(dy); }
    else if (Math.random() < (tr === "erratic" ? .6 : .25)) { tx = rnd(3) - 1; ty = rnd(3) - 1; }
    else continue;
    if (tx) m.face = tx;
    const ghost = tr === "drain";
    let tries = 1 + (tr === "quick" && sighted ? 1 : 0);
    while (tries-- > 0) {
      const nx = m.x + tx, ny = m.y + ty;
      if (nx <= 0 || ny <= 0 || nx >= COLS - 1 || ny >= ROWS - 1) break;
      if (!ghost && isWall(L, nx, ny)) break;
      if (ghost && isWall(L, nx, ny) && Math.random() < .5) break;
      if (monsterAt(L, nx, ny) || (nx === S.px && ny === S.py)) break;
      m.x = nx; m.y = ny;
      if (ghost && isWall(L, nx, ny) && L.visible[m.y][m.x] && Math.random() < .2) msg(T("ghostNote", { X: mobName(m) }), "c-mob");
      if (tries <= 0) break;
    }
  }
}
function burstLine(x0, y0, x1, y1, col, n) {
  for (let i = 0; i < n; i++) {
    const t = i / n;
    parts.push({ x: x0 + .5 + (x1 - x0) * t, y: y0 + .5 + (y1 - y0) * t, vx: (Math.random() - .5) * 26, vy: (Math.random() - .5) * 26, c: col, t: 0, life: 300 + rnd(200), s: 2 });
  }
}

function endTurn() {
  if (!S || S.dead) return;
  monsterTurn();
  if (!S || S.dead) return;
  S.turn++;
  if (S.turn % 2 === 0) S.hunger--;
  if (S.pois > 0) {
    S.pois--;
    if (S.turn % 4 === 0) { S.hp--; msg(T("poisTick"), "c-bad"); addFloat(S.px, S.py, "-1", "#7fd07f"); if (S.hp <= 0) return die(null); }
  }
  if (S.slow > 0) S.slow--;
  if (S.hunger <= 50 && S.hunger > 10 && S.turn % 40 === 0) msg(T("starve"), "c-bad");
  if (S.hunger <= 0) { S.hp--; if (S.hp <= 0) return die(cur().mons.find(m => Math.abs(m.x - S.px) + Math.abs(m.y - S.py) < 8)); }
  updateVis(); refreshHud(); saveRun();
}
function die(killer) {
  if (S.dead) return;
  S.dead = true; SND.sfx("die"); SND.stopBgm();
  burst(S.px, S.py, "#e2513c", 28, 60);
  addRing(S.px, S.py, "#ff3a2a", 2.4, 520);
  shake(8); doFlash("#ff2a1a", 1);
  msg(T("dieMob", { X: killer ? mobName(killer) : T("hunger3") }), "c-bad");
  localStorage.removeItem(K_SAVE);
  setTimeout(() => showEnd(false, killer), 620);
}
function doPick() {
  const L = cur(), i = itemAt(L, S.px, S.py);
  if (i < 0) { msg(T("pickEmpty")); SND.sfx("error"); return; }
  const it = L.items[i];
  if ((it.kind === "wpn" && it.tier <= S.wepT) || (it.kind === "armor" && it.tier <= S.armT)) {
    msg(T("gearWorse")); SND.sfx("error"); return;
  }
  L.items.splice(i, 1);
  book.items[it.kind] = 1; saveBook();
  let equipped = false;
  if (it.kind === "heal") S.inv.heal++;
  else if (it.kind === "poison") S.inv.poison++;
  else if (it.kind === "scrollT" || it.kind === "scrollL") S.inv[it.kind]++;
  else if (it.kind === "food") S.inv.food++;
  else if (it.kind === "wand") S.inv.wand += 6;
  else if (it.kind === "wpn") { S.wepT = it.tier; equipped = true; }
  else if (it.kind === "armor") { S.armT = it.tier; S.ac = ARMORS[it.tier].a - 1; equipped = true; }
  else if (it.kind === "amulet") {
    S.won = true; SND.sfx("win"); doFlash("#ffe066", 1);
    burst(S.px, S.py, "#ffe066", 34, 70);
    addRing(S.px, S.py, "#ffe066", 3.0, 600);
    saveBook(); showEnd(true); return;
  }
  msg(T("pick", { X: itemName(it) }), "c-item");
  SND.sfx(equipped ? "equip" : "pick");
  addFloat(S.px, S.py, equipped ? "EQUIP" : "PICK", "#ffd24a");
  if (equipped) addRing(S.px, S.py, "#ffe066", 1.2, 320);
  endTurn();
}
function doEat() {
  if (S.inv.food <= 0) { msg(T("noFood")); SND.sfx("error"); return; }
  if (S.hunger >= 195) { msg(T("alreadyFull")); SND.sfx("error"); return; }
  S.inv.food--; S.hunger = Math.min(200, S.hunger + 80);
  msg(T("eatMsg", { X: ITN.food[LIDX[lang]] }), "c-good"); SND.sfx("eat");
  addFloat(S.px, S.py, "+FULL", "#9be89b");
  burst(S.px, S.py, "#d8b46a", 6, 20);
  endTurn();
}
function usePotion(k) {
  if (S.inv[k] <= 0) return;
  S.inv[k]--;
  if (k === "heal") {
    const n = Math.floor(S.maxhp * .6) + 5; S.hp = Math.min(S.maxhp, S.hp + n);
    SND.sfx("drink"); addFloat(S.px, S.py, "+" + n, "#6ddc6d");
    burst(S.px, S.py, "#ff5ac8", 12, 26);
    addRing(S.px, S.py, "#ff5ac8", 1.5, 380);
  } else {
    SND.sfx("poison"); S.pois = 10;
    addRing(S.px, S.py, "#77cf7f", 1.5, 380);
    hurtPlayer(d(8), null, T("poisSet", { X: ITN.poison[LIDX[lang]] }));
    if (S.dead) return;
  }
  endTurn();
}
function useScroll(k) {
  if (S.inv[k] <= 0) return;
  S.inv[k]--; SND.sfx("scroll");
  const L = cur();
  if (k === "scrollT") {
    const fl = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (L.grid[y][x] === "." && !monsterAt(L, x, y)) fl.push([x, y]);
    const p = fl[rnd(fl.length)];
    if (p) {
      burst(S.px, S.py, "#8fc0ff", 16, 40); addRing(S.px, S.py, "#8fc0ff", 1.8, 360);
      S.px = p[0]; S.py = p[1]; S.pdx = p[0]; S.pdy = p[1]; cam.follow = true;
      burst(S.px, S.py, "#8fc0ff", 16, 40); addRing(S.px, S.py, "#8fc0ff", 1.8, 360);
    }
  } else {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { L.visible[y][x] = 1; L.explored[y][x] = 1; L.light[y][x] = Math.max(L.light[y][x], .55); }
    addRing(S.px, S.py, "#ffe98a", 4.5, 520);
    doFlash("#ffe98a", .8);
  }
  endTurn();
}
function doDrink() {
  const L = cur(), dc = L.decor[keyOf(S.px, S.py)];
  if (!dc || dc.t !== "fountain") { SND.sfx("error"); return; }
  if (S.hp >= S.maxhp && S.hunger > 120) { msg(T("fntFull")); return; }
  book.items.fountain = 1; saveBook();
  if (Math.random() < .12) {
    const damage = d(6); SND.sfx("poison");
    hurtPlayer(damage, null, T("fntBad", { D: Math.max(1, Math.round(damage * D().dmg)) }));
  } else {
    const n = Math.floor(S.maxhp * .45) + 3; S.hp = Math.min(S.maxhp, S.hp + n); S.hunger = Math.min(200, S.hunger + 12);
    SND.sfx("drink"); msg(T("fntHeal"), "c-good");
    addFloat(S.px, S.py, "+" + n, "#54e6da");
    burst(S.px, S.py, "#54e6da", 12, 26);
    addRing(S.px, S.py, "#54e6da", 1.6, 400);
  }
  endTurn();
}
function doMagic(target) {
  const L = cur();
  let best = target && L.mons.includes(target) && L.visible[target.y] && L.visible[target.y][target.x] ? target : null;
  let bd = best ? Math.abs(best.x - S.px) + Math.abs(best.y - S.py) : 99;
  if (!best) for (const m of L.mons) {
    if (!L.visible[m.y][m.x]) continue;
    const dd = Math.abs(m.x - S.px) + Math.abs(m.y - S.py);
    if (dd < bd) { bd = dd; best = m; }
  }
  if (!best || bd > 12) { msg(T("magicNone")); SND.sfx("error"); return; }
  if (best.x !== S.px) S.face = Math.sign(best.x - S.px);
  let dmg, beamCol = "#6fb0ff";
  if (S.inv.wand > 0) {
    S.inv.wand--; dmg = d(6) * 2 + Math.floor(S.lvl / 2);
    beamCol = "#54e6da";
    msg(T("wandHit", { X: mobName(best), Y: dmg }), "c-you");
  } else {
    dmg = d(4) + Math.floor(S.lvl / 3);
    msg(T("finger", { X: dmg }), "c-you");
    if (Math.random() < .05) S.hunger -= 15;
  }
  SND.sfx("zap");
  addBeam(S.px, S.py, best.x, best.y, beamCol);
  burstLine(S.px, S.py, best.x, best.y, beamCol, 12);
  best.hp -= dmg; best.hurt = 240;
  addFloat(best.x, best.y, String(dmg), beamCol);
  if (best.hp <= 0) {
    L.mons.splice(L.mons.indexOf(best), 1); gainXP(Math.round(best.xp * D().xp)); S.kills++; SND.sfx("kill");
    book.seen[best.id] = (book.seen[best.id] || 0) + 1; saveBook();
    burst(best.x, best.y, "#ff9a3c", 16, 42);
    addRing(best.x, best.y, "#ff9a3c", 1.3, 320);
  }
  endTurn();
}
function findStair(L, c) {
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (L.grid[y][x] === c) return { x: x, y: y };
  return L.spawn || { x: 3, y: 3 };
}
function explPct(L) {
  let a = 0, b = 0;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (L.grid[y][x] !== "#") { b++; if (L.explored[y][x]) a++; }
  return b ? Math.round(a / b * 100) : 100;
}
function doDown() {
  const L = cur(), ch = L.grid[S.py][S.px];
  if (ch === ">") {
    const pc = explPct(L);
    if (pc < 55 && !warnDown) { warnDown = true; msg(T("stairWarn", { X: pc }), "c-sys"); SND.sfx("error"); return; }
    warnDown = false; S.depth++;
    if (!S.levels[S.depth]) S.levels[S.depth] = genLevel(S.depth);
    SND.bgm(S.levels[S.depth].biome);
    const up = findStair(S.levels[S.depth], "<");
    S.px = up.x; S.py = up.y; S.pdx = up.x; S.pdy = up.y; cam.follow = true;
    book.maxDepth = Math.max(book.maxDepth || 0, S.depth); saveBook();
    msg(T("descend", { X: S.depth }), "c-sys"); SND.sfx("stairs");
    doFlash("#0a1020", .65);
    toast("B" + S.depth + " · " + biomeName(S.levels[S.depth].biome));
    updateVis(); refreshHud(); saveRun();
  } else if (ch === "<") {
    if (S.depth <= 1) { msg(T("noStairs")); SND.sfx("error"); return; }
    S.depth--; SND.bgm(S.levels[S.depth].biome);
    const dn = findStair(S.levels[S.depth], ">");
    S.px = dn.x; S.py = dn.y; S.pdx = dn.x; S.pdy = dn.y; cam.follow = true;
    msg(T("ascend", { X: S.depth }), "c-sys"); SND.sfx("stairs");
    doFlash("#0a1020", .5);
    toast("B" + S.depth + " · " + biomeName(S.levels[S.depth].biome));
    updateVis(); refreshHud(); saveRun();
  } else { msg(T("noStairs")); SND.sfx("error"); }
}

/* ================= 休息・走る・自動探索 ================= */
function rest() {
  if (busy || !S || S.dead) return;
  busy = true; let n = 0; SND.sfx("rest");
  const step = () => {
    if (!S || S.dead || !busy) { busy = false; return; }
    const L = cur();
    if (L.mons.some(m => L.visible[m.y][m.x]) && n > 1) { msg(T("restStop")); busy = false; refreshHud(); return; }
    movePlayer(0, 0, true);
    if (++n < 20 && !S.dead) setTimeout(step, 70); else { if (!S.dead) msg(T("restDone")); busy = false; refreshHud(); }
  };
  step();
}
function runStep(dx, dy) {
  if (busy || !S || S.dead) return;
  busy = true; let n = 0;
  const step = () => {
    if (!S || S.dead || !busy) { busy = false; return; }
    const L = cur();
    if (n > 0 && (L.mons.some(m => L.visible[m.y][m.x]) || itemAt(L, S.px, S.py) >= 0)) { busy = false; refreshHud(); return; }
    if (!movePlayer(dx, dy, n > 0)) { busy = false; return; }
    if (S.slow > 0) { busy = false; return; }
    if (++n < 40 && !S.dead) setTimeout(step, 68); else busy = false;
  };
  step();
}
function bfsField(L, sx, sy) {
  const dist = [], prev = [];
  for (let y = 0; y < ROWS; y++) { dist.push(new Array(COLS).fill(-1)); prev.push(new Array(COLS).fill(-1)); }
  const q = [[sx, sy]]; dist[sy][sx] = 0;
  for (let i = 0; i < q.length; i++) {
    const x = q[i][0], y = q[i][1], dd = dist[y][x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (isWall(L, nx, ny) || dist[ny][nx] >= 0) continue;
      if (monsterAt(L, nx, ny)) continue;
      dist[ny][nx] = dd + 1; prev[ny][nx] = x + y * COLS; q.push([nx, ny]);
    }
  }
  return { dist: dist, prev: prev };
}
function autoExplore() {
  if (busy || !S || S.dead) return;
  const L0 = cur();
  if (explPct(L0) >= 99) { msg(T("explDone")); return; }
  busy = true; msg(T("explStart")); let n = 0;
  const step = () => {
    if (!S || S.dead || !busy) { busy = false; return; }
    const L = cur();
    if (n > 1 && L.mons.some(m => L.visible[m.y][m.x])) { msg(T("explStop")); busy = false; refreshHud(); return; }
    const F = bfsField(L, S.px, S.py);
    let best = null, bs = 0;
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      if (F.dist[y][x] < 0) continue;
      let free = 0;
      for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++)
        if (!isWall(L, xx, yy) && !L.explored[yy][xx]) free++;
      if (!free) continue;
      const sc = free * 10 - F.dist[y][x];
      if (sc > bs) { bs = sc; best = { x: x, y: y }; }
    }
    if (!best) { msg(T("explDone")); busy = false; refreshHud(); return; }
    let cx = best.x + best.y * COLS, path = [];
    while (cx >= 0 && !(Math.floor(cx % COLS) === S.px && Math.floor(cx / COLS) === S.py)) { path.push([cx % COLS, Math.floor(cx / COLS)]); cx = F.prev[Math.floor(cx / COLS)][cx % COLS]; if (path.length > 500) break; }
    path.reverse();
    if (!path.length) { msg(T("explDone")); busy = false; return; }
    const nx = path[0][0], ny = path[0][1];
    if (itemAt(L, S.px, S.py) >= 0 && n > 0) { busy = false; refreshHud(); return; }
    if (!movePlayer(nx - S.px, ny - S.py, true)) { busy = false; return; }
    if (++n < 220 && !S.dead) setTimeout(step, 52); else busy = false;
  };
  step();
}

/* ================= セーブ／図鑑 ================= */
const saveRun = () => { if (S && !S.dead) localStorage.setItem(K_SAVE, JSON.stringify(S)); };
function loadRun() {
  try {
    const o = JSON.parse(localStorage.getItem(K_SAVE));
    if (!o || o.v !== 1) { SND.sfx("error"); return; }
    S = o;
    for (const k in S.levels) { const L = S.levels[k]; L.visible = []; L.light = []; for (let y = 0; y < ROWS; y++) { L.visible.push(new Array(COLS).fill(0)); L.light.push(new Array(COLS).fill(0)); } L.visibleM = null; }
    S.pdx = S.px; S.pdy = S.py; cam.follow = true;
    hideOverlays(); updateVis(); refreshHud(); SND.bgm(S.levels[S.depth].biome); SND.sfx("book");
  } catch (e) { S = null; SND.sfx("error"); }
}
const saveBook = () => localStorage.setItem(K_BOOK, JSON.stringify(book));
function stopAll() { busy = false; }

/* ================= 描画 ================= */
const cv = $("cv"), ctx = cv.getContext("2d");
const mmCv = $("minimap"), mmCtx = mmCv ? mmCv.getContext("2d") : null;
let scanPat = null, vig = null, vigW = 0, vigH = 0;
const clampCamX = v => Math.max(0, Math.min(v, Math.max(0, COLS - visW)));
const clampCamY = v => Math.max(0, Math.min(v, Math.max(0, ROWS - visH)));

function fitCanvas() {
  const wrap = $("mapWrap"), w = wrap.clientWidth, h = wrap.clientHeight;
  if (w < 50 || h < 50) { requestAnimationFrame(fitCanvas); return; }
  cell = Math.round(Math.min(w, h) / 13);
  cell = Math.max(14, Math.min(cell, 40));
  if (w / cell < 12) cell = Math.max(10, Math.floor(w / 12));
  if (h / cell < 9) cell = Math.max(10, Math.floor(h / 9));
  if (cellOverride) cell = cellOverride;
  visW = Math.ceil(w / cell) + 1; visH = Math.ceil(h / cell) + 1;
  cv.style.width = w + "px"; cv.style.height = h + "px";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  vig = null;
}
function hashAt(x, y, s) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (s * 2654435761) ^ ((S ? S.depth : 1) * 83492791);
  h = (h ^ (h >>> 13)) >>> 0; return h;
}
function drawSprite(img, x, y, w, h, alpha, flip) {
  if (!img) return;
  ctx.save(); if (alpha !== undefined && alpha < 1) ctx.globalAlpha = alpha;
  if (flip) { ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h); }
  else ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
  ctx.restore();
}
function drawShadow(cx, cy, rx, ry, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha || 0.42;
  ctx.fillStyle = "#020308";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
const frame = ms => Math.floor(performance.now() / ms);

function drawMinimap(L) {
  if (!mmCv || !mmCtx) return;
  const sc = mapMode === 2 ? 3 : 2;
  if (mmCv.width !== COLS * sc || mmCv.height !== ROWS * sc) {
    mmCv.width = COLS * sc;
    mmCv.height = ROWS * sc;
  }
  mmCv.classList.toggle("off", mapMode === 0);
  mmCtx.clearRect(0, 0, mmCv.width, mmCv.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!L.explored[y][x] && !L.visible[y][x]) continue;
      const ch = L.grid[y][x];
      if (ch === "#") {
        mmCtx.fillStyle = L.visible[y][x] ? "#3b4e78" : "#1e2842";
      } else if (ch === ">") {
        mmCtx.fillStyle = "#ffe066";
      } else if (ch === "<") {
        mmCtx.fillStyle = "#9be6ff";
      } else {
        mmCtx.fillStyle = L.visible[y][x] ? "#16223c" : "#0b1120";
      }
      mmCtx.fillRect(x * sc, y * sc, sc, sc);
    }
  }
  for (const it of L.items) {
    if (!L.explored[it.y][it.x]) continue;
    mmCtx.fillStyle = it.kind === "amulet" ? "#ff5ac8" : "#ffd24a";
    mmCtx.fillRect(it.x * sc, it.y * sc, sc, sc);
  }
  for (const m of L.mons) {
    if (!L.visible[m.y][m.x]) continue;
    mmCtx.fillStyle = "#ff5a4a";
    mmCtx.fillRect(m.x * sc, m.y * sc, sc, sc);
  }
  mmCtx.fillStyle = "#6ddc6d";
  mmCtx.fillRect(S.px * sc, S.py * sc, sc, sc);
}

function draw() {
  requestAnimationFrame(draw);
  const w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  const dt = Math.min(60, performance.now() - (draw._t || performance.now())); draw._t = performance.now();
  ctx.globalAlpha = 1; ctx.fillStyle = "#03050a"; ctx.fillRect(0, 0, w, h);
  if (!S) { drawVignette(w, h); return; }

  /* カメラ追従＋揺れ */
  if (cam.follow) {
    const tx = clampCamX(S.px + .5 - visW / 2), ty = clampCamY(S.py + .5 - visH / 2);
    cam.x += (tx - cam.x) * .18; cam.y += (ty - cam.y) * .18;
  } else { cam.x = clampCamX(cam.x); cam.y = clampCamY(cam.y); }
  if (cam.shake > .1) { cam.shake *= Math.pow(.85, dt / 16); cam.sx = (Math.random() - .5) * cam.shake; cam.sy = (Math.random() - .5) * cam.shake; } else { cam.sx = cam.sy = 0; cam.shake = 0; }

  const L = cur(), b = L.biome, T2 = TILE[b], t = performance.now();
  const ox = -Math.round(cam.x * cell) + Math.round(cam.sx), oy = -Math.round(cam.y * cell) + Math.round(cam.sy);
  ctx.save(); ctx.translate(ox, oy);
  const x0 = Math.floor(cam.x), y0 = Math.floor(cam.y);
  const x1 = Math.min(COLS, x0 + visW + 1), y1 = Math.min(ROWS, y0 + visH + 1);

  /* ---- 床・壁・装飾・階段 ---- */
  for (let y = Math.max(0, y0); y < y1; y++) for (let x = Math.max(0, x0); x < x1; x++) {
    if (!L.explored[y][x] && !L.visible[y][x]) continue;
    const px = x * cell, py = y * cell, k = keyOf(x, y), ch = L.grid[y][x];
    if (ch === "#") {
      const top = y === 0 || L.grid[y - 1][x] !== "#";
      if (L.torch[k]) {
        drawSprite(T2.torch, px, py, cell, cell);
        const fi = SPR["flame" + (frame(100) % 3)];
        drawSprite(fi, px + cell * .0625, py - cell * .08, cell, cell);
      } else drawSprite(top ? T2.wt[hashAt(x, y, 1) % 2] : T2.wb[hashAt(x, y, 2) % 3], px, py, cell, cell);
      continue;
    }
    drawSprite(T2.fl[hashAt(x, y, 3) % 4], px, py, cell, cell);
    /* 上の壁が落とす立体ドロップシャドウ */
    if (y > 0 && L.grid[y - 1][x] === "#") {
      ctx.fillStyle = "rgba(2,4,10,0.42)";
      ctx.fillRect(px, py, cell, Math.max(2, Math.round(cell * 0.22)));
    }
    const dc = L.decor[k];
    if (dc) {
      if (dc.t === "water") { /* 後描画 */ }
      else if (dc.t === "rock") {
        drawShadow(px + cell * .5, py + cell * .72, cell * .32, cell * .12, .38);
        drawSprite(SPR.rock, px, py - cell * .12, cell, cell);
      } else if (dc.t === "moss") {
        ctx.save(); ctx.globalAlpha = .6 + .25 * Math.sin(t / 580 + x);
        drawSprite(SPR.moss, px, py, cell, cell); ctx.restore();
      } else if (dc.t === "fountain") {
        drawShadow(px + cell * .5, py + cell * .82, cell * .38, cell * .14, .45);
        drawSprite(SPR["fountain" + (frame(380) % 2)], px, py, cell, cell);
      }
    }
    if (ch === ">") { ctx.save(); ctx.shadowColor = "#e8b24a"; ctx.shadowBlur = cell * .4; drawSprite(SPR.stairsD, px, py, cell, cell); ctx.restore(); }
    else if (ch === "<") { ctx.save(); ctx.shadowColor = "#cfd8ff"; ctx.shadowBlur = cell * .4; drawSprite(SPR.stairsU, px, py, cell, cell); ctx.restore(); }
  }

  /* 水たまりの揺らぎ（3フレーム） */
  for (let y = Math.max(0, y0); y < y1; y++) for (let x = Math.max(0, x0); x < x1; x++) {
    if (!L.explored[y][x]) continue;
    const dc = L.decor[keyOf(x, y)];
    if (dc && dc.t === "water") {
      const wf = WATER[L.biome][(frame(420) + x + y) % 3];
      drawSprite(wf, x * cell, y * cell, cell, cell);
    }
  }

  /* ---- アイテム（接地影＋浮遊＋発光＋段階別スプライト） ---- */
  for (const it of L.items) {
    if (!L.visible[it.y][it.x]) continue;
    const img = SPR[itemSprKey(it)]; if (!img) continue;
    const bob = Math.sin(t / 400 + it.bob) * cell * .09;
    const px = it.x * cell, py = it.y * cell + bob;
    drawShadow(px + cell * .5, it.y * cell + cell * .84, cell * .28, cell * .1, .42);
    const col = it.kind === "amulet" ? "#c483f2" : it.kind === "gold" ? "#ffd24a" : it.kind === "heal" ? "#ff5ac8" : it.kind === "poison" ? "#7fd07f" : (it.kind === "wpn" && it.tier === 3) ? "#ff9a3c" : "#8fb0e8";
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = .2 + .1 * Math.sin(t / 280 + it.bob);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px + cell / 2, py + cell / 2, cell * .46, 0, 7); ctx.fill(); ctx.restore();
    drawSprite(img, px + cell * .06, py + cell * .04, cell * .88, cell * .88);
  }

  /* ---- 敵（全種2フレームアニメーション＋向き反転＋接地影） ---- */
  for (const m of L.mons) {
    if (!L.visible[m.y][m.x]) continue;
    m.dx += (m.x - m.dx) * Math.min(1, dt / 85); m.dy += (m.y - m.dy) * Math.min(1, dt / 85);
    const md = MOBDEF[m.id], sc = md.scale, sz = cell * sc;
    const bx = m.dx * cell + (cell - sz) / 2, by = m.dy * cell + cell - sz + Math.sin(t / 280 + m.wob) * cell * .05;
    drawShadow(m.dx * cell + cell * .5, m.dy * cell + cell * .88, sz * .34, cell * .12, md.trait === "drain" ? .22 : .48);
    const animSpd = m.id === "bat" ? 130 : m.id === "rat" ? 190 : 340;
    const mkey = m.id + (frame(animSpd) % 2);
    const img = m.hurt > 0 ? SPR["mobd_" + mkey] : SPR["mob_" + mkey];
    if (md.trait === "drain") ctx.save(), ctx.globalAlpha = .82;
    drawSprite(img, bx, by, sz, sz, 1, m.face < 0);
    if (md.trait === "drain") ctx.restore();
    if (m.hurt > 0) m.hurt -= dt;
    if (m.hp < m.maxhp) {
      const bw = cell * .82, bh = Math.max(3, Math.round(cell * .13));
      const hx0 = Math.round(bx + (sz - bw) / 2), hy0 = Math.round(by - bh - 2);
      ctx.fillStyle = "#080b14"; ctx.fillRect(hx0 - 1, hy0 - 1, Math.round(bw) + 2, bh + 2);
      ctx.fillStyle = "#221018"; ctx.fillRect(hx0, hy0, Math.round(bw), bh);
      ctx.fillStyle = m.hp / m.maxhp > .5 ? "#6ddc6d" : (m.hp / m.maxhp > .25 ? "#ffb020" : "#ff5a4a");
      ctx.fillRect(hx0, hy0, Math.round(bw * Math.max(0, m.hp / m.maxhp)), bh);
    }
  }

  /* ---- プレイヤー（灯守） ---- */
  S.pdx += (S.px - S.pdx) * Math.min(1, dt / 68); S.pdy += (S.py - S.pdy) * Math.min(1, dt / 68);
  const hx = S.pdx * cell, hy = S.pdy * cell;
  drawShadow(hx + cell * .5, hy + cell * .88, cell * .34, cell * .12, .52);
  const pulse = .18 + .08 * Math.sin(t / 240);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const gr = ctx.createRadialGradient(hx + cell / 2, hy + cell / 2, cell * .18, hx + cell / 2, hy + cell / 2, cell * 1.85);
  gr.addColorStop(0, "rgba(255,230,120,.38)"); gr.addColorStop(.45, "rgba(255,190,80," + pulse + ")"); gr.addColorStop(1, "rgba(255,190,80,0)");
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(hx + cell / 2, hy + cell / 2, cell * 1.85, 0, 7); ctx.fill(); ctx.restore();
  const hFrame = (S.slow > 0 ? SPR.hero2 : SPR[frame(290) % 2 ? "hero" : "hero2"]);
  drawSprite(hFrame, hx, hy, cell, cell, 1, S.face < 0);
  const flX = S.face < 0 ? hx - cell * .36 : hx + cell * .36;
  drawSprite(SPR["flame" + (frame(85) % 3)], flX, hy - cell * .26, cell, cell);
  if (S.pois > 0 && frame(380) % 2) drawSprite(SPR.skull, hx - cell * .1, hy - cell * .55, cell * .7, cell * .7);

  /* ---- VFX（斬撃アーク・魔法ビーム・衝撃波リング） ---- */
  for (let i = fx.length - 1; i >= 0; i--) {
    const e = fx[i]; e.t += dt;
    if (e.t > e.life) { fx.splice(i, 1); continue; }
    const p = e.t / e.life;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (e.kind === "slash") {
      const r = cell * (e.crit ? 0.68 : 0.52);
      const span = 1.45;
      const a0 = e.ang - span * 0.5 + p * 0.4;
      const a1 = e.ang + span * 0.5 - (1 - p) * 0.3;
      ctx.globalAlpha = Math.sin(p * Math.PI);
      ctx.strokeStyle = e.col;
      ctx.lineWidth = Math.max(2, cell * (e.crit ? 0.16 : 0.11) * (1 - p * 0.5));
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(e.x * cell, e.y * cell, r, a0, a1);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1, ctx.lineWidth * 0.45);
      ctx.stroke();
    } else if (e.kind === "ring") {
      const r = cell * (0.15 + e.maxR * Math.pow(p, 0.7));
      ctx.globalAlpha = (1 - p) * 0.85;
      ctx.strokeStyle = e.col;
      ctx.lineWidth = Math.max(1.5, cell * 0.1 * (1 - p));
      ctx.beginPath();
      ctx.arc(e.x * cell, e.y * cell, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (e.kind === "beam") {
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.strokeStyle = e.col;
      ctx.lineWidth = Math.max(2, cell * 0.16 * (1 - p));
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(e.x0 * cell, e.y0 * cell);
      ctx.lineTo(e.x1 * cell, e.y1 * cell);
      ctx.stroke();
      const headP = Math.min(1, p * 1.6);
      const bx2 = (e.x0 + (e.x1 - e.x0) * headP) * cell;
      const by2 = (e.y0 + (e.y1 - e.y0) * headP) * cell;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx2, by2, Math.max(2, cell * 0.18 * (1 - p * 0.5)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---- 環境パーティクル（バイオーム別の浮遊蛍火・胞子・霊魂） ---- */
  if (amb.length < 22 && Math.random() < 0.35) {
    const ax = cam.x + Math.random() * visW, ay = cam.y + Math.random() * visH;
    const acol = b === "rock" ? (Math.random() < .5 ? "#ffb040" : "#6fb0ff") : b === "ruin" ? (Math.random() < .6 ? "#77cf7f" : "#ffe066") : (Math.random() < .6 ? "#c483f2" : "#54e6da");
    amb.push({ x: ax, y: ay, vx: (Math.random() - .5) * 0.4, vy: -0.25 - Math.random() * 0.35, c: acol, t: 0, life: 1800 + rnd(1600) });
  }
  for (let i = amb.length - 1; i >= 0; i--) {
    const a = amb[i]; a.t += dt;
    if (a.t > a.life) { amb.splice(i, 1); continue; }
    a.x += a.vx * (dt / 1000); a.y += a.vy * (dt / 1000);
    const gx = Math.floor(a.x), gy = Math.floor(a.y);
    if (gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || !L.visible[gy][gx]) continue;
    const al = Math.sin((a.t / a.life) * Math.PI) * 0.65;
    ctx.globalAlpha = al;
    ctx.fillStyle = a.c;
    const sz = Math.max(1, Math.round(cell / 14));
    ctx.fillRect(Math.round(a.x * cell), Math.round(a.y * cell), sz, sz);
  }

  /* ---- パーティクル／フローティングテキスト ---- */
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.t += dt;
    if (p.t > p.life) { parts.splice(i, 1); continue; }
    const k = p.t / 1000;
    p.x += p.vx * k * .06; p.y += p.vy * k * .06; p.vy += 40 * .06;
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    ctx.fillStyle = p.c;
    const psz = Math.max(1, Math.round(cell / 16 * p.s * 1.6));
    ctx.fillRect(Math.round(p.x * cell), Math.round(p.y * cell), psz, psz);
  }
  ctx.globalAlpha = 1;
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i]; f.t += dt;
    if (f.t > f.life) { floats.splice(i, 1); continue; }
    const k = f.t / f.life, sc = Math.max(1, Math.round(cell / 16)) * (f.big ? 2 : 1);
    const tx = f.x * cell + cell / 2, ty = f.y * cell - cell * .3 - k * cell * .95;
    ctx.globalAlpha = Math.max(0, 1 - k * k);
    const wpx = PX.textW(f.txt, sc);
    PX.textColored(ctx, f.txt, Math.round(tx - wpx / 2) + 1, Math.round(ty) + 1, "#04060c", sc);
    PX.textColored(ctx, f.txt, Math.round(tx - wpx / 2), Math.round(ty), f.col, sc);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  /* ---- 暗がりの重ね描画（マス目の灯り＋揺らぎ） ---- */
  const flick = Math.sin(t / 140) * 0.02 + Math.cos(t / 230) * 0.015;
  const q = v => Math.round(v * 9) / 9;
  for (let y = Math.max(0, y0); y < y1; y++) for (let x = Math.max(0, x0); x < x1; x++) {
    const vis = L.visible[y][x], exp = L.explored[y][x];
    if (!exp && !vis) continue;
    const px = x * cell + ox, py = y * cell + oy;
    if (!vis) { ctx.globalAlpha = .74; ctx.fillStyle = "#050914"; ctx.fillRect(px, py, cell, cell); continue; }
    const a = q(Math.max(0, Math.min(0.92, 1 - (L.light[y][x] + flick))));
    if (a > .02) { ctx.globalAlpha = a; ctx.fillStyle = "#04060d"; ctx.fillRect(px, py, cell, cell); }
  }
  ctx.globalAlpha = 1;

  /* 灯の暖色グロー＆環境光源（松明・泉・光る苔） */
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const lx = (S.pdx + .5 - cam.x) * cell + cam.sx, ly = (S.pdy + .5 - cam.y) * cell + cam.sy;
  const g2 = ctx.createRadialGradient(lx, ly, 1, lx, ly, cell * (5.3 + Math.sin(t / 220) * 0.2));
  g2.addColorStop(0, "rgba(255,204,102,.22)"); g2.addColorStop(.5, "rgba(255,150,60,.09)"); g2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

  for (const k in L.torch) {
    const p = k.split(","), tx0 = +p[0], ty0 = +p[1];
    if (!L.explored[ty0][tx0]) continue;
    const tx = (tx0 + .5 - cam.x) * cell + cam.sx, ty = (ty0 + .2 - cam.y) * cell + cam.sy;
    if (tx < -cell * 3 || ty < -cell * 3 || tx > w + cell * 3 || ty > h + cell * 3) continue;
    const g3 = ctx.createRadialGradient(tx, ty, 1, tx, ty, cell * 3.8);
    g3.addColorStop(0, "rgba(255,175,70,.24)"); g3.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g3; ctx.fillRect(tx - cell * 3.8, ty - cell * 3.8, cell * 7.6, cell * 7.6);
  }
  for (const k in L.decor) {
    const dc = L.decor[k];
    if (dc.t !== "fountain" && dc.t !== "moss") continue;
    const p = k.split(","), dx0 = +p[0], dy0 = +p[1];
    if (!L.visible[dy0][dx0]) continue;
    const tx = (dx0 + .5 - cam.x) * cell + cam.sx, ty = (dy0 + .5 - cam.y) * cell + cam.sy;
    const rad = dc.t === "fountain" ? cell * 2.8 : cell * 1.8;
    const g4 = ctx.createRadialGradient(tx, ty, 1, tx, ty, rad);
    g4.addColorStop(0, dc.t === "fountain" ? "rgba(84,230,218,.20)" : "rgba(119,207,127,.15)");
    g4.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g4; ctx.fillRect(tx - rad, ty - rad, rad * 2, rad * 2);
  }
  ctx.restore();

  if (flash > 0) { flash = Math.max(0, flash - dt / 450); ctx.globalAlpha = flash * .4; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
  drawVignette(w, h);
  drawMinimap(L);
}
function drawVignette(w, h) {
  if (!vig || vigW !== w || vigH !== h) {
    vigW = w; vigH = h; vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .42, w / 2, h / 2, Math.max(w, h) * .78);
    vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,.6)");
  }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);
  if (!scanPat) {
    const c = PX.cv(1, 3), g = c.getContext("2d");
    g.fillStyle = "rgba(0,0,0,.15)"; g.fillRect(0, 0, 1, 1); scanPat = ctx.createPattern(c, "repeat");
  }
  ctx.fillStyle = scanPat; ctx.fillRect(0, 0, w, h);
}

/* ================= HUD ================= */
let toastT = 0;
function toast(s) { const el = $("toast"); el.textContent = s; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => el.style.opacity = 0, 1800); }
function refreshHud() {
  if (!S) return;
  const L = cur(), hpP = Math.max(0, S.hp / S.maxhp), xpN = S.lvl * S.lvl * 8 + 10;
  const hS = S.hunger > 150 ? T("hunger0") : S.hunger > 80 ? T("hunger1") : S.hunger > 30 ? T("hunger2") : T("hunger3");
  $("status").innerHTML =
    '<span class="chip">' + esc(S.name) + "</span>" +
    '<span class="chip hp"><span class="bar hp' + (hpP < .3 ? " low" : "") + '"><i style="width:' + (hpP * 100) + '%"></i></span><b>' + S.hp + "/" + S.maxhp + "</b></span>" +
    '<span class="chip"><span class="ico" style="background-image:url(' + ICONU.i_shield + ')"></span><b>' + S.ac + "</b></span>" +
    '<span class="chip"><b>Lv' + S.lvl + '</b><span class="bar xp"><i style="width:' + Math.min(100, S.xp / xpN * 100) + '%"></i></span></span>' +
    '<span class="chip gold"><span class="ico" style="background-image:url(' + ICONU.gold + ')"></span><b>' + S.gold + "</b></span>" +
    '<span class="chip dv"><b>' + T("depth") + " " + S.depth + "</b></span>" +
    '<span class="chip hu"><span class="bar hu' + (S.hunger <= 30 ? " low" : "") + '"><i style="width:' + Math.max(0, S.hunger / 2) + '%"></i></span><em>' + hS + "</em></span>" +
    '<span class="chip"><span class="ico" style="background-image:url(' + ICONU.i_eye + ')"></span><b>' + explPct(L) + "%</b></span>";
  $("log").innerHTML = S.log.map(o => '<div class="' + (o.c || "c-sys") + '">' + esc(o.t) + "</div>").join("");

  const under = itemAt(L, S.px, S.py), inv = S.inv;
  const it = [["heal", "pHeal"], ["poison", "pPois"], ["scrollT", "scroll"], ["scrollL", "scrollL"]].map(a =>
    '<span data-use="' + a[0] + '"' + (inv[a[0]] ? "" : ' class="zero"') + '><i style="background-image:url(' + ICN[a[1]] + ')"></i>' + inv[a[0]] + "</span>").join("");
  const dc = L.decor[keyOf(S.px, S.py)];
  const wepIcon = S.wepT >= 0 ? ICN[WEAPONS[S.wepT].spr] || ICN.sword : ICN.sword;
  const armIcon = S.armT >= 0 ? ICN[ARMORS[S.armT].spr] || ICN.armor : ICN.armor;
  const underItem = under >= 0 ? L.items[under] : null;
  const underIcon = underItem ? (ICN[itemSprKey(underItem)] || "") : "";
  const inventory = it +
    '<span data-use="eat"' + (inv.food ? "" : ' class="zero"') + '><i style="background-image:url(' + ICN.ration + ')"></i>' + inv.food + "</span>" +
    '<span data-use="zap"' + (inv.wand ? "" : ' class="zero"') + '><i style="background-image:url(' + ICN.wand + ')"></i>' + inv.wand + "</span>";
  const equipment =
    (S.wepT >= 0 ? '<span><i style="background-image:url(' + wepIcon + ')"></i>' + itemName({ kind: "wpn", tier: S.wepT }) + "</span>" : "") +
    (S.armT >= 0 ? '<span><i style="background-image:url(' + armIcon + ')"></i>' + itemName({ kind: "armor", tier: S.armT }) + "</span>" : "");
  const groundItem = under >= 0
    ? '<span class="here" data-use="pick"><i style="background-image:url(' + underIcon + ')"></i>' + itemName(underItem) + "</span>"
    : (dc && dc.t === "fountain" ? '<span class="here" data-use="drink"><i style="background-image:url(' + ICN.fountain + ')"></i>' + ITN.fountain[LIDX[lang]] + "</span>" : "");
  $("items").innerHTML =
    '<div class="item-row inventory-row">' + inventory + "</div>" +
    '<div class="item-row equipment-row">' + equipment + "</div>" +
    '<div class="item-row ground-row">' + groundItem + "</div>";

  const on = n => n ? "" : " none";
  $("bPick").className = "key act" + on(under >= 0 || (dc && dc.t === "fountain")); $("bPick").innerHTML = '<i style="background-image:url(' + ICONU.i_bag + ')"></i><b>G</b>' + (under >= 0 ? "◈" : "");
  $("bEat").className = "key act" + on(inv.food > 0); $("bEat").innerHTML = '<i style="background-image:url(' + ICONU.i_bread + ')"></i><b>E</b>' + inv.food;
  $("bMagic").className = "key act"; $("bMagic").innerHTML = '<i style="background-image:url(' + ICONU.i_wand + ')"></i><b>F</b>' + inv.wand;
  const st = L.grid[S.py][S.px] === ">" || L.grid[S.py][S.px] === "<";
  $("bDown").className = "key act" + on(st); $("bDown").innerHTML = '<i style="background-image:url(' + ICONU.i_stairs + ')"></i>' + (st ? "◈" : "");
  $("bExpl").innerHTML = '<i style="background-image:url(' + ICONU.i_compass + ')"></i>';
  $("depthTag").textContent = "B" + S.depth + " " + biomeName(L.biome) + " · " + T("kills") + " " + S.kills;
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ================= オーバーレイ ================= */
function hideOverlays() { ["titleScr", "overScr", "scoreScr", "bookScr", "helpScr"].forEach(k => $(k).classList.add("hidden")); }
function drawLogo(c) {
  const txt = lang === "ja" ? "六層の灯" : lang === "zh" ? "六层之灯" : "LANTERN DEPTHS";
  const tiny = PX.cv(260, 26), tg = tiny.getContext("2d");
  tg.font = (lang === "en" ? "11px PressStart" : "18px DotGothic16") + ", sans-serif";
  tg.textBaseline = "top";
  const tw = Math.ceil(tg.measureText(txt).width);
  const w = tw + 42;
  /* 左右に灯守と護符のドット絵エンブレムを添える */
  if (SPR.hero) tg.drawImage(SPR.hero, 1, 5, 16, 16);
  if (SPR.flame0) tg.drawImage(SPR.flame0, 8, 1, 14, 14);
  tg.fillStyle = "#1a0e04"; tg.fillText(txt, 22, 6);
  tg.fillStyle = "#8b5c28"; tg.fillText(txt, 21, 5);
  tg.fillStyle = "#ffe066"; tg.fillText(txt, 20, 4);
  if (SPR.amulet) tg.drawImage(SPR.amulet, 23 + tw, 5, 16, 16);
  const sc = Math.max(1, Math.min(3, Math.floor(390 / w)));
  c.width = w * sc; c.height = 26 * sc;
  const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, c.width, c.height);
  g.drawImage(tiny, 0, 0, w, 26, 0, 0, w * sc, 26 * sc);
}
function showTitle() {
  hideOverlays(); $("titleScr").classList.remove("hidden");
  $("heroName").placeholder = T("name"); $("heroName").value = localStorage.getItem(K_NAME) || "";
  $("bNew").textContent = T("newGame"); $("bCont").textContent = T("cont"); $("bScore").textContent = T("scores");
  $("titleHint").textContent = T("hint"); $("bBook").textContent = T("book"); $("bHelp").textContent = T("helpB");
  $("bCont").classList.toggle("hidden", !localStorage.getItem(K_SAVE));
  document.querySelectorAll("#titleLangs button").forEach(b => b.classList.toggle("on", b.dataset.l === lang));
  document.querySelectorAll("#diffSel button").forEach(b => b.classList.toggle("on", b.dataset.d === diff));
  $("diffLbl").textContent = T("diff");
  const DN = { easy: T("dEasy"), normal: T("dNorm"), hard: T("dHard") };
  document.querySelectorAll("#diffSel button").forEach(b => b.textContent = DN[b.dataset.d] || b.dataset.d);
  SND.sfx("book");
  if (window.gsap) gsap.fromTo("#titleLogo", { alpha: 0, y: -10 }, { alpha: 1, y: 0, duration: .5, ease: "power2.out" });
  drawLogo($("titleLogo"));
}
function showEnd(won, killer) {
  $("overScr").classList.remove("hidden"); $("bSaveScore").disabled = false;
  $("overTitle").textContent = won ? T("win") : T("deathTitle");
  const cause = won ? T("victoryMsg") : killer ? T("killedBy", { X: mobName(killer) }) : T("byHunger");
  $("overStats").innerHTML =
    esc(S.name) + " ・ " + T("score") + "<br><b style='font-family:var(--ps);font-size:20px;color:var(--accent)'>" + score() + "</b><br>" +
    T("depth") + " " + S.depth + " / " + T("lv") + " " + S.lvl + " / " + T("gold") + " " + S.gold + "<br>" +
    T("kills") + " " + S.kills + " / " + T("turn") + " " + S.turn + "<br><span style='color:#93a2c4'>" + T("cause") + "： " + cause + "</span>" +
    (won ? "<br><span style='color:#8fe29a'>" + T("wonHint") + "</span>" : "");
  $("bSaveScore").textContent = T("save"); $("bToTitle").textContent = T("close");
  $("bKeep").classList.toggle("hidden", !won);
  if (window.gsap) gsap.fromTo("#overScr", { alpha: .2 }, { alpha: 1, duration: .45 });
}
function getScores() {
  let a = [];
  try { a = JSON.parse(localStorage.getItem(K_SCORE) || "[]"); } catch (e) { a = []; }
  if (!a.length) { try { a = (JSON.parse(localStorage.getItem("nh_scores") || "[]")).map(r => ({ n: r.n, s: r.s, d: r.d, l: r.l, legacy: 1 })); } catch (e) { } }
  return a;
}
function showScores() {
  $("scoreScr").classList.remove("hidden");
  $("scoreTitle").textContent = T("scores"); $("bScoreClose").textContent = T("close");
  const rows = getScores().sort((a, b) => b.s - a.s).slice(0, 10);
  $("scoreTable").innerHTML = "<tr><th>#</th><th>" + T("name") + "</th><th class=num>" + T("best") + "</th><th class=num>" + T("depth") + "</th><th class=num>" + T("lv") + "</th></tr>" +
    (rows.length ? rows.map((r, i) => "<tr><td>" + (i + 1) + "</td><td>" + esc(r.n || "???") + (r.legacy ? " *" : "") + '</td><td class=num>' + r.s + "</td><td class=num>" + r.d + "</td><td class=num>" + r.l + "</td></tr>").join("")
      : "<tr><td colspan=5>" + T("noBook") + "</td></tr>");
}
function spriteTo(el, img, px, sc) {
  const c = PX.cv(px * sc, px * sc), g = c.getContext("2d");
  g.imageSmoothingEnabled = false; if (img) g.drawImage(img, 0, 0, px * sc, px * sc); el.appendChild(c);
}
function showBook(tab) {
  tab = tab || "mob"; $("bookScr").classList.remove("hidden");
  $("bTitle").textContent = T("book"); $("bClose").textContent = T("close");
  document.querySelectorAll("#bookTabs button").forEach(b => { b.textContent = b.dataset.t === "mob" ? T("tabMob") : T("tabItem"); b.classList.toggle("on", b.dataset.t === tab); });
  const list = $("bookList"); list.innerHTML = "";
  if (tab === "mob") {
    MOBS.forEach(m => {
      const seen = !!book.seen[m.id], row = document.createElement("div");
      row.className = "mentry" + (seen ? "" : " unk");
      spriteTo(row, seen ? SPR["mob_" + m.id] : SPR.mob_ghost, 16, 2);
      row.insertAdjacentHTML("beforeend", "<div><div class=nm>" + (seen ? m.n[LIDX[lang]] : "？") + "</div>" +
        '<div class=st>HP ' + m.hp + " / " + m.dmg[0] + "d" + m.dmg[1] + " / XP " + m.xp + " / B" + m.min + "</div>" +
        (seen ? '<div class=ds>' + m.d[LIDX[lang]] + (book.seen[m.id] ? " ×" + book.seen[m.id] : "") + "</div>" : "") + "</div>");
      list.appendChild(row);
    });
  } else {
    const kinds = ["heal", "poison", "scrollT", "scrollL", "food", "wand", "amulet", "fountain"];
    kinds.forEach(k => {
      if (!book.items[k]) return;
      const row = document.createElement("div"); row.className = "mentry";
      spriteTo(row, SPR[ITICON[k]], 16, 2);
      row.insertAdjacentHTML("beforeend", "<div><div class=nm>" + ITN[k][LIDX[lang]] + "</div></div>");
      list.appendChild(row);
    });
    WEAPONS.forEach((wp, i) => {
      const row = document.createElement("div"); row.className = "mentry" + (S && S.wepT >= i ? "" : " unk");
      spriteTo(row, SPR[wp.spr] || SPR.sword, 16, 2);
      row.insertAdjacentHTML("beforeend", '<div><div class=nm>' + wp.n[LIDX[lang]] + '</div><div class=st>1d' + wp.d[1] + " ×" + wp.d[0] + "</div></div>");
      list.appendChild(row);
    });
    ARMORS.forEach((arm, i) => {
      const row = document.createElement("div"); row.className = "mentry" + (S && S.armT >= i ? "" : " unk");
      spriteTo(row, SPR[arm.spr] || SPR.armor, 16, 2);
      row.insertAdjacentHTML("beforeend", '<div><div class=nm>' + arm.n[LIDX[lang]] + '</div><div class=st>AC ' + arm.a + "</div></div>");
      list.appendChild(row);
    });
    if (!list.children.length) list.innerHTML = '<div class=hint>' + T("noBook") + "</div>";
  }
  SND.sfx("book");
}
function showHelp() {
  $("helpScr").classList.remove("hidden"); $("hTitle").textContent = T("helpB"); $("hClose").textContent = T("close");
  $("hBody").innerHTML = '<div class=keys>' + HELP[LIDX[lang]].map(r => "<b>" + r[0] + "</b><span>" + r[1] + "</span>").join("") + "</div>" +
    '<div class=hint style=margin-top:12px>' + T("hint") + '</div><div class=credit style=margin-top:10px>' + T("libNote") + "</div>";
}
const HELP = [
  [["移動", "方向キー / 8方向パッド / 速いスワイプ"], ["走る", "Shift+方向（敵を見るか道具で停止）"], ["攻撃", "敵のマスへ移動"], ["狙う", "敵をタップでマジックミサイル"], ["拾う", "G"], ["食べる", "E"], ["魔法", "F"], ["泉水を飲む", "泉水の上でG"], ["階段", "> / <"], ["探索", ". （または 🧭）"], ["休息", "m （パッド中央）"], ["地図切替", "Tab / ミニマップをタップ"], ["図鑑", "Shift+B"], ["視点", "ドラッグ / ホイール"]],
  [["Move", "arrows / pad / quick flick"], ["Run", "Shift+dir"], ["Attack", "walk into a monster"], ["Aim", "tap a monster to zap it"], ["Pick up", "G"], ["Eat", "E"], ["Magic", "F"], ["Drink", "G on a fountain"], ["Stairs", "> / <"], ["Explore", ". (or the compass)"], ["Rest", "m (pad center)"], ["Minimap", "Tab / tap minimap"], ["Bestiary", "Shift+B"], ["Pan", "drag / wheel"]],
  [["移动", "方向键 / 方向盘 / 快划"], ["奔跑", "Shift+方向"], ["攻击", "走向敌人"], ["瞄准", "点击敌人发射魔法"], ["拾取", "G"], ["进食", "E"], ["魔法", "F"], ["喝水", "在泉水上按G"], ["楼梯", "> / <"], ["探索", ". （或 🧭）"], ["休息", "m （中央）"], ["小地图", "Tab / 点击小地图"], ["图鉴", "Shift+B"], ["平移视角", "拖动 / 滚轮"]]
];

/* ================= 入力 ================= */
I18N.ja.score = "スコア"; I18N.en.score = "Score"; I18N.zh.score = "分数";

document.querySelectorAll("#dpad .key").forEach(b => {
  const p = b.dataset.d.split(",").map(Number);
  let hold = null, longFired = false;
  const start = () => { longFired = false; hold = setTimeout(() => { longFired = true; if (p[0] || p[1]) runStep(p[0], p[1]); else rest(); }, 360); };
  const end = () => { clearTimeout(hold); if (!longFired) { if (p[0] || p[1]) movePlayer(p[0], p[1]); else rest(); } };
  b.addEventListener("pointerdown", e => { e.preventDefault(); SND.init(); start(); });
  b.addEventListener("pointerup", e => { e.preventDefault(); end(); });
  b.addEventListener("pointerleave", () => clearTimeout(hold));
  b.addEventListener("pointercancel", () => clearTimeout(hold));
  b.style.backgroundImage = "url(" + (ICONU["a_" + b.dataset.d] || "") + ")";
});
$("bPick").onclick = () => { const dc = cur().decor[keyOf(S.px, S.py)]; if (itemAt(cur(), S.px, S.py) < 0 && dc && dc.t === "fountain") doDrink(); else doPick(); };
$("bEat").onclick = doEat; $("bMagic").onclick = () => doMagic(); $("bDown").onclick = doDown;
$("bExpl").onclick = autoExplore;
if (mmCv) mmCv.onclick = e => { e.stopPropagation(); mapMode = (mapMode + 1) % 3; SND.sfx("ui"); };
$("items").addEventListener("click", e => {
  const el = e.target.closest("[data-use]"); if (!el) return;
  const k = el.dataset.use;
  if (k === "heal" || k === "poison") usePotion(k);
  else if (k === "scrollT" || k === "scrollL") useScroll(k);
  else if (k === "eat") doEat();
  else if (k === "zap") doMagic();
  else if (k === "pick") doPick(); else if (k === "drink") doDrink();
});

/* 身振り: 速いフリック＝移動 / 遅いドラッグ＝視点パン / タップ＝敵を狙う */
let pS = null;
cv.addEventListener("pointerdown", e => { SND.init(); stopAll(); pS = { x: e.clientX, y: e.clientY, t: performance.now(), cx: cam.x, cy: cam.y, moved: false }; });
cv.addEventListener("pointermove", e => {
  if (!pS) return;
  const dx = e.clientX - pS.x, dy = e.clientY - pS.y;
  if (Math.hypot(dx, dy) > 12) { cam.follow = false; pS.moved = true; }
  if (pS.moved) { cam.x = clampCamX(pS.cx - dx / cell); cam.y = clampCamY(pS.cy - dy / cell); }
});
cv.addEventListener("pointerup", e => {
  if (!pS) return;
  const dx = e.clientX - pS.x, dy = e.clientY - pS.y, dt = performance.now() - pS.t; pS = null;
  if (S && !S.dead && dt < 240 && Math.hypot(dx, dy) < 16) { tapAt(e.clientX, e.clientY); return; }
  if (S && !S.dead && dt < 300 && Math.hypot(dx, dy) > 40) {
    let a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)); a = ((a % 8) + 8) % 8;
    const DX = [1, 1, 0, -1, -1, -1, 0, 1], DY = [0, 1, 1, 1, 0, -1, -1, -1];
    if (e.shiftKey) runStep(DX[a], DY[a]); else movePlayer(DX[a], DY[a]);
  }
});
cv.addEventListener("pointercancel", () => { pS = null; });
function tapAt(clientX, clientY) {
  if (!S) return;
  const r = cv.getBoundingClientRect(), L = cur();
  const tx = Math.floor((clientX - r.left) / cell + cam.x), ty = Math.floor((clientY - r.top) / cell + cam.y);
  if (isWall(L, tx, ty)) return;
  const m = monsterAt(L, tx, ty);
  if (m && L.visible[ty][tx]) { doMagic(m); return; }
  if (tx === S.px && ty === S.py) { const dc = L.decor[keyOf(tx, ty)]; if (itemAt(L, tx, ty) < 0 && dc && dc.t === "fountain") doDrink(); else if (itemAt(L, tx, ty) >= 0) doPick(); }
}
cv.addEventListener("wheel", e => { e.preventDefault(); cam.follow = false; stopAll(); cam.x = clampCamX(cam.x + e.deltaX / cell * .5); cam.y = clampCamY(cam.y + e.deltaY / cell * .5); }, { passive: false });

window.addEventListener("keydown", e => {
  if (document.activeElement === $("heroName")) return;
  const k = e.key.toLowerCase();
  if (k === "tab") { e.preventDefault(); mapMode = (mapMode + 1) % 3; SND.sfx("ui"); return; }
  if (k === "escape") { if (busy) { stopAll(); msg(T("explStop")); } else if (!$("bookScr").classList.contains("hidden") || !$("helpScr").classList.contains("hidden") || !$("scoreScr").classList.contains("hidden")) { if (S) { hideOverlays(); } } return; }
  if (e.key === "B") { if (S && !S.dead) showBook("mob"); else showTitle(); return; }
  if (k === "?" || (k === "/" && e.shiftKey)) { showHelp(); return; }
  if (!S || S.dead || busy) return;
  let mv = null;
  if (e.key === "ArrowUp") mv = [0, -1]; else if (e.key === "ArrowDown") mv = [0, 1]; else if (e.key === "ArrowLeft") mv = [-1, 0]; else if (e.key === "ArrowRight") mv = [1, 0];
  else if (k === "w") mv = [0, -1]; else if (k === "s") mv = [0, 1]; else if (k === "a") mv = [-1, 0]; else if (k === "d") mv = [1, 0];
  else if (k === "k") mv = [0, -1]; else if (k === "j") mv = [0, 1]; else if (k === "h") mv = [-1, 0]; else if (k === "l") mv = [1, 0];
  else if (k === "y") mv = [-1, -1]; else if (k === "u") mv = [1, -1]; else if (k === "b") mv = [-1, 1]; else if (k === "n") mv = [1, 1];
  if (mv) { e.preventDefault(); if (e.shiftKey) runStep(mv[0], mv[1]); else movePlayer(mv[0], mv[1]); return; }
  if (k === "g") doPick(); else if (k === "e") doEat(); else if (k === "f") doMagic();
  else if (e.key === ">" || k === "enter") doDown(); else if (e.key === "<") doDown();
  else if (k === "m") rest(); else if (e.key === "." || k === ";") autoExplore();
  else if (k === "q") doDrink();
});

$("sndBtn").onclick = () => {
  SND.init(); SND.setMuted(!SND.isMuted());
  $("sndBtn").style.backgroundImage = "url(" + (SND.isMuted() ? ICONU.i_mute : ICONU.i_snd) + ")";
  $("sndBtn").classList.toggle("on", !SND.isMuted());
  if (!SND.isMuted()) { if (S && !S.dead) SND.bgm(cur().biome); else SND.bgm("title"); }
};
function setLang(l) { lang = l; localStorage.setItem(K_LANG, l); $("langSel").value = l; showTitle(); if (S) refreshHud(); }
$("langSel").onchange = e => setLang(e.target.value);
$("titleLangs").addEventListener("click", e => { if (e.target.dataset && e.target.dataset.l) setLang(e.target.dataset.l); });
$("diffSel").addEventListener("click", e => { if (e.target.dataset && e.target.dataset.d) { diff = e.target.dataset.d; localStorage.setItem(K_DIFF, diff); document.querySelectorAll("#diffSel button").forEach(b => b.classList.toggle("on", b.dataset.d === diff)); SND.sfx("pick"); } });
$("bNew").onclick = () => { SND.init(); newGame(); };
$("bCont").onclick = () => { SND.init(); loadRun(); };
$("bScore").onclick = showScores; $("bScoreClose").onclick = () => $("scoreScr").classList.add("hidden");
$("bBook").onclick = () => showBook("mob");
$("bOpenBook").onclick = () => { if (S) showBook("mob"); };
$("bHelp").onclick = showHelp; $("bOpenHelp").onclick = showHelp;
$("bClose").onclick = () => { $("bookScr").classList.add("hidden"); if (!S) showTitle(); };
$("hClose").onclick = () => { $("helpScr").classList.add("hidden"); if (!S) showTitle(); };
$("bookTabs").addEventListener("click", e => { if (e.target.dataset && e.target.dataset.t) showBook(e.target.dataset.t); });
$("bToTitle").onclick = () => { S = null; SND.bgm("title"); showTitle(); };
$("bKeep").onclick = () => { $("overScr").classList.add("hidden"); toast(T("wonHint")); saveRun(); };
$("bSaveScore").onclick = () => {
  const sc = getScores(); sc.push({ n: S.name || "???", s: score(), d: S.depth, l: S.lvl, dt: Date.now() });
  sc.sort((a, b) => b.s - a.s); localStorage.setItem(K_SCORE, JSON.stringify(sc.slice(0, 10)));
  $("bSaveScore").disabled = true; showScores();
};

/* ================= 起動 ================= */
buildSprites();
document.querySelectorAll("#dpad .key").forEach(b => { const u = ICONU["a_" + b.dataset.d]; if (u) b.style.backgroundImage = "url(" + u + ")"; });
$("langSel").value = lang;
$("sndBtn").style.backgroundImage = "url(" + (SND.isMuted() ? ICONU.i_mute : ICONU.i_snd) + ")";
$("sndBtn").classList.toggle("on", !SND.isMuted());
$("bOpenBook").style.backgroundImage = "url(" + ICONU.i_book + ")";
$("bOpenHelp").style.backgroundImage = "url(" + ICONU.i_help + ")";
new ResizeObserver(() => fitCanvas()).observe($("mapWrap"));
window.addEventListener("resize", fitCanvas);
document.addEventListener("visibilitychange", () => { if (document.hidden) saveRun(); });
document.addEventListener("pointerdown", () => { SND.init(); if (!S && !SND.isMuted()) SND.bgm("title"); }, { once: true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => drawLogo($("titleLogo")));
const lq = new URLSearchParams(location.search).get("lang");
if (lq && I18N[lq]) { lang = lq; localStorage.setItem(K_LANG, lq); $("langSel").value = lq; }
fitCanvas(); showTitle(); requestAnimationFrame(draw);

/* スクリーンショット／デバッグ用: ?auto=1 で即開始, ?auto=N 手ぶん自動で歩く */
(function () {
  const q = new URLSearchParams(location.search), a = q.get("auto");
  if (a === null) return;
  setTimeout(() => {
    $("heroName").value = $("heroName").value || "Lumen";
    newGame();
    if (q.get("cell")) { cellOverride = parseInt(q.get("cell"), 10) || 0; fitCanvas(); }
    if (q.get("book")) setTimeout(() => { MOBS.forEach(m => book.seen[m.id] = 1); showBook(q.get("book") === "item" ? "item" : "mob"); }, 80);
    const dp = parseInt(q.get("depth"), 10);
    if (dp > 1) {
      for (let k = 2; k <= dp; k++) if (!S.levels[k]) S.levels[k] = genLevel(k);
      S.depth = dp; const st = findStair(S.levels[dp], "<"); S.px = st.x; S.py = st.y; S.pdx = st.x; S.pdy = st.y;
      S.wepT = 2; S.armT = 1; S.ac = ARMORS[1].a - 1; S.lvl = 5; S.maxhp = 22; S.hp = 22; S.inv.wand = 6;
      SND.bgm(S.levels[dp].biome);
    }
    if (q.get("reveal")) { forceReveal = true; updateVis(); refreshHud(); }
    const n = parseInt(a, 10) || 0;
    let i = 0;
    const walk = () => {
      if (i++ >= n || S.dead) return;
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      const p = dirs[rnd(8)];
      if (!movePlayer(p[0], p[1], true)) movePlayer(dirs[rnd(8)][0], dirs[rnd(8)][1], true);
      setTimeout(walk, 20);
    };
    if (n > 0) setTimeout(walk, 200);
  }, 120);
})();

/* デバッグ用自己診断: ?test=1 でコンソールに PASS/FAIL を出す */
if (new URLSearchParams(location.search).get("test")) setTimeout(function () {
  const R = [], ok = (n, c) => R.push((c ? "PASS " : "FAIL ") + n);
  try {
    $("heroName").value = "Tester"; newGame();
    const L = cur();
    ok("gen level", L.grid.join("").indexOf(">") >= 0 && L.mons.length > 0);
    ok("d1 has no up stair", L.grid.join("").indexOf("<") < 0);
    L.items.push({ kind: "food", x: S.px, y: S.py, bob: 0 });
    const f0 = S.inv.food; doPick(); ok("pick item", S.inv.food === f0 + 1);
    S.wepT = 0;
    const weakWeapon = { kind: "wpn", tier: 0, x: S.px, y: S.py };
    L.items.push(weakWeapon); doPick();
    ok("leave weaker gear", L.items.includes(weakWeapon) && S.wepT === 0);
    S.hunger = 50; const hu = S.hunger; doEat(); ok("eat food", S.hunger > hu);
    const l0 = S.lvl; gainXP(9000); ok("level up", S.lvl > l0);
    let tx = -1, ty = -1;
    for (let dd = 1; dd <= 3 && tx < 0; dd++) for (let dx = -dd; dx <= dd && tx < 0; dx++) for (let dy = -dd; dy <= dd && tx < 0; dy++) {
      const x = S.px + dx, y = S.py + dy;
      if (!isWall(L, x, y) && L.visible[y][x] && !monsterAt(L, x, y) && !(x === S.px && y === S.py)) { tx = x; ty = y; }
    }
    if (tx < 0) ok("sighted tile", false);
    else {
      L.mons.push({ id: "rat", x: tx, y: ty, dx: tx, dy: ty, hp: 1, maxhp: 1, dmg: [1, 2], xp: 2, flee: 0, hurt: 0, wob: 0 });
      S.inv.wand = 6; const k0 = S.kills; doMagic();
      ok("magic kill + wand cost", S.kills === k0 + 1 && S.inv.wand === 5);
    }
    let targetTile = null;
    for (let dy = -3; dy <= 3 && !targetTile; dy++) for (let dx = -3; dx <= 3 && !targetTile; dx++) {
      const x = S.px + dx, y = S.py + dy;
      if (!isWall(L, x, y) && L.visible[y][x] && !monsterAt(L, x, y) && (dx || dy)) targetTile = { x: x, y: y };
    }
    if (!targetTile) ok("targeted magic", false);
    else {
      const target = { id: "rat", x: targetTile.x, y: targetTile.y, dx: targetTile.x, dy: targetTile.y, hp: 20, maxhp: 20, dmg: [1, 2], xp: 2, flee: 0, hurt: 0, wob: 0 };
      L.mons.push(target); S.inv.wand = 1;
      doMagic(target);
      ok("targeted magic", target.hp < target.maxhp && S.inv.wand === 0);
      L.mons.splice(L.mons.indexOf(target), 1);
    }
    const st = findStair(L, ">"); S.px = st.x; S.py = st.y;
    for (let y = 0; y < ROWS; y++) L.explored[y].fill(0);
    updateVis();
    warnDown = false; const d0 = S.depth; doDown(); ok("stair lock warns", S.depth === d0 && warnDown === true);
    doDown(); ok("descend", S.depth === d0 + 1 && S.px === findStair(cur(), "<").x);
    cur().items.push({ kind: "amulet", x: S.px, y: S.py, bob: 0 }); doPick(); ok("amulet = victory", S.won === true);
    S.won = false; S.dead = false; S.hp = 7; const px0 = S.px, dp0 = S.depth;
    saveRun(); loadRun();
    ok("save & continue", !!S && S.hp === 7 && S.px === px0 && S.depth === dp0 && Array.isArray(cur().visible[0]));
    S.hunger = 0; const hp0 = S.hp; endTurn(); ok("starvation hurts", S.hp < hp0 || S.dead);
    ok("explored pct sane", explPct(cur()) >= 0 && explPct(cur()) <= 100);
  } catch (e) { R.push("EXCEPTION " + e.message); }
  console.log("LDTEST " + R.join(" | "));
}, 400);
