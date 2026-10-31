import { CERTIFICATE_SIZE } from '../data/finale';

/**
 * Turns the on-screen SVG certificate into a downloadable PDF.
 * Everything runs in the browser: the SVG is cloned, every <image> is inlined as
 * a data URL (an <img> rasteriser refuses external URLs), drawn onto a canvas
 * and finally placed on an A4 landscape PDF page.
 */

const RASTER_SCALE = 2;
const RASTER_ERROR = 'Sijil tidak dapat disediakan untuk muat turun.';

/** Fetches one image and returns it as a data URL, or null when it cannot load. */
async function toDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Replaces every <image href> with an inline data URL so the SVG is self-contained. */
export async function inlineCertificateImages(source: SVGSVGElement): Promise<SVGSVGElement> {
  const clone = source.cloneNode(true) as SVGSVGElement;

  const images = Array.from(clone.querySelectorAll('image'));
  await Promise.all(
    images.map(async (image) => {
      const href = image.getAttribute('href') ?? image.getAttribute('xlink:href');
      if (!href || href.startsWith('data:')) {
        return;
      }
      const dataUrl = await toDataUrl(href);
      if (dataUrl) {
        image.setAttribute('href', dataUrl);
        image.removeAttribute('xlink:href');
      } else {
        image.remove();
      }
    }),
  );

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(CERTIFICATE_SIZE.width));
  clone.setAttribute('height', String(CERTIFICATE_SIZE.height));
  return clone;
}

/**
 * The SVG markup is base64 encoded: URL-encoding the whole document is fragile
 * because characters such as `#` (present in every colour) cut the data URL
 * short and make the browser reject the image.
 */
function svgToDataUrl(markup: string): string {
  const bytes = new TextEncoder().encode(markup);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/** Rasterises the certificate SVG into a PNG data URL at twice the design size. */
export async function certificatePngDataUrl(source: SVGSVGElement, scale = RASTER_SCALE): Promise<string> {
  const clone = await inlineCertificateImages(source);
  const markup = new XMLSerializer().serializeToString(clone);

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(RASTER_ERROR));
    image.src = svgToDataUrl(markup);
  });

  const canvas = document.createElement('canvas');
  canvas.width = CERTIFICATE_SIZE.width * scale;
  canvas.height = CERTIFICATE_SIZE.height * scale;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error(RASTER_ERROR);
  }
  context.fillStyle = '#fbfdf1';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/** Wraps a raster image into a single-page A4 landscape PDF. */
/** Same raster, but as bare base64 so it can travel inside the JSON report. */
export async function certificatePngBase64(
  source: SVGSVGElement,
  scale = RASTER_SCALE,
): Promise<string> {
  const dataUrl = await certificatePngDataUrl(source, scale);
  const comma = dataUrl.indexOf(',');
  return comma === -1 ? '' : dataUrl.slice(comma + 1);
}

export async function buildCertificatePdf(pngDataUrl: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  pdf.addImage(pngDataUrl, 'PNG', 0, 0, 297, 210, undefined, 'SLOW');
  return pdf.output('blob');
}

/** Rasterises the certificate SVG and returns it as a PDF blob. */
export async function certificatePdfBlob(source: SVGSVGElement): Promise<Blob> {
  const png = await certificatePngDataUrl(source);
  return buildCertificatePdf(png);
}

/** Lower-case, dash separated file name: sijil-kitaran-air-liu-jun-yang.pdf */
export function certificateFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `sijil-kitaran-air-${slug || 'saintis-air'}.pdf`;
}

/** Downloads the certificate as a PDF using a temporary object URL. */
export async function downloadCertificate(source: SVGSVGElement, name: string): Promise<void> {
  const blob = await certificatePdfBlob(source);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = certificateFileName(name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give Safari a tick before the blob is released.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
