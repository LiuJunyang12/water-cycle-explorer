# Cloud Kingdom 素材规范（第 3 站）

## 放哪里

* 源文件（原始素材，保留不删）：`design-assets/characters/` 与 `design-assets/illustrations/`
* 网页实际读取的副本：`public/assets/images/cloud-kingdom/`
* 两处都要放、文件名保持一致（网页是复制到 public 后用 ASCII 文件名加载）。

## 命名对照表

| 文件（源目录 + public 副本同名） | 用途 | 建议画布 | 缺图时的回退 |
| --- | --- | --- | --- |
| `wally-stand.png` | Wally 站立（默认） | 512×640 | CSS 水滴 + 笑脸 |
| `wally-walk.png` | Wally 移动中（按 A/D 或方向键） | 512×640 | 同上 |
| `wally-jump.png` | Wally 跳跃/离地 | 512×640 | 同上 |
| `hazard-air.png` | 会推动 Wally 的气流障碍 | 256×320 | 灰白斜条纹方块 |
| `door-masuk.png` | 第一个跑酷关卡的门 | 384×512（3:4 竖版） | 白色虚线门 |
| `door-keluar.png` | 第二个跑酷关卡的门（第三关暂时复用 masuk） | 384×512（3:4 竖版） | 白色虚线门 |

## 画法要求

1. **透明背景 PNG**，不要带白底或画布边框。
2. **三张 Wally 画布尺寸相同**（512×640），角色的头身比例、眼睛位置、颜色完全一致，只改姿势；这样切换立绘时不会跳动。
3. Wally 的**脚底贴近画布底边**，身体水平居中——场景是按"脚在平台顶面"对齐的。
4. 角色统一**朝右**画；向左走时程序会自动水平翻转（不会变形、不会换一张图）。
5. 跳跃姿势建议：身体拉长一点、手脚收起，让"跳"一眼能看出来。
6. 障碍 `hazard-air.png`：一堆斜向气流/涡旋，色调偏灰蓝、半透明都可以；**判定框按插画比例生成**（高 = 关卡里的 h，宽 = h × 0.45，即 4:5 画布），所以画在画布里的火焰/气流就是真正会撞到人的范围，不要再留很宽的透明边。
7. 门：有门框、门洞，最好能看出"关着/开着"状态；出口门的文字标签（MASUK / TERKUNCI）由程序画在门上，图里不要写字。
8. 文件大一点没关系，但单张建议 ≤ 600 KB；PNG-8/WebP 也行，只要改完文件名后的扩展名与代码一致（当前代码认 `.png`）。

## 缺图怎么办

游戏不会因此坏掉：任何一张图加载失败（404、格式错误），场景会**自动退回 CSS 图形**（水滴 Wally、灰条纹气流、虚线门），其他图照常显示。所以可以一张一张给，不需要凑齐。

## 处理流程（原图 → 网页用图）

原图（2000×2000、带大片透明边、每张 3–4 MB）不适合直接上线。处理脚本会自动完成三件事：

1. 裁掉四周的透明边（按 alpha 包围盒）；
2. 等比缩放到目标画布；
3. **底部居中**放进统一画布（Wally 三态与两道门统一 480×640，障碍 256×320），这样切换立绘不会"变大变小"、脚也始终踩在平台顶面。

运行方式（项目根目录）：

```powershell
powershell -ExecutionPolicy Bypass -File tools\process-sprites.ps1
```

处理结果写入 `public/assets/images/cloud-kingdom/`，单张 140–410 KB（原图 21 MB → 约 1.9 MB）。加新素材时改 `tools/process-sprites.ps1` 里的 `$jobs` 表再跑一次即可。


## 加图后的验证

1. 把图放进 `design-assets/characters|illustrations/`，再复制一份到 `public/assets/images/cloud-kingdom/`。
2. 开发服务器（`npm run dev`）会自动热更新，刷新第 3 站页面即可看到。
3. 如果图没出现，先看浏览器 Network 里该文件的请求是不是 404（路径大小写不匹配也会 404）。

## 第 4 站 Lembah Air Terjun（雨云 / 集水场景）

云与雨**永远由 CSS 绘制**（会随水量变暗、摇晃），不换插画，所以这两部分没有文件要求。

其余三样是**可选插画**：文件存在就用，缺失时自动回退到现在的 CSS 画法，所以随时可以分批给。

### 命名与规格

