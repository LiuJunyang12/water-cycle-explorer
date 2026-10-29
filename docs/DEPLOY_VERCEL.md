## 0) 先把代码推上 GitHub（只需做一次）

本机已经初始化好仓库、提交好全部内容（分支 `main`），并把远端 `origin` 指向你的仓库。**推送这一步必须在你自己电脑的窗口里做**（agent 的沙箱里没有你的 GitHub 登录凭证，无法代你登录）。

任选一种：

**A. 双击脚本（最快）**

```
D:\Teknologi Web Site\water-cycle-explorer\tools\push-to-github.cmd
```

会弹出 Git 凭据窗口 → 用 `LiuJunyang12` 登录 → 看到 `PUSH DONE` 就成了。

**B. 自己的 PowerShell 窗口**

```powershell
cd "D:\Teknologi Web Site\water-cycle-explorer"
git push -u origin main
```

**C. GitHub Desktop**：`File → Add local repository` 选这个文件夹 → 右上角 `Publish branch`。

推送完成后打开 <https://github.com/LiuJunyang12/water-cycle-explorer> 确认能看到 `src/`、`public/`、`package.json`，并且**看不到** `.env` 和 `design-assets/`（这两个是故意不提交的）。
# 发布到 GitHub → Vercel（公开网站）

这条路线适合这个项目：纯静态 Vite 站点，没有任何服务器代码，Vercel 免费额度足够。

最后一步（真正点按钮）由你操作，助手在旁边逐步给命令和截图位置。这份文档是那一次的
操作清单，照着做就行。

---

## 0. 发布前必须确认的 3 件事

| 检查项 | 怎么确认 |
| --- | --- |
| 本地能构建 | 项目根执行 `npm run build`（= `tsc --noEmit && vite build`），出现 `dist/` 且无报错 |
| 报告端点已配 | 项目根有 `.env`，里面一行 `VITE_REPORT_ENDPOINT=.../exec` |
| 大文件不进仓库 | `.gitignore` 里包含 `node_modules/`、`dist/`、`.env`、`.video-build/`、`design-assets/` |

> `dist/` 是构建产物，**不要**提交；Vercel 会自己跑 `npm run build` 生成。
> `.env` 里有端点网址，属于配置，Vercel 上要用「Environment Variables」单独填（见第 3 步）。

---

## 1. 把项目放进 Git 仓库

> **本机已经初始化好了**（助手代做）：`git init -b main` 已执行，首次提交
> `1cfaae3` 已创建，`159 个文件 / 21.9 MB`，`.gitignore` 与 `.gitattributes` 都在。
> 所以你只需要「建空仓库 → 加远程 → push」，下面的 `git init / add / commit` 三步
> 已经完成，留着只是让你知道仓库是怎么来的（想重来一次就照抄）。

### 方案 A：命令行（推荐，最可控）

```bash
cd "D:\Teknologi Web Site\water-cycle-explorer"

# 这三步助手已经做过了（保留作参考）
git init -b main
git add .
git commit -m "Water Cycle Explorer: 6 stesen, sijil, laporan Google Drive"
```

然后在 GitHub 网页点 **New repository**：

- Repository name：`water-cycle-explorer`（随便，但建议和项目同名）
- 可见性：**Public**（Vercel 免费版要能读到；Private 也行，但要在 Vercel 授权访问）
- 不要勾选 “Add a README file”（本地已经有内容，勾了会冲突）

创建后 GitHub 会显示仓库地址，回到命令行**只跑这三行**：

```bash
cd "D:\Teknologi Web Site\water-cycle-explorer"
git remote add origin https://github.com/<你的用户名>/water-cycle-explorer.git
git push -u origin main
```

> 如果建仓库时手滑勾了 README / .gitignore / license，push 会被拒绝
> （`rejected - fetch first`）。先跑 `git pull --rebase origin main`，再 `git push -u origin main`。
>
> 首次 push 通常弹出 GitHub 登录窗口（Git Credential Manager），浏览器里授权一次即可；
> 没有弹窗就按下面的 Personal Access Token 方式做。

第一次 push 会要求登录：用 **Personal Access Token** 当密码（GitHub → Settings →
Developer settings → Personal access tokens → Fine-grained tokens → 勾 `Contents: Read and write`）。
或者直接用 **GitHub Desktop** 图形界面（方案 B），不用管 token。

