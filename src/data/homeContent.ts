/**
 * Content shown by the three menu dialogs on the home page.
 *
 * Student profile and RPH objectives are supplied by the project owner. The
 * offline e-book lives in `public/assets/ebook/offline-ebook.pdf`.
 */

import { BASE_URL } from '../config/baseUrl';

export interface ProfileField {
  label: string;
  /** `null` = not supplied yet, rendered as an em dash with a pending note. */
  value: string | null;
}

export interface StudentProfileContent {
  title: string;
  /** Portrait of the student. `null` = photo not supplied yet -> placeholder slot. */
  photoUrl: string | null;
  /** Alt text describing the portrait once a photo is supplied. */
  photoAlt: string;
  fields: ProfileField[];
  pendingNote: string;
}

export const STUDENT_PROFILE: StudentProfileContent = {
  title: 'MAKLUMAT PELAJAR',
  // Web-sized copy of design-assets/other/LIU JUN YANG.png (original untouched).
  photoUrl: `${BASE_URL}assets/images/student-photo.jpg`,
  photoAlt: 'Foto pelajar LIU JUN YANG',
  fields: [
    { label: 'NAMA', value: 'LIU JUN YANG' },
    { label: 'NO. K/P', value: '071203020385' },
    { label: 'ANGKA GILIRAN', value: '2026062440227' },
    { label: 'OPSYEN', value: 'PISMP SN SJKC AMB 26/30' },
    { label: 'PENSYARAH', value: 'TS. SHUFIANAH PUTERI YUSOF' },
  ],
  pendingNote: 'Maklumat ini akan dikemas kini.',
};

export interface OfflineEbookContent {
  title: string;
  description: string;
  /** File name offered to the browser's save dialog. */
  fileName: string | null;
  /** Path inside public/; 
ull keeps the download disabled. */
  fileUrl: string | null;
  /** Short note under the buttons, e.g. file type and size. */
  meta?: string;
  pendingNote: string;
}

export const OFFLINE_EBOOK: OfflineEbookContent = {
  title: 'OFFLINE E-BOOK',
  description:
    'E-book Kitaran Air Semula Jadi untuk dibaca tanpa sambungan Internet — boleh dibuka terus dalam pelayar atau dimuat turun ke peranti.',
  fileName: 'E-book-Kitaran-Air.pdf',
  fileUrl: `${BASE_URL}assets/ebook/offline-ebook.pdf`,
  meta: 'PDF · lebih kurang 12 MB',
  pendingNote: 'Fail e-book belum disediakan.',
};

export interface ObjectivesContent {
  title: string;
  /** Lead-in line shown above the numbered objective list. */
  intro: string;
  /** Objective statements from the RPH; empty until supplied. */
  items: string[];
  pendingNote: string;
}

export const OBJECTIVES: ObjectivesContent = {
  title: 'OBJEKTIF PEMBELAJARAN',
  intro: 'Pada akhir pembelajaran, murid dapat:',
  items: [
    'Mengenal pasti sekurang-kurangnya empat proses utama dalam kitaran air dengan betul.',
    'Menyusun sekurang-kurangnya lima peringkat kitaran air dengan ketepatan sekurang-kurangnya 80%.',
    'Menghubung kait proses penyejatan dan kondensasi dengan pembentukan awan dan hujan melalui perbincangan kumpulan.',
    'Menghasilkan rajah digital kitaran air yang lengkap serta menerangkannya secara lisan.',
  ],
  pendingNote: 'Objektif pembelajaran RPH akan dimasukkan.',
};