| 用途 | 源文件位置 | 副本位置 | 建议尺寸 / 画法 |
| --- | --- | --- | --- |
| 河谷背景（天空+山+河湖海） | `design-assets/illustrations/valley-bg.png` | `public/assets/images/waterfall-valley/valley-bg.png` | 1920×1080（16:9）。**不要画云、雨、水滴、Wally、文字**。水面（河/湖/海）放在画面下方约 26% 高度内，山体不要顶到最上沿，给云和漂浮水滴留出空间 |
| 小水滴（天上 12 颗） | `design-assets/illustrations/droplet.png` | `public/assets/images/waterfall-valley/droplet.png` | 透明 PNG，正方形 256×256，水滴占 ~200px，正面朝前（不分左右），**不带投影**、不带文字 |
| 集水大雨滴（云顶那颗） | `design-assets/illustrations/big-drop.png` | `public/assets/images/waterfall-valley/big-drop.png` | 透明 PNG，512×640，主体居中满高，**不带投影**；同一张会在 12 次合成中只会放大，不会再换图 |
| Wally（本站专用，可选） | `design-assets/characters/wally-valley.png` | `public/assets/images/waterfall-valley/wally.png` | 透明 PNG，480×640，脚底贴底、统一朝右；不给这张就自动用 `cloud-kingdom/wally-stand.png` |

### 放进去之后

```powershell
powershell -ExecutionPolicy Bypass -File tools\process-valley-assets.ps1
```

脚本会：裁掉透明边、等比缩放、按固定画布底部居中（背景则裁成 16:9），输出到
`public/assets/images/waterfall-valley/`。缺哪个文件就跳过哪个，可以分几次给。
跑完刷新页面即可看到，无需改代码。

### 回退顺序

- 背景：`valley-bg.png` → 失败则用 CSS 天空+太阳+两座山+河湖海
- 小水滴：`droplet.png` → 失败则用 CSS 水滴（渐变 + 高光）
- 集水滴：`big-drop.png` → 失败则用 CSS 水滴
- Wally：`wally.png` → `cloud-kingdom/wally-stand.png` → CSS 画的水滴脸

需要保留的视觉语义：云越暗 = 水越多；集水滴越大 = 汇聚的水越多；雨落到河/湖/海三处。

### 当前状态（2026-10-25）

四个文件已全部接入并处理完成：

| 文件 | 处理后尺寸 | 说明 |
| --- | --- | --- |
| `valley-bg.png` | 1920×1080 | 原图 2848×1600，cover 裁切；右下角带「豆包AI生成」水印 |
| `droplet.png` | 256×256（内容约 165×251） | 原图 2048×1152、16:9 布局，裁边后为竖长水滴 |
| `big-drop.png` | 512×640（内容约 413×627） | 与 `droplet.png` 是同一张源图，只是画布更大 |
| `wally.png` | 480×480（内容约 470×440） | 原图 2000×2000，Wally 坐在云上；画布改为正方形以贴合这张图 |

脚本的 alpha 阈值已从 8 提高到 **128**：低阈值会把图里很淡的光晕/水印雾算进内容范围，导致水滴裁出来偏到画布一侧。
## 第 5 站 Stesen Kitaran Air（无需新素材）

本页全部由代码绘制，不需要外部图片：

- 四张过程卡（Penyejatan / Kondensasi / Kerpasan / Pengumpulan）用内联 SVG 画出场景，位于 `src/components/learning/CycleCardArt.tsx`。
- 循环示意图（天空、太阳、山、云、雨、海、河）用 CSS 与一个 SVG 箭头层绘制，位于 `src/components/learning/WaterCycleDiagram.tsx` 与 `WaterCycleDiagram.css`。
- 页面里的 Wally 复用第 4 站的 `public/assets/images/waterfall-valley/wally.png`；文件缺失时图片会隐藏，不影响玩法。

若以后想换成手绘插画，建议位置：

| 用途 | 文件名 | 尺寸建议 |
| --- | --- | --- |
| 过程卡场景（4 张） | `public/assets/images/water-cycle/card-<proses>.png` | 320×240，透明背景，无文字 |
| 示意图背景 | `public/assets/images/water-cycle/diagram-bg.png` | 1600×900，不含文字与标注 |

注意：科学红线不可破——水蒸气不可见，示意图里不能画白色蒸汽；蒸发请画太阳加热水面与上升箭头，凝结请画云中的微小水滴。

## 第 6 站 Makmal Cabaran Sains（无需新素材）

本页也全部由代码绘制：

