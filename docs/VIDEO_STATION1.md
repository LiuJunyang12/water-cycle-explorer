# 第 1 站（Stesen Khemah）开场视频：重制方案

> 状态：方案待确认（未开始制作）。确认后由我用 Remotion 生成 MP4，替换 `public/videos/khemah-video.mp4`。

## 1. 现有视频的实测情况

| 项目 | 实测值 |
| --- | --- |
| 文件 | `public/videos/khemah-video.mp4`（6.03 MB，源文件 `design-assets/animations/视频.mp4`） |
| 分辨率 / 帧率 | 1280×720 / 24 fps |
| 时长 | 3 分 08 秒 |
| 音轨 | 英文 AAC（一首儿歌） |
| 画面内容 | 雨中撑伞的水滴博士 → 山谷河流 → 加热烧杯（蒸发）→ 水汽上升 → 锅盖冷凝 → 云形成 → 土壤地下水 → 水循环示意图 → 雪地升华 → 片尾 "The Dr. Binocs Song" |

### 需要替换的五个理由

1. **不是马来文**：本站学习语言是马来文（关键术语括注英文），现有视频全程英文儿歌。
2. **第三方 IP**：主角是 Dr. Binocs，片尾出现频道 Logo 与歌名。网站要放上 GitHub 公开演示，这段素材属于别人的版权内容。
3. **超纲**：视频讲了 sublimation（升华）与地下水，SP 8.2.3 / 8.2.4 只要求蒸发、凝结、降水、汇集。
4. **太长**：3 分 08 秒，而本站要求「看满 100% 才算完成」，学生容易卡在进度上；缩短到 100 秒左右更顺。
5. **风格不统一**：扁平蓝绿插画 + 红眼罩角色，与 Wally 与我们的 Nature-Inspired Cartoon 配色（#67B971 / #F6F9E4 / #24452B）不一致。

## 2. 新视频规格

| 项目 | 决定 |
| --- | --- |
| 画幅 | 1920×1080（16:9），与页面播放器比例一致 |
| 帧率 | 30 fps |
| 时长 | **约 100 秒**（1:40）；下限 80 秒、上限 120 秒 |
| 编码 | H.264（High）+ AAC 立体声，MP4 faststart；成品控制在 8 MB 以内 |
| 语言 | 画面文字与旁白全马来文，关键词括注英文术语 |
| 旁白 | 方案 A：你录音（推荐，最有温度）；方案 B：我做成「字幕 + 配乐」无旁白；方案 C：AI 语音（需额外工具，音色可能不自然） |
| 配乐 | 复用现有 `public/audio/bgm-cute.mp3`，音量压到旁白的 15–20% |
| 字幕 | 马来文字幕烧进画面（小屏也看得清），每行 ≤ 42 字符、停留 ≥ 2.5 秒 |
| 片头片尾 | 无 Logo、无频道名；片尾 3 秒「Jom terokai! 」+ Wally |
| 科学红线 | 水蒸气不可见（只画蓝色箭头/热浪线，不画白汽柱）；云由微小水滴与冰晶组成；太阳是能量来源；蒸发可在沸点以下发生 |

## 3. 分镜表（约 100 秒）

| # | 时间 | 画面 | 屏幕文字（马来文 / 术语） | 旁白 |
| --- | --- | --- | --- | --- |
| 0 | 0:00–0:06 | 营地清晨，帐篷、山与河；Wally 挥手入画 | `Kitaran Air` / `The Water Cycle` | — |
| 1 | 0:06–0:16 | 太阳升起照到河面与营地水洼 | — | — |
| 2 | 0:16–0:30 | 阳光加热水面，水面冒起热浪线，蓝色箭头向上 | `Penyejatan` / `Evaporation` | Air di laut, sungai dan lopak dipanaskan oleh matahari. Air bertukar menjadi wap air. |
| 3 | 0:30–0:42 | 天空：只有虚线箭头向上升，**不画任何白汽/水汽形状**；Wally 指向上方 | `Wap air tidak kelihatan` / `Vapour is invisible` | Wap air tidak kelihatan, tetapi ia naik ke atas. |
| 4 | 0:42–0:58 | 高空气温变冷，箭头转成小水滴聚在一起，形成云 | `Kondensasi` / `Condensation` | Wap air menjadi sejuk dan bertukar menjadi titisan air kecil. Titisan ini berkumpul menjadi awan. |
| 5 | 0:58–1:12 | 云越来越灰、变重，雨滴落下（慢镜头 2 拍） | `Kerpasan` / `Precipitation` | Apabila awan terlalu berat, titisan air jatuh sebagai hujan. |
| 6 | 1:12–1:24 | 雨水流入小溪 → 河 → 湖与海 | `Pengumpulan` / `Collection` | Air hujan mengalir ke dalam sungai, tasik dan laut. |
| 7 | 1:24–1:36 | 四步循环箭头闭合成环，Wally 站在中间 | `Kitaran air berterusan` | Kitaran air berulang lagi dan lagi. |
| 8 | 1:36–1:44 | 收尾卡片：三个问题（与站内提问一致）+ Wally | `Dari manakah datangnya hujan?` 等 | Jom kita terokai bersama! |

镜头语言：缓推 / 缓移为主（每镜头 4–8 秒），转场统一用 300 ms 白到透明的柔光叠化，避免花哨特效；同一场景内的元素分层做 1.02–1.06 的轻微视差。

## 4. 需要你提供的素材

放到 `design-assets/video/station-1/assets/`；合成脚本直接从这里读取，素材不进部署包。

