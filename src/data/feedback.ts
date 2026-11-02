import { BASE_URL } from '../config/baseUrl';

/**
 * Google Form for the end-of-use feedback (maklum balas).
 *
 * HOW TO PLUG IN THE REAL FORM
 * 1. Create the form (the questions are listed in docs/FEEDBACK_FORM.md).
 * 2. In the form press `Send` → the link icon → copy the short `https://forms.gle/...` link
 *    (or the long `https://docs.google.com/forms/d/e/.../viewform` link).
 * 3. Paste it into `FEEDBACK_FORM_URL` below.
 * 4. Put a PNG screenshot of the form's QR code at
 *    `public/assets/images/feedback/qr-code.png`.
 *
 * Until step 3 is done the dialog shows a "not ready yet" note instead of a button
 * that leads nowhere, so the site never pretends to work.
 */
export const FEEDBACK_FORM_URL = 'https://forms.gle/GANTI-DENGAN-PAUTAN-ANDA';

/** QR code image of the same form, saved by the project owner. */
export const FEEDBACK_QR_IMAGE = `${BASE_URL}assets/images/feedback/qr-code.png`;

/** Text that marks the URL above as "still a placeholder". */
const PLACEHOLDER_MARKER = 'GANTI-DENGAN-PAUTAN-ANDA';

/** True only for a real Google Form link, never for the placeholder above. */
export function isFeedbackFormReady(url: string = FEEDBACK_FORM_URL): boolean {
  const clean = url.trim();
  if (!clean || clean.includes(PLACEHOLDER_MARKER)) {
    return false;
  }
  return /^https:\/\/(forms\.gle\/|docs\.google\.com\/forms\/)/.test(clean);
}

export const FEEDBACK_TEXT = {
  title: 'MAKLUM BALAS',
  intro:
    'Bantu kami menambah baik laman Kitaran Air ini. Pendapat anda tentang isi kandungan, aktiviti dan reka bentuk laman sangat berharga.',
  qrLabel: 'Imbas kod QR ini dengan telefon untuk membuka borang.',
  qrAlt: 'Kod QR borang maklum balas Kitaran Air',
  openButton: 'Buka borang maklum balas',
  note: 'Borang dibuka dalam tab baharu (Google Form). Laman ini tidak menghantar nama atau data murid; hanya jawapan yang anda taip sendiri di dalam borang.',
  steps: [
    'Imbas kod QR di atas, atau tekan butang di bawah.',
    'Beri penilaian 1 hingga 5 bintang untuk setiap aspek.',
    'Tulis cadangan atau pandangan anda pada soalan terakhir.',
  ],
  pendingForm: 'Pautan borang belum disediakan',
  pendingQr: 'Kod QR belum disediakan',
} as const;