- 每题的小场景（太阳、云、雨、山谷、循环）用内联 SVG，位于 `src/components/learning/QuizArt.tsx`，按题目的 `scene` 字段切换。
- 可爱氛围靠 emoji（每题的 `emoji` 字段 + 页面漂浮气泡）与 CSS 动画营造，没有引入图片文件。
- 页面里的 Wally 复用 `public/assets/images/cloud-kingdom/wally-stand.png`；缺失时回退成 CSS 画的水滴脸。

每题左侧都有一张示例图。代码默认用内联 SVG 画（`src/components/learning/QuizArt.tsx`），只要把同名的图片放进
`public/assets/images/challenge-lab/`，页面会自动改用它：先试 `soalan-N.jpg`，再试 `soalan-N.png`，都失败才回退到 SVG（不会出现破图）。

已经放好的 8 张图（2026-10-26 处理）：原图 2048–2848px、合计约 21.5 MB，已缩到 **1200px 宽、JPEG 质量 85**，
合计约 **0.63 MB**；原图备份在 `design-assets/illustrations/challenge-lab/`。换成自己的图后建议同样压到 1200px 左右再放进来。

图片加载成功时，插画面板会收起内边距与浅蓝底板、隐藏 SVG 与 emoji 徽章，只显示图片本身。

| 题号 | 文件名 | 画面内容 | 尺寸建议 |
| --- | --- | --- | --- |
| q1 | `soalan-1.jpg` | 太阳照在海面上，橙色箭头表示水变成看不见的水蒸气向上走（Penyejatan） | 800×640 |
| q2 | `soalan-2.jpg` | 太阳是能量的来源：阳光洒向大地/水面 | 800×640 |
| q3 | `soalan-3.jpg` | 桌上冒着白雾的热茶杯——白雾是微小水滴，水蒸气本身看不见 | 800×640 |
| q4 | `soalan-4.jpg` | 高空中的水蒸气冷却，变成微小水滴，聚成云（Kondensasi） | 800×640 |
| q5 | `soalan-5.jpg` | 云的特写：里面是许多微小水滴与冰晶（不是棉花、不是白蒸汽） | 800×640 |
| q6 | `soalan-6.jpg` | 灰云下起雨，雨点落到地面水洼（Kerpasan） | 800×640 |
| q7 | `soalan-7.jpg` | 雨水汇成小溪，流进河、湖、海（Pengumpulan） | 800×640 |
| q8 | `soalan-8.jpg` | 完整的水循环：太阳、海、云、雨、河流，用循环箭头连起来 | 800×640 |

画法要求：

- 透明背景 PNG（如果画了天空背景也可以，但请填满整张图，不要留白边）。
- 主体居中、四周留约 8% 安全边距；不要在图里写文字或数字（题目文字由网页显示）。
- 比例建议 5:4（800×640）；其他比例也能用（`object-fit: contain`），只是左右或上下会有留白。
- 每张图只讲一个概念，风格与第 3、4 站插画保持一致（描边、圆润、明亮）。
- 图放在右上角的 emoji 徽章会被压在图片上方；如果你不希望 emoji 遮住插画，说一声我把它移除。

文件名在 `src/data/challengeLabAssets.ts` 的 `QUIZ_ART` 里定义，想改名字改那里即可。
结算卡片目前纯 CSS 绘制，不需要素材；若要加装饰图，建议 `public/assets/images/challenge-lab/result-celebration.png`（900×600，透明背景）。

注意：水蒸气不可见这条红线同样适用——「云」题只能画微小水滴/冰晶，不能画白色蒸汽。
## Offline e-book（首页菜单的 OFFLINE E-BOOK）

| 项目 | 内容 |
| --- | --- |
| 网页读取路径 | `public/assets/images/../ebook/offline-ebook.pdf`（实际文件：`public/assets/ebook/offline-ebook.pdf`） |
| 下载时的文件名 | `E-book-Kitaran-Air.pdf`（`src/data/homeContent.ts` 的 `fileName`） |
| 当前文件 | `Offline e-book.pdf`，11 页，11.96 MB，未加密 |
| 文案 | `OFFLINE_EBOOK.description` / `meta`（弹窗里显示「PDF · 大约 12 MB」） |

**两个按钮**：`Muat Turun …` 走 `<a download>` 直接存盘；`Baca dalam talian` 在
新标签页用浏览器自带 PDF 阅读器打开（手机端会自动调起阅读器）。

**换文件**：把新的 PDF 覆盖成 `public/assets/ebook/offline-ebook.pdf`（或改
`fileUrl`），并同步 `fileName` 与 `meta` 里的体积说明；`fileUrl` 设为 `null`
会回到「尚未提供」的禁用状态。