| 文件名 | 尺寸 | 说明 |
| --- | --- | --- |
| `bg-01-camp.png` | 1920×1080 | 营地清晨全景（帐篷、山、河），**不含**太阳、云、雨、Wally、文字 |
| `bg-02-sky.png` | 1920×1080 | 天空/云层背景（放云与雨用），可只画渐变与远山 |
| `fg-01-sun.png` | 800×800 | 太阳，透明背景 |
| `fg-02-cloud-white.png` | 1200×700 | 轻薄白云，透明背景 |
| `fg-03-cloud-grey.png` | 1200×700 | 厚重灰云（下雨前），透明背景 |
| `fg-04-river.png` | 1600×600 | 河流/湖面局部，透明背景（用于第 6 场汇流） |
| `fg-05-rain.png` | 800×1200 | 一组雨滴（我会复制多份做雨势），透明背景 |
| `fg-06-droplets-cluster.png` | 600×600 | 云内聚成的小水滴团，透明背景 |
| `wally-point.png` | 480×640 | Wally 抬手指向斜上方（讲解用），透明背景、脚底贴底、朝右 |

可选（有更好，没有我用现有素材代替）：`fg-07-arrow-loop.png`（循环箭头）、`fg-08-tent.png`（帐篷单独件，用于近景）。

通用要求：PNG 透明背景、同场景同一光照方向（光从左上来）、无自带阴影与文字、不要裁到画布边缘；三张 Wally 立绘（站立/移动/跳跃）已有，可继续复用。

## 5. 制作流程

1. 你确认分镜与旁白文案（可直接改 `docs/VIDEO_STATION1.md`）。
2. 你放素材到 `design-assets/video/station-1/assets/`，我做尺寸/透明边检查；渲染脚本直接读取该目录。
3. 我用 Remotion 写一个 100 秒合成（场景、字幕、镜头运动、配乐），先渲染 720p 预览给你看。
4. 你确认后渲染 1080p 成品 → 覆盖 `public/videos/khemah-video.mp4`（旧文件备份到 `design-assets/animations/`）。
5. 站内不需要改代码；`src/data/campStation.ts` 的 `REQUIRED_WATCH_RATIO` 保持 `1`（必须看完整个视频才通关）。

## 5b. Wally 姿态清单（视频用）

画布统一 **960×1280**（现有立绘 480×640 的 2 倍，1080p 里才不糊），透明背景、脚底贴底、默认朝右、同一身体比例与配色；我负责缩成站内用的 480×640。
姿态之间**只改手臂与表情，身体、比例、光照方向完全一致**，这样切换时不会「变形」。

### 必须有（5 个）

| 文件名 | 动作 | 用在哪 |
| --- | --- | --- |
| `wally-idle.png` | 站直微笑、双手自然垂下 | 已有 `wally-stand.png` 可直接复用，可跳过 |
| `wally-wave.png` | 一只手举高挥手、另一只手放身侧、嘴巴张开笑 | 0:00 片头打招呼；片尾收卡 |
| `wally-point-up.png` | 一只手抬到斜上方指向天空，头微微上仰 | 蒸发 / 水汽上升（0:16–0:42） |
| `wally-umbrella.png` | 一只手撑着小伞（伞可以并入同图，也可以单独给 `fg-09-umbrella.png`） | 降雨段（0:58–1:12） |
| `wally-cheer.png` | 双手举高、身体微微跳起、笑眼 | 1:24 循环闭合欢呼；片尾 |

### 有更好（4 个，能明显加分）

| 文件名 | 动作 | 用在哪 |
| --- | --- | --- |
| `wally-point-right.png` | 手臂水平指向右侧（指云/指雨） | 凝结段与水循环示意图 |
| `wally-surprised.png` | 嘴巴 O 形、眼睛睁大、双手举起 | 云变灰变重那一刻（0:58） |
| `wally-think.png` | 一手托下巴、眉毛一高一低 | 1:36 三个提问卡 |
| `wally-worried.png` | 眉毛下垂、手放胸口 | 可选，用于「云太重了」的过渡 |

### 如果想做「真招手」动画（可选）

再给 `wally-wave-02.png`（举高的那只手向左偏 15–20°、身体不变）。
有了 2 张我就能以 6 fps 交叉淡入做出挥手循环；只有 1 张的话我用「整体 ±3° 摆动 + 上下轻弹」模拟，效果也自然，只是手臂不会真的摆。

### 顺带能丰富画面的非 Wally 素材（可选）

- `fg-10-sun-face.png`：带笑脸的太阳（现版太阳没有表情，加脸更亲和）
- `fg-11-cloud-face.png`：带笑脸的白云（降雨前可换 `fg-03-cloud-grey.png` 表现「变重」）
- `fg-12-splash.png`：一组水花（雨滴落水面用）

这些动作除了视频，也能复用到站内：`wally-wave` 可用于首页打招呼，`wally-cheer` 可用于各站通关弹窗，`wally-think` 可用于提问卡。
## 6. 待你确认

1. 时长接受 ~100 秒吗？（或更短，60–75 秒也能讲完四步）
2. 旁白用哪种：你录音 / 字幕+配乐 / AI 语音？
3. 要不要保留「升华（sublimation）」这一段作为延伸？我建议**不要**，超纲。

## 交付状态（2026-10-29）

- 已用 `tools/build-video-1.ps1` 渲染正式版并替换 `public/videos/khemah-video.mp4`：**1920×1080、30 fps、1 分 35.5 秒、7.6 MB**（H.264 High + AAC 160 kb/s，SAR 1:1，faststart）。
- 720p 草稿留在 `.video-build/khemah-video-preview-720p.mp4`，原 Dr. Binocs 视频备份在 `.video-build/khemah-video-original.mp4`（均不参与部署）。
- 第 1 站通关条件改为「必须看到结尾」（`REQUIRED_WATCH_RATIO = 1`）。
