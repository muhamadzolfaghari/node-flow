/**
 * Real screenshot capture utilities for the diagram studio.
 *
 * captureScreenshot / captureThumbnail keep returning an SVG data URI (lossless,
 * works everywhere). capturePng renders the live SVG to a bitmap at `scale`x and
 * returns a Promise<data:image/png data URL> suitable for download. downloadPng
 * triggers a browser download of a PNG data URL.
 */

const svgDataUrl = (svgEl: SVGElement): string => {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgEl);
  // Inline root width/height/viewBox so the bitmap render is not size-less.
  if (!/width\s*=/i.test(svgString)) {
    svgString = svgString.replace(/<svg/i, '<svg width="1200" height="800"');
  }
  if (!/viewBox\s*=/i.test(svgString)) {
    svgString = svgString.replace(/<svg([^>]*)>/i, '<svg$1 viewBox="0 0 1200 800">');
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
};

export function captureScreenshot(container?: HTMLElement | null): string {
  try {
    if (!container) {
      container = document.querySelector('.mermaid-stage, .studio-stage-wrap');
    }
    if (!container) return '';
    const svgEl = container.querySelector('svg');
    if (!svgEl) return '';
    return svgDataUrl(svgEl);
  } catch (e) {
    console.warn('Screenshot capture failed:', e);
    return '';
  }
}

export function captureThumbnail(container?: HTMLElement | null): string {
  return captureScreenshot(container);
}

/**
 * Render the diagram SVG to an OffscreenCanvas at `scale`x and return a PNG data URL.
 * Falls back to the SVG data URI when OffscreenCanvas/ImageBitmap is unavailable.
 */
export async function capturePng(
  container?: HTMLElement | null,
  scale = 2,
): Promise<string> {
  try {
    if (!container) {
      container = document.querySelector('.mermaid-stage, .studio-stage-wrap');
    }
    if (!container) return '';
    const svgEl = container.querySelector('svg');
    if (!svgEl) return '';

    const url = svgDataUrl(svgEl);
    const img = new Image();
    img.src = url;
    await img.decode();

    const OffscreenCanvas =
      (typeof globalThis.OffscreenCanvas !== 'undefined'
        ? globalThis.OffscreenCanvas
        : null) || (typeof globalThis.window?.OffscreenCanvas !== 'undefined'
        ? globalThis.window.OffscreenCanvas
        : null);
    let canvas: OffscreenCanvas | HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;

    if (OffscreenCanvas) {
      canvas = new OffscreenCanvas(
        Math.max(1, img.width * scale),
        Math.max(1, img.height * scale),
      );
      ctx = canvas.getContext('2d');
    } else if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas');
      canvas.width = Math.max(1, img.width * scale);
      canvas.height = Math.max(1, img.height * scale);
      ctx = canvas.getContext('2d');
    } else {
      return url;
    }

    if (!ctx) return url;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = (canvas as HTMLCanvasElement | OffscreenCanvas).toDataURL(
      'image/png',
    );
    return png;
  } catch (e) {
    console.warn('PNG screenshot capture failed:', e);
    return captureScreenshot(container);
  }
}

/**
 * Trigger a browser download of a PNG data URL. Returns the data URL.
 */
export function downloadPng(
  dataUrl: string,
  filename = 'diagram-screenshot.png',
): string {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn('PNG download failed:', e);
  }
  return dataUrl;
}