### 方案 B：GitHub Desktop（不想碰命令行就用这个）

1. 安装 <https://desktop.github.com/>
2. `File → Add local repository`，选 `D:\Teknologi Web Site\water-cycle-explorer`
3. 它会读 `.gitignore`，列表里应该只有源码、`public/`、`docs/`、配置文件
4. 左下角填 commit message → `Commit to main` → 右上 `Publish repository`
5. 取消勾选 “Keep this code private”（要公开网站）

> ⚠️ **不要用 GitHub 网页的「Upload files」拖整个文件夹**：网页上传不读 `.gitignore`，
> 会把 `node_modules`（几百 MB）一起传上去。

---

## 2. 在 Vercel 导入仓库

1. 打开 <https://vercel.com> → 用 GitHub 账号登录
2. 右上 **Add New… → Project**
3. 在列表里找到刚推上去的 `water-cycle-explorer` → **Import**
4. 构建配置（一般会自动识别，确认一下）：

   | 字段 | 值 |
   | --- | --- |
   | Framework Preset | **Vite**（自动识别） |
   | Root Directory | `./`（不动） |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |
   | Node.js Version | **22.x**（推荐）或 20.19+（`package.json` 已写 `engines: >=20.19`） |

5. **先别点 Deploy**，展开 **Environment Variables**，加一条：

   | Name | Value |
   | --- | --- |
   | `VITE_REPORT_ENDPOINT` | 你的 Apps Script `.../exec` 网址（整条，不要加引号） |

   只勾 **Production** 也可以，Preview 想测就一起勾。

6. 点 **Deploy**，等 1–2 分钟。

---

## 3. 发布后立刻验证

拿到 `https://<项目名>.vercel.app` 之后：

1. 首页能打开、背景图/音乐正常（说明 `public/` 资源路径没问题）
2. 依次进 6 个站，确认进度能保存（刷新后还在）
3. **第 6 站答完 → 输入名字 → 证书下方出现**
   `Laporan prestasi kuiz kamu sudah dihantar kepada guru.`
4. 回 Google Drive 看表格是否多了一行

如果第 3 步显示 `Tiada sambungan internet…`（入队文案），说明端点没生效：

- Vercel → 项目 → **Settings → Environment Variables** 检查名字拼写（必须 `VITE_` 开头）
- 改完环境变量要 **Redeploy**（Deployments → 最新一条 → ⋯ → Redeploy）

> 环境变量是**构建时**注入的：Vercel 上改了变量必须重新部署，否则旧包还是旧地址。

---

## 4. 以后改了代码怎么更新

```bash
git add .
git commit -m "说明这次改了什么"
git push
```

Vercel 监听到 push 会自动重新部署，几十秒后线上就是新版。不需要再点任何按钮。

---

## 5. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 部署失败，日志里 `vite: not found` | Install Command 被改了；恢复为 `npm install` |
| 页面白屏 | 打开浏览器控制台看报错；多半是资源 404，检查是否漏了 `public/` 里的文件 |
| 刷新页面 404 | 本项目用状态切换、没有路由，正常不会出现；若出现，Vercel 加 `rewrites` 到 `/index.html` |
| 报告没进表格 | 环境变量没配 / 没 Redeploy / Apps Script 部署权限不是「任何人」 |
| 体积/构建太慢 | `design-assets/` 已排除；若仍慢，检查是否误提交了 `node_modules` |

---

## 6. 这个仓库会包含什么

```
water-cycle-explorer/
├─ index.html
├─ package.json / package-lock.json
├─ tsconfig.json
├─ vite.config.ts
├─ .env.example          ← 只放变量名，不放真实网址
├─ src/                  ← 全部页面、游戏逻辑、组件
├─ public/               ← 站点实际用到的图片/音频/视频（约 22 MB）
├─ docs/                 ← ASSETS / VIDEO_STATION1 / REPORTING / 本文件
├─ tools/                ← 素材处理脚本（可选保留）
└─ .gitignore
```

`design-assets/`（168 MB 原始大图）默认不进仓库，只留在你电脑上做素材备份；
如果确实想连原图一起存档，把 `.gitignore` 里那一行删掉即可。
