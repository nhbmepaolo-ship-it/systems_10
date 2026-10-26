import { toBlob } from 'html-to-image';

// Export the One-Page report that is currently on screen as a PNG image.
// Works for every system view because each one renders a `.print-page-container`.

const EXPORT_WIDTH_PX = 1024; // same desktop layout as the A4 printout
const PIXEL_RATIO = 2; // sharp enough for LINE / slides / A4 printing

function findVisibleReport(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>('.print-page-container'));
  return all.find((el) => el.offsetParent !== null || el.getClientRects().length > 0) ?? null;
}

function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function skipNode(node: HTMLElement): boolean {
  // Leave out on-screen-only controls (buttons, filters) just like the printout does
  return !(node.classList && node.classList.contains('no-print'));
}

export async function exportVisibleReportAsPng(fileLabel: string): Promise<void> {
  const el = findVisibleReport();
  if (!el) throw new Error('ไม่พบรายงาน One-Page บนหน้าจอ');

  const prev = { width: el.style.width, maxWidth: el.style.maxWidth, transition: el.style.transition };
  el.style.width = `${EXPORT_WIDTH_PX}px`;
  el.style.maxWidth = `${EXPORT_WIDTH_PX}px`;
  el.style.transition = 'none';
  // Same trimming as the A4 printout (e.g. System 2 shows the first 4 daily records)
  document.documentElement.classList.add('pf-printing');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const options = {
    pixelRatio: PIXEL_RATIO,
    cacheBust: true,
    backgroundColor: '#ffffff',
    width: el.offsetWidth,
    height: el.offsetHeight,
    filter: skipNode,
  };

  try {
    let blob: Blob | null;
    try {
      blob = await toBlob(el, options);
    } catch {
      // Web fonts can fail to embed on some networks — retry without them
      blob = await toBlob(el, { ...options, skipFonts: true });
    }
    if (!blob) throw new Error('สร้างรูปไม่สำเร็จ');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BME-OnePage_${fileLabel}_${todayStamp()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } finally {
    document.documentElement.classList.remove('pf-printing');
    el.style.width = prev.width;
    el.style.maxWidth = prev.maxWidth;
    el.style.transition = prev.transition;
  }
}
