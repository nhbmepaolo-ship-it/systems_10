// Fit the visible one-page report onto exactly ONE A4 portrait sheet when printing.
// Works for every system view (All, 2, 5, 8, 9, posters) and for both the
// "Print" buttons (window.print) and Ctrl+P, via the beforeprint/afterprint events.

const LAYOUT_WIDTH_PX = 1024; // desktop layout width used for the printout
// A4 = 210 x 297 mm; @page margin = 6 mm  ->  198 x 285 mm printable at 96 dpi
const PRINTABLE_W_PX = (198 / 25.4) * 96;
const PRINTABLE_H_PX = (285 / 25.4) * 96;
const SAFETY = 0.97; // small buffer so rounding never spills onto a 2nd page

const hidden: HTMLElement[] = [];
const ancestors: HTMLElement[] = [];
let target: HTMLElement | null = null;

function findVisibleReport(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>('.print-page-container'));
  return all.find((el) => el.offsetParent !== null || el.getClientRects().length > 0) ?? null;
}

function preparePrint() {
  restoreAfterPrint();
  target = findVisibleReport();
  if (!target) return;

  document.documentElement.classList.add('pf-printing');

  // Hide everything that is not the report or one of its ancestors
  let node: HTMLElement | null = target;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    for (const sib of Array.from(parent.children) as HTMLElement[]) {
      if (sib !== node && sib.style.display !== 'none') {
        sib.dataset.pfDisplay = sib.style.display;
        sib.style.setProperty('display', 'none', 'important');
        hidden.push(sib);
      }
    }
    if (parent !== document.body) {
      parent.classList.add('pf-ancestor');
      ancestors.push(parent);
    }
    node = parent;
  }

  // Lay the report out at a fixed desktop width, measure it, then scale it to fit A4.
  // transform does not change layout, so a negative bottom margin removes the
  // leftover space and nothing spills onto a second sheet.
  target.classList.add('pf-target');
  target.style.setProperty('width', `${LAYOUT_WIDTH_PX}px`, 'important');
  target.style.setProperty('max-width', `${LAYOUT_WIDTH_PX}px`, 'important');
  const height = target.offsetHeight || target.scrollHeight;
  const scale = Math.min(PRINTABLE_W_PX / LAYOUT_WIDTH_PX, PRINTABLE_H_PX / height) * SAFETY;
  const offsetX = Math.max(0, (PRINTABLE_W_PX - LAYOUT_WIDTH_PX * scale) / 2);
  target.style.setProperty('transform', `scale(${scale.toFixed(4)})`, 'important');
  target.style.setProperty('transform-origin', 'top left', 'important');
  target.style.setProperty('margin', `0 0 ${-(height * (1 - scale)).toFixed(1)}px ${offsetX.toFixed(1)}px`, 'important');

  // Pin the document height to the scaled report so the browser never starts a 2nd sheet
  const pageH = `${Math.floor(Math.min(PRINTABLE_H_PX - 4, height * scale + 2))}px`;
  for (const el of [document.documentElement, document.body]) {
    el.style.setProperty('height', pageH, 'important');
    el.style.setProperty('max-height', pageH, 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
  }
}

function restoreAfterPrint() {
  document.documentElement.classList.remove('pf-printing');
  for (const el of [document.documentElement, document.body]) {
    for (const prop of ['height', 'max-height', 'overflow']) el.style.removeProperty(prop);
  }
  for (const el of hidden) {
    el.style.removeProperty('display');
    if (el.dataset.pfDisplay) el.style.display = el.dataset.pfDisplay;
    delete el.dataset.pfDisplay;
  }
  hidden.length = 0;
  for (const el of ancestors) el.classList.remove('pf-ancestor');
  ancestors.length = 0;
  if (target) {
    target.classList.remove('pf-target');
    for (const prop of ['width', 'max-width', 'transform', 'transform-origin', 'margin']) {
      target.style.removeProperty(prop);
    }
    target = null;
  }
}

window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', restoreAfterPrint);
