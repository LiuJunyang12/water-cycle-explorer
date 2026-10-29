import { BASE_URL } from '../config/baseUrl';

/**
 * The last scene of the adventure: Wally walks in, congratulates the student and
 * hands over a printable certificate. All text is Malay with the English term in
 * brackets, matching the rest of the site.
 */
export const FINALE_TEXT = {
  eyebrow: 'MAJLIS ANUGERAH',
  title: 'Majlis Anugerah Saintis Air',
  subtitle: 'Kitaran Air · Sains Tahun 5',
  wallyName: 'Wally',
  lines: [
    'Tahniah! Kamu telah menamatkan kesemua enam stesen pengembaraan kitaran air.',
    'Dengan ilmu yang kamu kumpulkan, kamu kini layak bergelar Saintis Air (Water Scientist) yang cemerlang!',
    'Sebelum saya menyerahkan sijil ini, bolehkah kamu tinggalkan nama kamu?',
  ],
  accept: 'Ya, sedia untuk menerima sijil',
  nameTitle: 'Nama Saintis Air',
  nameNote: 'Nama ini akan dicetak pada sijil kamu.',
  nameLabel: 'Nama penuh',
  namePlaceholder: 'Contoh: Liu Jun Yang',
  nameConfirm: 'OK',
  nameCancel: 'Batal',
  revealNote: 'Sijil kamu sudah sedia. Muat turun dan simpan sebagai kenangan!',
  download: 'Muat turun sijil (PDF)',
  print: 'Cetak sijil',
  again: 'Lihat sijil sekali lagi',
  backToMap: 'Kembali ke peta',
  emptyName: 'Tulis nama kamu dahulu, ya.',
  savedNote: 'Nama disimpan pada peranti ini sahaja.',
  reportSent: 'Laporan prestasi kuiz kamu sudah dihantar kepada guru.',
  reportQueued: 'Tiada sambungan internet. Laporan disimpan pada peranti ini dan akan dihantar automatik kemudian.',
} as const;

/** Malay + English wording printed on the certificate itself. */
export const CERTIFICATE_TEXT = {
  heading: 'SIJIL PENCAPAIAN',
  subheading: 'Sijil Penyempurnaan Kitaran Air',
  subject: 'Sains Tahun 5 · Kitaran Air (Water Cycle)',
  intro: 'Dengan ini disahkan bahawa',
  body: 'telah menyempurnakan kesemua enam stesen pengembaraan kitaran air, menguasai proses penyejatan, kondensasi, kerpasan dan pengumpulan, serta layak dianugerahkan gelaran',
  award: 'SAINTIS AIR CEMERLANG',
  awardEnglish: 'Outstanding Water Scientist',
  badgesTitle: 'Lencana yang diperoleh',
  badges: [
    { label: 'Penjelajah', english: 'Explorer' },
    { label: 'Pembina Kitaran', english: 'Cycle Builder' },
    { label: 'Saintis', english: 'Scientist' },
  ],
  dateLabel: 'Tarikh',
  signatureTeacher: 'Guru Sains',
  signatureLecturer: 'Pensyarah',
  motto: 'Kitaran air berterusan — kita menjaganya bersama.',
  sealLabel: 'Wally · Maskot Kitaran Air',
  nameFallback: 'Saintis Air',
} as const;

export const CERTIFICATE_SIZE = { width: 1120, height: 792 } as const;

/** Optional artwork the teacher can drop in later; the certificate works without it. */
const CERTIFICATE_DIR = `${BASE_URL}assets/images/certificate/`;

export const CERTIFICATE_ART = {
  background: `${CERTIFICATE_DIR}certificate-bg.png`,
  seal: `${CERTIFICATE_DIR}seal-wally.png`,
  signatureTeacher: `${CERTIFICATE_DIR}signature-teacher.png`,
  signatureLecturer: `${CERTIFICATE_DIR}signature-lecturer.png`,
  logo: `${CERTIFICATE_DIR}school-logo.png`,
} as const;

export const SCIENTIST_NAME_STORAGE_KEY = 'wce:scientist-name';

/** Keeps the printed name tidy: one line, max 40 characters. */
export function normaliseScientistName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 40);
}

/** "29 Oktober 2026" in Malay, independent of the browser locale. */
export function formatMalayDate(date: Date): string {
  const months = [
    'Januari',
    'Februari',
    'Mac',
    'April',
    'Mei',
    'Jun',
    'Julai',
    'Ogos',
    'September',
    'Oktober',
    'November',
    'Disember',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function readStoredScientistName(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  try {
    return normaliseScientistName(window.localStorage.getItem(SCIENTIST_NAME_STORAGE_KEY) ?? '');
  } catch {
    return '';
  }
}

export function storeScientistName(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const clean = normaliseScientistName(name);
    if (clean) {
      window.localStorage.setItem(SCIENTIST_NAME_STORAGE_KEY, clean);
    }
  } catch {
    // Private mode: the certificate still works, it just will not be remembered.
  }
}
