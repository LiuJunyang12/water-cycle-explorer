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
    ]);

    DriveApp.getFolderById(FOLDER_ID).createFile(
      payload.studentName + ' - ' + payload.submittedAt + '.json',
      JSON.stringify(payload, null, 2),
      MimeType.PLAIN_TEXT,
    );

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
  }
  return sheet;
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
