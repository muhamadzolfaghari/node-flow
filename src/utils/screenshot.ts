export function captureScreenshot(): string { return document.querySelector('canvas')?.toDataURL() || ''; }
