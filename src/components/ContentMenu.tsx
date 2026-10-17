import { useState } from 'react';
import { Image, Copy, Check } from 'lucide-react';
import {
  captureScreenshot,
  captureThumbnail,
  capturePng,
  downloadPng,
} from '../utils/screenshot.ts';

export default function ContentMenu({ containerRef, title = 'diagram' }) {
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handleCaptureScreenshot = async () => {
    try {
      setCapturing(true);
      const container =
        containerRef?.current ||
        document.querySelector('.mermaid-stage, .studio-stage-wrap');
      const dataUrl = await capturePng(container);
      if (!dataUrl) {
        alert('No diagram found to capture.');
        return;
      }
      downloadPng(
        dataUrl,
        `${title.replace(/[^a-z0-9_-]/gi, '-')}-screenshot.png`,
      );
    } catch (e) {
      console.error('Screenshot download failed:', e);
      alert('Screenshot capture failed.');
    } finally {
      setCapturing(false);
    }
  };

  const handleCopyThumbnail = async () => {
    try {
      const container =
        containerRef?.current ||
        document.querySelector('.mermaid-stage, .studio-stage-wrap');
      const dataUrl = captureThumbnail(container);
      if (!dataUrl) {
        alert('No diagram thumbnail available.');
        return;
      }
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Copy thumbnail failed:', e);
    }
  };

  return (
    <div className="content-menu inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card/90 px-2 py-1 shadow-md backdrop-blur-md text-xs">
      <span className="font-semibold text-muted-foreground uppercase tracking-wider px-1">Capture</span>
      <span className="h-3 w-px bg-border/60" />
      <button
        onClick={handleCaptureScreenshot}
        disabled={capturing}
        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 hover:bg-accent hover:text-accent-foreground transition text-[11px] font-medium disabled:opacity-50"
        title="Capture screenshot (PNG)"
      >
        <Image className="size-3.5 text-cyan-400" />
        {capturing ? 'Capturing…' : 'Screenshot'}
      </button>
      <button
        onClick={handleCopyThumbnail}
        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 hover:bg-accent hover:text-accent-foreground transition text-[11px] font-medium"
        title="Copy thumbnail URL"
      >
        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-amber-400" />}
        {copied ? 'Copied!' : 'Thumbnail'}
      </button>
    </div>
  );
}
