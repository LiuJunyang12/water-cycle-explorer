# Borang Maklum Balas — Water Cycle Explorer

Dokumen ini menyediakan dua perkara:

1. Kandungan borang Google Form (siap salin) — tajuk, penerangan, soalan dan tetapan.
2. Pemasangan ke dalam laman (pautan + kod QR).

---

## 1. Kandungan Google Form

### Tajuk

```
Maklum Balas: Water Cycle Explorer (Sains Tahun 5)
```

### Penerangan borang

```
Terima kasih kerana mencuba laman Kitaran Air ini. Maklum balas anda mengambil masa lebih kurang 3 minit dan digunakan untuk menambah baik isi kandungan, aktiviti dan reka bentuk laman. Semua jawapan adalah sulit dan tidak dikaitkan dengan markah murid.
```

### Bahagian A — Maklumat responden (ringkas)

| # | Soalan | Jenis | Wajib | Pilihan |
| --- | --- | --- | --- | --- |
| A1 | Saya menggunakan laman ini sebagai | Pilihan berbilang | Ya | Murid / Guru / Ibu bapa atau penjaga / Lain-lain |
| A2 | Nama atau gelaran (boleh kosong) | Jawapan ringkas | Tidak | — |

### Bahagian B — Penilaian (skala bintang 1–5)

> Tetapan setiap soalan: **Bintang** (Bintang 1 = Sangat tidak setuju … Bintang 5 = Sangat setuju), **Wajib**, **Tiada** susunan rawak.

| # | Soalan | Aspek yang dinilai |
| --- | --- | --- |
| B1 | Laman ini mudah digunakan dan saya tahu apa yang perlu dibuat seterusnya. | Kebolehgunaan |
| B2 | Visual, warna dan animasi membantu saya memahami kitaran air. | Reka bentuk multimedia |
| B3 | Aktiviti dalam laman ini (seret matahari, gabung titisan, permainan platform, susun kad) menyeronokkan dan tidak membosankan. | Interaktiviti |
| B4 | Penerangan dalam Bahasa Melayu jelas, dan istilah Inggeris dalam kurungan membantu pemahaman. | Bahasa & istilah |
| B5 | Maklum balas selepas saya menjawab (betul/salah dan sebabnya) membantu saya belajar. | Maklum balas/pentaksiran |
| B6 | Video pengenalan di Stesen 1 jelas dan mudah difahami. | Video |
| B7 | Kuiz 8 soalan di Stesen 6 menguji perkara yang saya pelajari di Stesen 1–5. | Jajaran kandungan |
| B8 | Sijil di akhir pengembaraan memberi dorongan untuk menyelesaikan semua stesen. | Motivasi |
| B9 | Laman ini berjalan lancar pada peranti saya (telefon / tablet / komputer) tanpa masalah. | Kualiti teknikal |
| B10 | Selepas menggunakan laman ini, saya lebih yakin menerangkan kitaran air dengan perkataan sendiri. | Kesan pembelajaran |

### Bahagian C — Cadangan (jawapan panjang)

| # | Soalan | Jenis | Wajib |
| --- | --- | --- | --- |
| C1 | Apakah satu perkara yang boleh kami tambah atau perbaiki pada laman ini? (Contoh: aktiviti baharu, cara penerangan, warna, video, kuiz) | Perenggan | Ya |

### Tetapan borang yang disyorkan

- **Kumpul alamat e-mel**: Jangan kumpul (kekalkan tanpa nama).
- **Hadkan kepada 1 respons**: Tidak (murid boleh memberi maklum balas sebelum/selepas sesi).
- **Kocok susunan soalan**: Tidak (susunan kekal agar mudah dibandingkan).
- **Bahagian**: gunakan tiga bahagian di atas supaya skrin tidak padat.
- **Pengesahan**: mesej akhir `Terima kasih! Maklum balas anda telah direkodkan.`

---

## 2. Pemasangan ke dalam laman

### Langkah A — dapatkan pautan borang

Dalam Google Form: **Hantar (Send)** → ikon pautan → salin pautan pendek `https://forms.gle/...`.

### Langkah B — masukkan pautan ke dalam kod

Buka `src/data/feedback.ts` dan gantikan nilai ini:

```ts
export const FEEDBACK_FORM_URL = 'https://forms.gle/r3EUwJfyLJai7b7u9';
```

> **Status (2026-11-02): sudah dipasang.** Pautan sebenar di atas sudah dimasukkan dan kod QR
> disimpan di `public/assets/images/feedback/qr-code.png` (640 × 640, dengan zon senyap putih 8%).
> Untuk menukar borang pada masa hadapan, hanya dua tempat ini perlu dikemas kini.

Selepas pautan sebenar dimasukkan, butang **Buka borang maklum balas** akan muncul dan membuka borang dalam tab baharu. Selagi pautan masih contoh, dialog memaparkan butang `Pautan borang belum disediakan` (tidak aktif) supaya tiada butang yang membawa ke halaman kosong.

### Langkah C — masukkan kod QR

1. Dalam Google Form: **Hantar (Send)** → ikon **QR code** (ikon pautan rantai → tab QR).
2. Simpan tangkapan skrin kod QR itu.
3. Simpan sebagai: `public/assets/images/feedback/qr-code.png`
4. Saiz disyorkan: 600 × 600 piksel (PNG). Dialog memaparkannya pada lebar sehingga 216 piksel, jadi kod QR mesti tajam dan berbingkai putih.

Jika fail QR belum ada, dialog memaparkan kotak bergaris putus-putus bertulis `Kod QR belum disediakan` — bukan ikon gambar rosak.

### Di mana ia muncul

Butang menu (kiri atas) → **MAKLUM BALAS** → dialog: kod QR + butang borang + tiga langkah ringkas + nota privasi.
