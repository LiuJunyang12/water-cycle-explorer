import { describe, expect, test } from 'vitest';
import { buildCertificatePdf, certificateFileName, inlineCertificateImages } from './certificateDownload';

/** 1×1 transparent PNG, enough for jsPDF to accept the image. */
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('certificateFileName', () => {
  test('slugifies the student name for the download', () => {
    expect(certificateFileName('Liu Jun Yang')).toBe('sijil-kitaran-air-liu-jun-yang.pdf');
  });

  test('strips diacritics and punctuation', () => {
    expect(certificateFileName('Nur Aisyah binti ʿAlī')).toBe('sijil-kitaran-air-nur-aisyah-binti-ali.pdf');
  });

  test('falls back when the name has no usable characters', () => {
    expect(certificateFileName('   ')).toBe('sijil-kitaran-air-saintis-air.pdf');
    expect(certificateFileName('★★★')).toBe('sijil-kitaran-air-saintis-air.pdf');
  });
});

describe('buildCertificatePdf', () => {
  test('wraps the rasterised certificate in a real PDF document', async () => {
    const blob = await buildCertificatePdf(TINY_PNG);

    expect(blob.type).toBe('application/pdf');
    const text = await blob.text();
    expect(text.startsWith('%PDF-')).toBe(true);
    expect(text).toContain('%%EOF');
  });
});

describe('inlineCertificateImages', () => {
  test('keeps inline data images and freezes the export size', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1120 792');
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', 'data:image/png;base64,AAA');
    svg.appendChild(image);

    const clone = await inlineCertificateImages(svg);

    expect(clone.getAttribute('width')).toBe('1120');
    expect(clone.getAttribute('height')).toBe('792');
    expect(clone.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(clone.querySelector('image')?.getAttribute('href')).toBe('data:image/png;base64,AAA');
  });
});
