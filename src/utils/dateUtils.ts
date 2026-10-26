export const THAI_MONTH_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const MONTH_TO_NUM: Record<string, string> = {
  มกราคม: '01',
  กุมภาพันธ์: '02',
  มีนาคม: '03',
  เมษายน: '04',
  พฤษภาคม: '05',
  มิถุนายน: '06',
  กรกฎาคม: '07',
  สิงหาคม: '08',
  กันยายน: '09',
  ตุลาคม: '10',
  พฤศจิกายน: '11',
  ธันวาคม: '12',
};

export const NUM_TO_MONTH: Record<string, string> = {
  '01': 'มกราคม',
  '02': 'กุมภาพันธ์',
  '03': 'มีนาคม',
  '04': 'เมษายน',
  '05': 'พฤษภาคม',
  '06': 'มิถุนายน',
  '07': 'กรกฎาคม',
  '08': 'สิงหาคม',
  '09': 'กันยายน',
  '10': 'ตุลาคม',
  '11': 'พฤศจิกายน',
  '12': 'ธันวาคม',
};

// Normalize Thai month names to canonical form (handles typos like duplicate sara U "มิถุุนายน" or trailing spaces)
export function normalizeThaiMonth(raw: string | undefined): string {
  if (!raw) return '';
  let cleaned = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  // Fix double sara U (U+0E38 repeated) found in spreadsheet
  cleaned = cleaned.replace(/\u0E38+/g, '\u0E38');
  cleaned = cleaned.replace(/\u0E39+/g, '\u0E39');

  if (cleaned.includes('มกรา')) return 'มกราคม';
  if (cleaned.includes('กุมภา')) return 'กุมภาพันธ์';
  if (cleaned.includes('มีนา')) return 'มีนาคม';
  if (cleaned.includes('เมษา')) return 'เมษายน';
  if (cleaned.includes('พฤษภา')) return 'พฤษภาคม';
  if (cleaned.includes('มิถุ')) return 'มิถุนายน';
  if (cleaned.includes('กรกฎา')) return 'กรกฎาคม';
  if (cleaned.includes('สิงหา')) return 'สิงหาคม';
  if (cleaned.includes('กันยา')) return 'กันยายน';
  if (cleaned.includes('ตุลา')) return 'ตุลาคม';
  if (cleaned.includes('พฤศจิกา')) return 'พฤศจิกายน';
  if (cleaned.includes('ธันวา')) return 'ธันวาคม';

  return cleaned;
}

// Deduplicate and sort Thai months chronologically (มกราคม -> ธันวาคม)
export function sortThaiMonths(months: string[]): string[] {
  const normSet = new Set<string>();
  months.forEach((m) => {
    const norm = normalizeThaiMonth(m);
    if (norm) normSet.add(norm);
  });

  return Array.from(normSet).sort((a, b) => {
    const idxA = THAI_MONTH_NAMES.indexOf(a);
    const idxB = THAI_MONTH_NAMES.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, 'th');
  });
}

// Normalize DD/MM/YYYY (handles " 02/03/2026" or "29/6/2026")
export function normalizeDate(d: string | undefined): string {
  if (!d) return '';
  const cleaned = d.trim();
  const parts = cleaned.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${day}/${month}/${year}`;
  }
  return cleaned;
}

// Extract Thai month from normalized date "DD/MM/YYYY"
export function getMonthFromDate(d: string): string | null {
  const norm = normalizeDate(d);
  const parts = norm.split('/');
  if (parts.length === 3) {
    const monthNum = parts[1];
    return NUM_TO_MONTH[monthNum] || null;
  }
  return null;
}

// Format date into readable Thai e.g. "2 มีนาคม 2026"
export function formatThaiDateReadable(d: string): string {
  const norm = normalizeDate(d);
  const parts = norm.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthName = NUM_TO_MONTH[parts[1]] || parts[1];
    const year = parts[2];
    return `${day} ${monthName} ${year}`;
  }
  return d;
}

// Sort dates chronologically DD/MM/YYYY
export function sortDatesChronologically(dates: string[]): string[] {
  return [...dates].sort((a, b) => {
    const [d1, m1, y1] = a.split('/').map(Number);
    const [d2, m2, y2] = b.split('/').map(Number);
    const time1 = new Date(y1, (m1 || 1) - 1, d1 || 1).getTime();
    const time2 = new Date(y2, (m2 || 1) - 1, d2 || 1).getTime();
    return time1 - time2;
  });
}
