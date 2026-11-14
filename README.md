# 六層の灯 −LANTERN DEPTHS−

[日本語](#日本語) | [English](#english) | [中文](#中文)

ドット絵化したローグライク。`NetHack Lite` のルールをそのまま受け継いだ改良版です。
シングルページ（サーバー不要）・オフライン動作・スマホ縦画面優先。

![gameplay](assets/screenshots/gameplay.png)

---

## 日本語

### 概要
`NetHack Lite`（ASCII ログライク）を **16×16 ドット絵**で描き直した改良版です。
ルール（階層・敵・アイテム・空腹・視界・経験値・ハイスコア）はすべて継承したまま、
灯り・戦闘の手触り・読みやすさ・快適操作を強化しています。

### 起動方法
1. `index.html` をブラウザで開く（ダブルクリックで OK / サーバー不要）
2. 「冒険開始」をタップ

`libs/` のライブラリは同梱済みなので **ネットなしでも遊べます**。
（万一 `libs/` が欠けていても CDN から自動取得します）

対応: 最新 Chrome / Safari / Edge / Firefox（iOS・Android・Windows・macOS）

### 操作方法
| アクション | スマホ | PC |
|---|---|---|
| 移動 / 攻撃 | スワイプ(速く) / 8方向パッド / **長押しで走る** | 矢印 / WASD / hjkl(yubn) / **Shift+方向で走る** |
| 敵を狙って魔法 | 敵をタップ | F（最寄りの敵） |
| 視点スクロール | ドラッグ(ゆっくり) / ホイール | ホイール・ドラッグ |
| 拾う | `G` | `g` |
| 食べる | `E` | `e` |
| 魔法 | `F` | `f` |
| 泉水を飲む | 泉水の上で `G` / 泉水をタップ | `g` / `q` |
| 階段の昇り降り | 階段マスに乗って階段ボタンをタップ | 階段マスに乗って `>` / `<` |
| 自動探索 | 🧭 ボタン | `.` |
| 休息 | パッド中央 `·` | `m` |
| 図鑑 / 操作説明 | ヘッダのボタン | `Shift+B` / `?` |
| ポーション・巻物 | アイテム欄をタップ | – |

※ スマホでは、画面内に階段が見えているだけでは階段ボタンは有効になりません。8方向パッドで主人公を階段マスまで移動させてください。探索率が55％未満で降りる場合は、確認メッセージの後にもう一度階段ボタンをタップします。

### 継承したルール（NetHack Lite と同じ）
- **目的**: 深さ6の「ヨンドアの護符」を取ると勝利。その後も潜ってスコア稼ぎできる。
- **攻撃**: 敵のマスへ移動すると攻撃。反撃される前に離れよう。
- **空腹**: 毎ターン減少。保存食で回復、0 で HP 減少。
- **視界**: 光源から遠いほど暗い。探索済みはうすく記憶。
- **成長**: 敵を倒すと経験値 → レベルで HP・攻撃上昇。武器 `)` と鎧 `[` は上位を自動採用。
- **杖**: マジックミサイル。杖が無いときは指のビーム（弱）。
- **世界**: 39×29 マスの階層、画面より広いのでカメラでスクロール。
- **保存**: localStorage（サーバー送信なし）。
- **多言語**: 日本語 / English / 中文。**音**: Web Audio 合成。

### 改良した点
1. **ドット絵化** — 16×16 スプライト（主人公・11種の敵・アイテム・タイル）をすべて自作データから生成。階層別に 3 種のタイルセット（岩窟／遺跡／魔城）。
2. **灯りの演出** — 主人公の松明と壁の松明が周囲を照らす。マス目状の明暗＋暖色グロー＋ビネット＋走査線。
3. **戦闘の手触り** — ダメージ数字、会心の一撃、被弾フラッシュ、画面シェイク、火花・血飛沫、敵の被弾点滅、HP バー。
4. **敵の個性** — 各敵に特殊行動：巨大ネズミは2回動く／コーボールドは石を投げる／ゴブリンは金を盗んで逃げる／大蛇と蜘蛛は毒と糸／幽霊は壁を抜けて経験を吸う／トロルは再生／ゾンビは硬い／オークは重い一撃／ドラゴンは火炎ブレス。
5. **泉水（わき水）** — 飲めば回復、たまに当たらない。
6. **自動探索・走り** — `.` / 🧭 で未探索へ、Shift+方向で走る（敵を見る・物を拾うと停止）。
7. **図鑑** — 出会った敵のイラストと能力、発見済みアイテム・装備の一覧。
8. **階段ロック（軟）** — 探索 55% 未満で降りると警告。もう一度押すと降ります。
9. **HUD** — HP／経験値／空腹をバー表示、探索率、討伐数、階層タグ。
10. **難易度** — やさらか／ふつう／死地（被ダメ・敵数・経験値・初期HPが変化）。
11. **BGM** — 階層（生物群系）別のチップチューン。効果音も場面別に刷新。
12. **その他** — 勝利後も続行ボタンでそのまま潜行、ハイスコアは旧版 `nh_scores` を移行表示、画面解像度に応じた自動ズーム。

### 保存されるデータ
| キー | 内容 |
|---|---|
| `ld_save` | 冒険中のデータ（タイトル画面の「続きから」で再開） |
| `ld_scores` | ハイスコア上位10件（無い場合、旧版 `nh_scores` を表示） |
| `ld_name` / `ld_lang` / `ld_diff` | 名前・言語・難易度 |
| `ld_book` | 図鑑の発見記録（階層をまたいで残る） |

### 使用ライブラリ（`libs/` に同梱／ネットから取得）
| ライブラリ | 用途 | 取得元 |
|---|---|---|
| [GSAP 3.12.5](https://gsap.com) | タイトル／結末画面のアニメーション | jsDelivr |
| [Tone.js 14.7.77](https://tonejs.github.io) | チップチューンBGM・効果音 | jsDelivr |
| [DotGothic16](https://fonts.google.com/specimen/DotGothic16) | 日本語ドットフォント | Google Fonts |
| [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) | 英数字ピクセルフォント | Google Fonts |

いずれも無くても遊べるよう、フォールバック（自前補間＋内蔵シンセ）を用意しています。

### 開発者向け
```
lantern-depths/
├ index.html          … 画面構成とライブラリ読み込み
├ css/style.css       … ピクセルUI
├ js/art.js           … ドット絵データ（1文字＝1ピクセル）
├ js/pixel.js         … スプライト化・タイル手続き生成・3x5フォント
├ js/audio.js         … 効果音・BGM（Tone.js／内蔵シンセ）
├ js/game.js          … ゲーム本体
└ tools/preview_art.py… art.js をPNGコンタクトシートにして目視検証
```
`index.html` に URL パラメータを付けるとデバッグできます（遊びには影響しません）。

| URL | 動作 |
|---|---|
| `?auto=40` | 自動で40歩あるく |
| `?depth=5` | 深さ5へ飛ぶ |
| `?reveal=1` | 全マスを表示 |
| `?cell=52` | マス目の大きさを固定 |
| `?book=1` | 図鑑を開く（`item` でアイテム欄） |
| `?test=1` | 内部セルフテストをコンソールへ出力 |

---

## English

A **pixel-art** remake of the `NetHack Lite` roguelike: same rules, better game feel.
Open `index.html` in any modern browser — no server, works offline (libraries are bundled).

**Inherited**: Amulet of Yendor at depth 6, walk-into-to-attack combat, hunger, LOS vision with
distance falloff and explored memory, XP/levels, auto-upgrading weapons & armor, wand of magic
missile, 39×29 scrolling levels, localStorage saves, ja/en/zh, synthesized sound.

**Improved**: 16×16 hand-authored sprites and 3 depth tilesets; torch lighting with banded
shadows, glow and scanlines; damage numbers, crits, screen shake and particles; per-monster
traits (rock throwing, gold stealing, poison, webs, wall-passing XP drain, regeneration, fire
breath); fountains; auto-explore and running; a bestiary; soft stair lock; bar-based HUD;
three difficulty levels; per-biome chiptune BGM; legacy high scores are imported.

Libraries (bundled, fetched from jsDelivr / Google Fonts): GSAP, Tone.js, DotGothic16,
Press Start 2P — all optional, with fallbacks.

---

## 中文

`NetHack Lite` 的**点绘（像素画）改良版**：规则完全继承，操作手感与画面全面升级。
直接用浏览器打开 `index.html` 即可，无需服务器，离线可玩（库已内置）。

**继承**：深度6的护身符、走入攻击、饥饿、视线与记忆、经验升级、装备自动更新、
魔法飞弹杖、39×29 可滚动地图、localStorage 存档、中日英三语、合成音效。

**新增**：16×16 自绘像素图与三套地层贴图；火把光照与暗部分层；伤害数字、会心、
画面震动与粒子；每种怪物的特殊能力（投石、偷金、中毒、蛛网、穿墙吸经验、再生、
龙息）；泉水；自动探索与奔跑；图鉴；楼梯提示；条形 HUD；三种难度；分层芯片音乐。

依赖库（已内置，取自 jsDelivr / Google Fonts）：GSAP、Tone.js、DotGothic16、Press Start 2P，
均可缺失（有降级方案）。

---

License: MIT-like — do whatever you like with this code. / このコードは自由に利用可。/ 代码可自由使用。
（同梱ライブラリ・フォントはそれぞれのライセンスに従ってください: GSAP=greensock.com/free-software-license,
Tone.js=MIT, DotGothic16・Press Start 2P=SIL Open Font License 1.1）
