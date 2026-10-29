# Water Cycle Explorer

互动式多媒体科学学习网站 —— **Kitaran Air Semula Jadi（自然水循环）**

面向马来西亚小学五年级（约 11 岁）学生的科学学习网站。以卡通科学探索（Nature-Inspired Cartoon Science Adventure）为视觉风格，通过动画、互动探索、排序任务、图示建构、数字测验与学习反思，帮助学生在真实操作中理解水循环。

> ⚠️ **开发前必读：** 任何代码、素材或页面任务的开始前，必须先阅读 [`PROJECT_RULES.md`](PROJECT_RULES.md)。该文件是本项目的强制开发规范。

---

## 1. 项目基本资料

| 项目 | 内容 |
|---|---|
| 项目名称 | Water Cycle Explorer |
| 学习主题 | Kitaran Air Semula Jadi（自然水循环） |
| 科目 / 年级 | Sains / Tahun 5 |
| 主题 | Sains Bahan |
| 内容标准 | 8.0 Jirim |
| 学习标准 | 8.2.3、8.2.4 |
| 目标用户 | 马来西亚小学五年级学生（约 11 岁）|
| 课程背景 | EDUP6023 — Teknologi untuk Pengajaran dan Pembelajaran，Tugasan 3: Penghasilan Produk |
| 教学设计模式 | ASSURE（60 分钟，30 人，6 组 × 5 人）|
| 主要开发工具 | DeepSeek Harness（Vibe Coding）|

**学习标准**
- **SP 8.2.3** — 将水的状态变化与云和雨的形成联系起来。
- **SP 8.2.4** — 通过绘图、ICT、书写或口头表达，创造性地解释有关水状态变化的观察。

**学习成果**
1. 正确识别至少四个主要水循环过程。
2. 以至少 80% 的准确率排列至少五个水循环阶段。
3. 解释蒸发、凝结、云形成和降水之间的关系。
4. 创建完整的数字水循环图，并解释主要过程之间的联系。

---

## 2. 规划中的页面

| # | 页面 | 学习功能 |
|---|---|---|
| 1 | Home | 导入主题，明确学习目标，`MULA PENGEMBARAAN` 进入 |
| 2 | Adventure Map | 学习路线总览、真实进度、可重进已完成内容 |
| 3 | Mission Start | 激活先前知识 + 诊断性评估 |
| 4 | Science Lab | 核心互动场景：点击太阳／水体／云／降雨，理解六个过程 |
| 5 | Cycle Builder | Part A 阶段排序 + Part B 数字图示建构 |
| 6 | Scientist Challenge | 5 道题 + 至少 1 道 KBAT，附解释性反馈 |
| 7 | Reflection & Achievements | 学习总结、徽章、知识回顾、反思 |

**核心科学内容：** Penyejatan、Kondensasi、Pembentukan Awan、Kerpasan、Pengumpulan Air、Penyejatan Semula。

**语言：** 马来文为主要学习语言，关键术语可附英文（如 `Penyejatan (Evaporation)`）。

---

## 3. 技术栈

| 项目 | 方案 | 状态 |
|---|---|---|
| 框架 | React 19 + TypeScript | 已验证可用（环境探测）|
| 构建工具 | Vite 8 | 已验证可用 |
| 样式 | 纯 CSS + CSS 变量设计系统 | 规划中 |
| 测试 | Vitest + jsdom + Testing Library | 已验证可用 |
| 路由 | 类型化页面状态（暂不引入 react-router）| 规划中 |

> 以上「已验证可用」仅指**在开发环境中能安装、构建、起服务、跑测试**，不代表网站代码已存在。代码尚未开始（见第 6 节）。

---

## 4. 目录结构（当前实际状态）

```text
water-cycle-explorer/
├── PROJECT_RULES.md          # 强制开发须知（每次任务前必读）
├── README.md                 # 本文件
├── design-assets/            # 项目所有者提供的原始设计素材（原始文件不修改）
│   ├── README.md             # 素材库用途、规则与整合要求
│   ├── characters/           # Wally 等角色素材
│   ├── backgrounds/          # 背景、自然景观
│   ├── illustrations/        # 水循环及科学插画
│   ├── icons/                # 图标
│   ├── animations/           # 动画及相关素材
│   └── other/                # 其他素材
├── public/                   # 待建立：网站实际使用的素材（含 public/assets/）
└── src/                      # 待建立：网站源代码
```

**规划中的代码结构（尚未创建）：**

```text
src/
├── components/   common/ navigation/ feedback/ learning/
├── pages/        HomePage.tsx, AdventureMapPage.tsx, MissionStartPage.tsx,
│                 ScienceLabPage.tsx, CycleBuilderPage.tsx,
│                 ScientistChallengePage.tsx, ReflectionPage.tsx
├── data/         waterCycle.ts, quizQuestions.ts, missions.ts, achievements.ts
├── hooks/        useProgress.ts, useReducedMotion.ts
├── styles/       variables.css, global.css, animations.css
├── types/        waterCycle.ts, progress.ts
├── App.tsx
└── main.tsx
```

---

## 5. 设计系统要点

- 主绿色 `#67B971`：导航、背景区域、进度与强调。
- 淡奶油绿 `#F6F9E4`：内容卡片、任务面板、知识说明、测验区域。
- 深绿色：主要文字。
- 自然元素保留本色（蓝天、黄色／橙色太阳、白色／浅灰云、蓝色水、自然绿色植物与山丘）——不得为了统一配色把自然元素全部改绿。
- 统一按钮、卡片、圆角、间距与导航；按钮须有 default / hover / focus / active / disabled 状态。
- 动画须简洁，并支持 `prefers-reduced-motion`。

---

## 6. 当前状态

| 项 | 状态 |
|---|---|
| 开发规范 `PROJECT_RULES.md` | ✅ 已建立 |
| 素材库 `design-assets/` | ✅ 已建立（**目前为空**，等待项目所有者提供素材）|
| 网站代码（`src/`、`public/`、`package.json` 等）| ⬜ **尚未开始** |
| 页面与互动功能 | ⬜ 尚未开始 |
| 部署（GitHub / 公开链接）| ⬜ 尚未开始 |

---

## 7. 本地开发环境说明

当前项目尚未包含 `package.json`，以下命令在代码脚手架建立后生效：

```bash
npm install     # 安装依赖
npm run dev     # 启动本地开发服务器
npm run build   # 生产构建，输出 dist/
npm run test    # 运行测试
```

**本机注意事项（针对当前开发机器）：** 因开发环境限制，npm 缓存必须指向项目外的工具目录，安装时请使用：

```bash
npm install --cache "D:\Teknologi Web Site\.tools\npm-cache"
```

该缓存目录不进入版本控制，与网站源码分离。

---

## 8. 相关资料

- [`PROJECT_RULES.md`](PROJECT_RULES.md) — 强制开发规范（任务前必读）。
- [`design-assets/README.md`](design-assets/README.md) — 素材库使用规则。

---

## 9. 备注

- 所有科学内容、动画、测验与反馈必须符合水循环科学事实（水蒸气不可见；云由微小水滴或冰晶组成；太阳能量驱动蒸发；水循环是持续过程但不同水滴路径可以不同）。
- 进度、分数与徽章必须对应真实任务状态，不得虚增。
- 若未连接数据库或账号系统，网站不得声称能永久保存学习记录；进度保存方式须向学生说明。
