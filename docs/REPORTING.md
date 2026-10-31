# 学生答题报告 → Google Drive（老师后台数据库）

第 6 站结束、学生写下名字拿到证书的那一刻，站点会把这次答题的完整成绩单
POST 到一个 **Google Apps Script 网站应用**；脚本把数据写进
**Google 表格**（一行一个学生）并在 **Google Drive 文件夹**里存一份**该学生的证书图片（PNG）**。
整站仍然是纯静态站点（GitHub Pages 可部署），不需要服务器、不需要数据库费用，
学生也不需要注册任何账号。

```
浏览器（学生）
   │  POST JSON（text/plain，无预检；内含证书 PNG 的 base64）
   ▼
Apps Script Web App（部署在老师的 Google 账号下）
   ├─► Google 表格「Laporan」：一行一次答题，老师直接看表格 / 做图表
   └─► Google Drive 文件夹：每人一份 `Sijil - <姓名> - <日期>.png`，老师点开就是证书
```

> **为什么不能只靠文件夹链接？**
> Google Drive 没有「匿名上传」接口：浏览器要写入别人的 Drive，必须持有 OAuth
> 令牌（学生就要登录 Google 并同意授权），或者由**文件夹主人自己的脚本**代写。
> 后者就是下面的 Apps Script 方案——部署一次，之后学生端不需要任何登录。
> 分享链接本身只是文件夹的标识（FOLDER_ID），不能当作上传权限。

## 1. 建立文件夹（一次性）

在 Google Drive 里新建文件夹，例如 `Water Cycle · Laporan Murid`。
打开它，浏览器地址栏 `https://drive.google.com/drive/folders/<FOLDER_ID>` 里的
那串就是 **FOLDER_ID**（把整条链接发给助手也可以，会帮你取出这一段）。

**表格不用手动建**：脚本第一次收到报告时，会在同一个文件夹里自动创建
`Laporan Kitaran Air` 表格并写好表头。

## 2. 贴上 Apps Script

在 <https://script.google.com> 新建项目（命名 `Laporan Kitaran Air`），把下面整段
贴进 `Code.gs`。`FOLDER_ID` 已填成老师提供的文件夹
（`https://drive.google.com/drive/folders/12LnTEdGmH3MCIV2OqQaVCEatsV_ywQa0`），
直接保存即可。

> **最省事的方式**：同目录下的 [`apps-script.gs`](apps-script.gs) 就是这段代码的
> 独立副本——用记事本/VS Code 打开它，`Ctrl+A` 全选再 `Ctrl+C`，粘到 `Code.gs`
> 里即可，不用在本文里找边界。
>
> 如果坚持在本文里复制：`## 2.` 标题在第 33 行；代码第一行是 **第 50 行**
> （`const FOLDER_ID = '12LnTEdGmH3MCIV2OqQaVCEatsV_ywQa0';`），最后一行是
> **第 184 行**（单独一个 `}`），共 135 行；第 49 行与第 185 行的
> ``` 只是 Markdown 标记，不要复制。

```javascript
const FOLDER_ID = '12LnTEdGmH3MCIV2OqQaVCEatsV_ywQa0';
const SHEET_TITLE = 'Laporan Kitaran Air';
const SHEET_NAME = 'Laporan';

const HEADERS = [
  'Dihantar pada',
  'Nama murid',
  'Skor',
  'Jumlah soalan',
  'Lulus',
  'Bintang',
  'Tempoh kuiz (saat)',
  'Stesen selesai',
  'Mula pengembaraan',
  'Tempoh pengembaraan (saat)',
  'Jawapan',
  'ID laporan',
  'Sijil (pautan)',
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    // A report is only ever counted once, even if the browser retries.
    if (hasReport_(sheet, payload.reportId)) {
      return json_({ ok: true, duplicate: true });
    }

    const answers = (payload.answers || [])
      .map(function (answer) {
        return (
          answer.id +
          ': ' +
          (answer.pickedLabel || '-') +
          (answer.isCorrect ? ' ✓' : ' ✗ (betul ' + answer.correctLabel + ')')
        );
      })
      .join(' | ');

    const duration = Math.round(
      (new Date(payload.finishedAt).getTime() - new Date(payload.startedAt).getTime()) / 1000,
    );

    // Stations the pupil finished before the quiz, in learning order.
    const journey = payload.journey || { stations: [] };
    const stationsDone = (journey.stations || [])
      .filter(function (station) {
        return station.completed;
      })
      .map(function (station) {
        return station.order + '. ' + station.name;
      })
      .join(' · ');

    // The pupil's certificate goes into the folder as an image, so the teacher
    // opens a certificate instead of reading raw code.
    let certificateUrl = '';
    const certificate = payload.certificate;
    if (certificate && certificate.data) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(certificate.data),
        certificate.mimeType || 'image/png',
        certificateFileName_(payload, certificate),
      );
      certificateUrl = DriveApp.getFolderById(FOLDER_ID).createFile(blob).getUrl();
    }

    sheet.appendRow([
      payload.submittedAt,
      payload.studentName,
      payload.score,
      payload.total,
      payload.passed ? 'YA' : 'TIDAK',
      payload.stars,
      duration,
      stationsDone,
      journey.startedAt || '',
      journey.journeySeconds === null || journey.journeySeconds === undefined
        ? ''
        : journey.journeySeconds,
      answers,
      payload.reportId,
      certificateUrl,
    ]);

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

/** Finds (or creates) the report spreadsheet inside the folder. */
function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const cachedId = props.getProperty('SHEET_ID');
  if (cachedId) {
    try {
      return ensureHeader_(SpreadsheetApp.openById(cachedId));
    } catch (error) {
      props.deleteProperty('SHEET_ID');
    }
  }

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByName(SHEET_TITLE);
  let spreadsheet;
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.openById(files.next().getId());
  } else {
    spreadsheet = SpreadsheetApp.create(SHEET_TITLE);
    folder.addFile(DriveApp.getFileById(spreadsheet.getId()));
    DriveApp.getRootFolder().removeFile(DriveApp.getFileById(spreadsheet.getId()));
  }
  props.setProperty('SHEET_ID', spreadsheet.getId());
  return ensureHeader_(spreadsheet);
}

function ensureHeader_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return sheet;
  }
  // Older sheets only had the first columns; keep the header in sync so a new
  // column (like the certificate link) appears without the teacher editing it.
  const row = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (row.join('|') !== HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

/** Drive-safe file name for the certificate image. */
function certificateFileName_(payload, certificate) {
  const fallback =
    'Sijil - ' +
    safeName_(payload.studentName) +
    ' - ' +
    new Date(payload.submittedAt).toISOString().slice(0, 10) +
    '.png';
  const wanted = certificate.fileName || fallback;
  return /\.png$/i.test(wanted) ? wanted : wanted + '.png';
}

function safeName_(value) {
  return String(value || 'Saintis Air')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function hasReport_(sheet, reportId) {
  if (!reportId || sheet.getLastRow() < 2) {
    return false;
  }
  // reportId is the last column (12); scan only that column.
  const ids = sheet.getRange(2, 12, sheet.getLastRow() - 1, 1).getValues();
  return ids.some(function (row) {
    return row[0] === reportId;
  });
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

> 只提供 `doPost`，没有 `doGet`：拿到网址的人只能**写**，读权限仍然只属于老师的
> Google 账号（表格和证书图片都在老师的 Drive 里）。

## 3. 部署成网站应用

1. 右上 **部署 → 新建部署**，类型选 **网页应用**。
2. **执行身份**：我（老师的账号）；**谁可以访问**：任何人。
3. 部署后复制 **网页应用网址**（形如
   `https://script.google.com/macros/s/AKfycb.../exec`）。
4. 以后改了脚本记得 **管理部署 → 编辑 → 新版本**，否则线上仍是旧代码。

## 4. 把网址交给站点

在项目根目录新建 `.env`（已被 `.gitignore` 忽略），写一行：

```
VITE_REPORT_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
```

然后 `npm run build`（或重新 `npm run dev`）。没配置这一行时，
站点照常运行，只是不发送报告（控制台不会报错）。

> 想临时换地址也可以直接改 `src/data/reporting.ts` 里的 `REPORT_ENDPOINT` 默认值，
> 但把网址放在 `.env` 更适合换学校 / 换学期。

## 5. 老师怎么看成绩

- **Google 表格「Laporan」**：一行一次答题，列依次是
  提交时间、姓名、得分、题数、是否通过、星数、答题用时（秒）、**完成了哪些站**、
  **开始冒险的时间**、**整段冒险用时（秒）**、每题选项对错、报告 ID。
  可以直接排序 / 做数据透视表 / 用 `Skor` 列画分数分布；`Stesen selesai`
  列能一眼看出谁跳过了前面的站。
- **Drive 文件夹**：每名学生一张证书图片（含姓名与分数），表格里的 `Sijil (pautan)` 列直接点开；
  需要复盘某个学生时打开它即可。

## 6. 数据字段（提交内容）

| 字段 | 说明 |
| --- | --- |
| `version` | 报告格式版本（当前 `1`） |
| `reportId` | 一次答题的唯一 ID，用于去重 |
| `submittedAt` | 提交时间（ISO 8601，UTC） |
| `stationId` | 固定 `challenge-lab` |
| `studentName` | 学生填写并规范化的名字（最多 40 字符） |
| `score` / `total` / `passMark` / `passed` / `stars` | 得分、题数、及格线（7/8）、是否通过、星数 |
| `startedAt` / `finishedAt` | 这次答题的开始与结束时间 |
| `picks` | 每题选了第几个选项（`null` 表示没答） |
| `answers` | 逐题的 `{id, prompt, picked, pickedLabel, correct, correctLabel, isCorrect}` |
| `journey` | 整段冒险：`{stations, completedCount, startedAt, finishedAt, journeySeconds}`；`stations` 是六站的 `{stationId, order, name, englishName, completed, completedAt}` |

## 7. 离线与失败处理

- 发送失败（断网、脚本临时不可用）不会打断学生：报告被放进
  `localStorage` 的 `wce:report-queue`（最多 40 份，按 `reportId` 去重）。
- 下次打开站点时 `App` 会自动重试（`flushReportQueue()`），成功后从队列移除。
- 证书页会显示一行提示：已送达 / 暂存在本机。

## 8. 隐私与作业合规

- 只上传学生自己填写的名字和答题结果，不采集邮箱、IP 或设备指纹。
- 数据存放在老师自己的 Google 账号下；本地队列可用浏览器设置清除。
- 需要向学生/家长说明的文案可在 `src/data/finale.ts` 的 `FINALE_TEXT` 里调整
  （`reportSent` / `reportQueued`）。

## 9. 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 表格里没有新行 | 先看 Apps Script 编辑器里的 **执行记录**；再确认部署是「谁可以访问：任何人」，且改脚本后要 **重新部署**（新版本） |
| 控制台 `CORS` 报错 | 请求必须是 `Content-Type: text/plain`（本站已如此），不要改成 `application/json` |
| 表格出现在「我的云端硬盘」而不是文件夹 | 首次运行时移动失败（权限/配额）；把表格手动拖进文件夹即可，脚本之后会按 Script Properties 里的 ID 继续用 |
| 报告重复出现 | 去重靠 `reportId`，若老师手动清空了 ID 列会导致重复写入 |
| 学生名字为空 | 前端已拦截空名；若从旧版本队列里取到空名，表格会显示空白，可在站点上重填 |

## 10. 本地验证

```bash
npm test -- src/data/reporting.test.ts    # 报告构造、发送、离线队列、去重、补发
npm test -- src/pages/FinalePage.test.tsx # 确认名字后只发送一次、离线时提示
```

也可以把 `.env` 的地址临时指向
[RequestBin](https://pipedream.com/requestbin) 之类的抓包服务，看实际 POST 出去的 JSON。
