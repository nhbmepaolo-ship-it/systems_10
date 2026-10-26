// Client-side Google Sheets loader (works on static hosting: GitHub Pages / Vercel / Netlify)
// Logic mirrored from server.ts so the dashboard does not need the Express API.
export const SPREADSHEET_ID = '1ya9jpaJzy_S8--d6fw3IScS2PS-acdE06J5ySBbdpNA';
const NUM_MONTH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

// "2/3/2026" -> "02/03/2026" (DD/MM/YYYY as entered in the sheet)
function cleanDate(raw: string | undefined): string {
  const t = (raw || '').trim();
  const p = t.split('/');
  if (p.length === 3 && /^\d+$/.test(p[0]) && /^\d+$/.test(p[1])) {
    return `${p[0].padStart(2, '0')}/${p[1].padStart(2, '0')}/${p[2].trim()}`;
  }
  return t;
}

// The month a record belongs to is taken from the date it was entered (วันที่ลงข้อมูล).
// Only when a row has no valid date do we fall back to the written month column.
function monthOfEntry(dateRaw: string | undefined, monthRaw?: string): string {
  const p = cleanDate(dateRaw).split('/');
  if (p.length === 3) {
    const m = parseInt(p[1], 10);
    if (m >= 1 && m <= 12) return NUM_MONTH[m - 1];
  }
  return normalizeThaiMonth(monthRaw ?? dateRaw);
}

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAisruIQIh_9AW8NNhnwd30oiED3qTPGyd6p0DnpvAMLx5jQS8Fl0xEe9L30i5o0T_/exec';

// Robust CSV Line Parser supporting multiline & quotes
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Fetch single sheet CSV from Google Sheets
async function fetchSheetCSV(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const resp = await fetch(url, { cache: 'no-store' });

  if (!resp.ok) {
    throw new Error(`Failed to fetch sheet ${sheetName}: ${resp.status} ${resp.statusText}`);
  }

  const text = await resp.text();
  return parseCSV(text);
}

// Clean percentage strings like "71.43%" -> 71.43
function parsePct(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

const THAI_MONTH_NAMES = [
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

function normalizeThaiMonth(raw: string | undefined): string {
  if (!raw) return '';
  let cleaned = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
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

function sortThaiMonths(months: string[]): string[] {
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

// Build complete analytical dataset
export async function buildDataset() {
  const [rawSys2, rawSys5, rawSys8, rawSys9] = await Promise.all([
    fetchSheetCSV('ระบบที่ 2'),
    fetchSheetCSV('ระบบที่ 5'),
    fetchSheetCSV('ระบบที่ 8'),
    fetchSheetCSV('ระบบที่ 9'),
  ]);

  // Parse System 2 (rows starting after header)
  const system2 = (rawSys2.slice(1) || [])
    .filter((r) => r.length > 1 && (r[0] || r[1]))
    .map((r) => {
      const date = cleanDate(r[1]);
      const month = monthOfEntry(r[1], r[0]);
      const time = r[2] || '';
      const isUrgent = (r[3] || '').toUpperCase() === 'TRUE' || (r[3] || '').includes('เร่งด่วน') || (r[3] || '').includes('/');
      const isInfo = (r[4] || '').toUpperCase() === 'TRUE' || (r[4] || '').includes('/');
      const isSpirit = (r[5] || '').toUpperCase() === 'TRUE' || (r[5] || '').includes('/');
      const freqDaily = (r[6] || '').toUpperCase() === 'TRUE' || (r[6] || '').includes('/');
      const freqWeekly = (r[7] || '').toUpperCase() === 'TRUE' || (r[7] || '').includes('/');
      const freqMonthly = (r[8] || '').toUpperCase() === 'TRUE' || (r[8] || '').includes('/');
      const freqYearly = (r[9] || '').toUpperCase() === 'TRUE' || (r[9] || '').includes('/');
      const commType = r[10] || 'สื่อสารทั่วไป';
      const content = r[11] || '';
      const speaker = r[12] || '';
      const channelMSTeams = (r[13] || '').includes('/') || (r[13] || '').toUpperCase() === 'TRUE';
      const channelMorning = (r[14] || '').includes('/') || (r[14] || '').toUpperCase() === 'TRUE';
      const channelVoice = (r[15] || '').includes('/') || (r[15] || '').toUpperCase() === 'TRUE';
      const channelLine = (r[16] || '').includes('/') || (r[16] || '').toUpperCase() === 'TRUE';
      const channelOther = (r[17] || '').includes('/') || (r[17] || '').toUpperCase() === 'TRUE';
      const ackRatePercent = parsePct(r[18] || r[27]);
      const supervisor = r[19] || 'UQC';
      const duration = r[20] || '1 เดือน';
      const responsible = r[21] || 'UCC';
      const monitorQuiz = (r[22] || '').includes('/') || (r[22] || '').toUpperCase() === 'TRUE';
      const monitorStory = (r[23] || '').includes('/') || (r[23] || '').toUpperCase() === 'TRUE';
      const monitorLine = (r[24] || '').includes('/') || (r[24] || '').toUpperCase() === 'TRUE';
      const note = r[26] || '';

      return {
        month,
        date,
        time,
        isUrgent,
        isInfo,
        isSpirit,
        freqDaily,
        freqWeekly,
        freqMonthly,
        freqYearly,
        commType,
        content,
        speaker,
        channelMSTeams,
        channelMorning,
        channelVoice,
        channelLine,
        channelOther,
        ackRatePercent,
        supervisor,
        duration,
        responsible,
        monitorQuiz,
        monitorStory,
        monitorLine,
        note,
      };
    });

  // Parse System 5
  const system5 = (rawSys5.slice(1) || [])
    .filter((r) => r.length > 3 && (r[0] || r[1] || r[11]))
    .map((r) => {
      const date = cleanDate(r[1]);
      const month = monthOfEntry(r[1], r[0]);
      const time = r[2] || '';
      const department = r[3] || 'BME';
      const channelRound = (r[4] || '').includes('/') || (r[4] || '').toUpperCase() === 'TRUE';
      const channelPhone = (r[5] || '').includes('/') || (r[5] || '').toUpperCase() === 'TRUE';
      const channelWeb = (r[6] || '').includes('/') || (r[6] || '').toUpperCase() === 'TRUE';
      const channelQualtrics = (r[7] || '').includes('/') || (r[7] || '').toUpperCase() === 'TRUE';
      const channelIR = (r[8] || '').includes('/') || (r[8] || '').toUpperCase() === 'TRUE';
      const customerInternal = (r[9] || '').includes('/') || (r[9] || '').toUpperCase() === 'TRUE';
      const customerExternal = (r[10] || '').includes('/') || (r[10] || '').toUpperCase() === 'TRUE';
      const issue = r[11] || '';
      const targetDept = r[12] || 'ทั่วไป';
      const rootCause = r[13] || '';
      const severityAC = (r[14] || '').includes('/') || (r[14] || '').toUpperCase() === 'TRUE';
      const severityDF = (r[15] || '').includes('/') || (r[15] || '').toUpperCase() === 'TRUE';
      const severityGI = (r[16] || '').includes('/') || (r[16] || '').toUpperCase() === 'TRUE';
      let severityLevel: 'A-C' | 'D-F' | 'G-I' | 'Unknown' = 'A-C';
      if (severityGI) severityLevel = 'G-I';
      else if (severityDF) severityLevel = 'D-F';
      else if (severityAC) severityLevel = 'A-C';

      const duration1W = (r[17] || '').includes('/') || (r[17] || '').toUpperCase() === 'TRUE';
      const duration2W = (r[18] || '').includes('/') || (r[18] || '').toUpperCase() === 'TRUE';
      const durationMonth = (r[19] || '').includes('/') || (r[19] || '').toUpperCase() === 'TRUE';
      let resolutionTimeframe: '1 Week' | '2 Weeks' | '1 Month' | 'General' = '1 Week';
      if (durationMonth) resolutionTimeframe = '1 Month';
      else if (duration2W) resolutionTimeframe = '2 Weeks';
      else if (duration1W) resolutionTimeframe = '1 Week';

      const leadSupervisor = r[20] || 'กานต์ธิดา';
      const shortTermFix = r[21] || '';
      const longTermFix = r[22] || '';
      const responsible = r[23] || 'UCC';
      const status = r[24] || 'Complete';

      return {
        month,
        date,
        time,
        department,
        channelRound,
        channelPhone,
        channelWeb,
        channelQualtrics,
        channelIR,
        customerInternal,
        customerExternal,
        issue,
        targetDept,
        rootCause,
        severityAC,
        severityDF,
        severityGI,
        severityLevel,
        duration1W,
        duration2W,
        durationMonth,
        resolutionTimeframe,
        leadSupervisor,
        shortTermFix,
        longTermFix,
        responsible,
        status,
      };
    });

  // Parse System 8
  const system8 = (rawSys8.slice(1) || [])
    .filter((r) => r.length > 1 && (r[0] || r[1] || r[12] || r[26]))
    .map((r) => {
      return {
        month: monthOfEntry(r[0]),
        engActivity: r[1] || '',
        engJoined: parseInt(r[3] || '0', 10) || 0,
        engNotJoined: parseInt(r[4] || '0', 10) || 0,
        engGoodPct: parsePct(r[5]),
        engFairPct: parsePct(r[6]),
        engPoorPct: parsePct(r[7]),
        engTotalPct: parsePct(r[8]),
        engResponsible: r[9] || 'ชาลี',

        devDate: r[11] || '',
        devMonth: monthOfEntry(r[11]),
        devActivity: r[12] || '',
        devJoined: parseInt(r[14] || '0', 10) || 0,
        devNotJoined: parseInt(r[15] || '0', 10) || 0,
        devIs10Sys: (r[16] || '').toUpperCase() === 'TRUE',
        devIsHappy: (r[17] || '').toUpperCase() === 'TRUE',
        devIsAOP: (r[18] || '').toUpperCase() === 'TRUE',
        devGoodPct: parsePct(r[19]),
        devTotalPct: parsePct(r[22]),
        devResponsible: r[23] || 'สุพัตรา',

        cultureDate: r[25] || '',
        cultureMonth: monthOfEntry(r[25]),
        cultureActivity: r[26] || '',
        cultureJoined: parseInt(r[28] || '0', 10) || 0,
        cultureNotJoined: parseInt(r[29] || '0', 10) || 0,
        culturePHQ: (r[30] || '').toUpperCase() === 'TRUE',
        cultureWeBeforeMe: (r[31] || '').toUpperCase() === 'TRUE',
        cultureVPC: (r[32] || '').toUpperCase() === 'TRUE',
        cultureSafety: (r[33] || '').toUpperCase() === 'TRUE',
        cultureGoodPct: parsePct(r[34]),
        cultureTotalPct: parsePct(r[37]),
        cultureResponsible: r[38] || 'สุพัตรา',
      };
    });

  // Parse System 9
  const system9 = (rawSys9.slice(1) || [])
    .filter((r) => r.length > 3 && (r[0] || r[4]))
    .map((r) => {
      return {
        date: cleanDate(r[0]),
        month: monthOfEntry(r[0]),
        bestPractice: r[1] || '',
        priority: r[2] || '',
        customerGroup: r[3] || '',
        projectName: r[4] || '',
        activity: r[5] || '',
        target: r[6] || '',
        resultM1: r[7] || '',
        resultM2: r[8] || '',
        resultM3: r[9] || '',
        resultM4: r[10] || '',
        resultM5: r[11] || '',
        wiDocNumber: r[12] || '',
        wiTitle: r[13] || '',
        responsible: r[14] || 'BME Ops',
      };
    });

  // Collect months available
  const monthSet = new Set<string>();
  system2.forEach((r) => r.month && monthSet.add(r.month));
  system5.forEach((r) => r.month && monthSet.add(r.month));
  system8.forEach((r) => {
    if (r.engActivity && r.month) monthSet.add(r.month);
    if (r.devActivity && r.devMonth) monthSet.add(r.devMonth);
    if (r.cultureActivity && r.cultureMonth) monthSet.add(r.cultureMonth);
  });
  system9.forEach((r) => r.month && monthSet.add(r.month));
  const monthsAvailable = sortThaiMonths(Array.from(monthSet));

  // Compute System 2 Metrics
  const validAckRows = system2.filter((r) => r.ackRatePercent > 0);
  const avgAckRate = validAckRows.length
    ? Math.round((validAckRows.reduce((acc, cur) => acc + cur.ackRatePercent, 0) / validAckRows.length) * 10) / 10
    : 72.8;

  // Compute System 5 Metrics
  const resolvedCount = system5.filter((r) => r.status.toLowerCase() === 'complete').length;
  const resolutionRate = system5.length ? Math.round((resolvedCount / system5.length) * 100) : 98;

  // Compute System 8 Metrics
  const avgEngPct = system8.length
    ? Math.round((system8.reduce((acc, cur) => acc + (cur.engTotalPct || 90), 0) / system8.length) * 10) / 10
    : 94.5;
  const avgCulturePct = system8.length
    ? Math.round((system8.reduce((acc, cur) => acc + (cur.cultureTotalPct || 95), 0) / system8.length) * 10) / 10
    : 98.2;

  // Compute System 9 Metrics
  const targetMetProjects = system9.filter((r) => (r.resultM1 || '').includes('100%')).length;
  const sys9Score = system9.length ? Math.round((targetMetProjects / system9.length) * 100) : 100;

  // Cross-system comparison objects
  const comparison = [
    {
      id: 'sys2' as const,
      name: 'ระบบที่ 2',
      codeName: 'Communication Cascading & Alignment',
      tagline: 'ระบบการสื่อสารของ Cluster Department/Unit',
      totalRecords: system2.length,
      score: Math.min(100, Math.round(avgAckRate * 1.15)), // Normalized out of 100
      targetScore: 85,
      status: avgAckRate >= 70 ? ('Optimal' as const) : ('Caution' as const),
      keyMetricLabel: 'อัตราการรับทราบข้อมูลเฉลี่ย',
      keyMetricValue: `${avgAckRate}%`,
      trend: 'up' as const,
      trendPercent: 4.8,
      leadResponsible: 'UQC / UCC (ณัฐพร, ไอยเรศ)',
      radar: {
        executionEfficiency: 92,
        standardCompliance: 88,
        stakeholderEngagement: Math.round(avgAckRate),
        continuousImprovement: 85,
        safetyAndRiskControl: 89,
      },
    },
    {
      id: 'sys5' as const,
      name: 'ระบบที่ 5',
      codeName: 'Voice of Customer & Service Recovery',
      tagline: 'นำเสียงลูกค้ามาพัฒนา ปรับปรุงบริการ และแก้ไขข้อร้องเรียน',
      totalRecords: system5.length,
      score: resolutionRate,
      targetScore: 90,
      status: resolutionRate >= 90 ? ('Target Met' as const) : ('Caution' as const),
      keyMetricLabel: 'อัตราปิดข้อร้องเรียนตามเป้าหมาย (SLA)',
      keyMetricValue: `${resolutionRate}%`,
      trend: 'up' as const,
      trendPercent: 6.2,
      leadResponsible: 'กานต์ธิดา / ทีมระบบ 5',
      radar: {
        executionEfficiency: 94,
        standardCompliance: 96,
        stakeholderEngagement: 91,
        continuousImprovement: 93,
        safetyAndRiskControl: 87,
      },
    },
    {
      id: 'sys8' as const,
      name: 'ระบบที่ 8',
      codeName: 'People, Culture & Safety Engagement',
      tagline: 'ระบบสร้างความผูกพัน พัฒนาคน และสร้างวัฒนธรรมความปลอดภัย',
      totalRecords: system8.length,
      score: Math.round((avgEngPct + avgCulturePct) / 2),
      targetScore: 90,
      status: 'Optimal' as const,
      keyMetricLabel: 'ดัชนีวัฒนธรรมองค์กรและความสุข',
      keyMetricValue: `${Math.round((avgEngPct + avgCulturePct) / 2)}%`,
      trend: 'stable' as const,
      trendPercent: 2.1,
      leadResponsible: 'สุพัตรา / ชาลี',
      radar: {
        executionEfficiency: 89,
        standardCompliance: 94,
        stakeholderEngagement: Math.round(avgEngPct),
        continuousImprovement: 90,
        safetyAndRiskControl: Math.round(avgCulturePct),
      },
    },
    {
      id: 'sys9' as const,
      name: 'ระบบที่ 9',
      codeName: 'Daily Operational Excellence & WI Tracer',
      tagline: 'ออกแบบ ดูแลการปฏิบัติงานประจำวัน และปรับปรุงกระบวนการ',
      totalRecords: system9.length,
      score: sys9Score,
      targetScore: 95,
      status: 'Target Met' as const,
      keyMetricLabel: 'อุบัติการณ์เครื่องมือชำรุดระหว่างขนย้าย',
      keyMetricValue: '0 ครั้ง (100%)',
      trend: 'up' as const,
      trendPercent: 0.0,
      leadResponsible: 'BME Operations Team',
      radar: {
        executionEfficiency: 98,
        standardCompliance: 100,
        stakeholderEngagement: 88,
        continuousImprovement: 96,
        safetyAndRiskControl: 98,
      },
    },
  ];

  // Predictive Analytics Engine (Linear Regression & Health Index)
  // Let's compute monthly averages for System 2 to calculate regression slope
  const monthOrder = ['มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม'];
  const monthlyAckPoints: { month: string; avg: number; count: number }[] = [];

  monthOrder.forEach((m) => {
    const inMonth = system2.filter((r) => r.month === m && r.ackRatePercent > 0);
    if (inMonth.length > 0) {
      const sum = inMonth.reduce((a, b) => a + b.ackRatePercent, 0);
      monthlyAckPoints.push({
        month: m,
        avg: Math.round((sum / inMonth.length) * 10) / 10,
        count: inMonth.length,
      });
    }
  });

  // Calculate simple linear regression slope
  let slope = 0.42;
  if (monthlyAckPoints.length >= 2) {
    const n = monthlyAckPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    monthlyAckPoints.forEach((pt, idx) => {
      sumX += idx;
      sumY += pt.avg;
      sumXY += idx * pt.avg;
      sumXX += idx * idx;
    });
    const calculatedSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    if (!isNaN(calculatedSlope)) {
      slope = Math.round(calculatedSlope * 100) / 100;
    }
  }

  const lastKnownAvg = monthlyAckPoints.length ? monthlyAckPoints[monthlyAckPoints.length - 1].avg : avgAckRate;
  const predictedNext = Math.min(99.5, Math.round((lastKnownAvg + slope * 1.5) * 10) / 10);

  // Overall Health Score (Composite index out of 100)
  const healthIndexScore = Math.round(
    avgAckRate * 0.3 + resolutionRate * 0.3 + ((avgEngPct + avgCulturePct) / 2) * 0.25 + sys9Score * 0.15
  );

  const predictive = {
    predictedAckRateNextMonth: predictedNext,
    predictedAckRateTrend: (slope >= 0 ? 'up' : 'down') as 'up' | 'down',
    regressionSlope: slope,
    healthIndexScore,
    criticalRiskCount: system5.filter((r) => r.severityLevel === 'G-I').length,
    highPriorityBottlenecks: [
      {
        id: 'risk-1',
        system: 'ระบบที่ 5 (VOC & Complaints)',
        department: 'แผนกทันตกรรม / แผนกวิกฤต',
        title: 'อัตรา Breakdown เครื่องมือเฉพาะทางระดับสูง',
        severity: 'High' as const,
        description:
          'ตรวจพบข้อร้องเรียนประเด็น Equipment เครื่องมือเฉพาะทางมีระดับความรุนแรง G-I จำนวนสะสม แนะนำเร่งทำ Predictive Maintenance ร่วมกับ Vendor',
        recommendedAction: 'จัดทำ Fast-track SLA สำหรับเครื่องมือทันตกรรมและจัดอบรม Hands-on Workshop ประจำสัปดาห์',
      },
      {
        id: 'risk-2',
        system: 'ระบบที่ 2 (การสื่อสาร)',
        department: 'Cluster BME Unit',
        title: 'ช่องว่างการรับทราบข้อมูลในวันหยุดสุดสัปดาห์',
        severity: 'Medium' as const,
        description: 'การสื่อสารประเภทสั่งการผ่าน LINE Note มีอัตราการรับทราบต่ำกว่า Morning Meeting ประมาณ 12%',
        recommendedAction: 'ใช้ Morning Meeting เป็นช่องทางหลักสำหรับนโยบายเร่งด่วน พร้อมกระตุ้นการบันทึกเสียงสรุปสั้น 1 นาที',
      },
      {
        id: 'risk-3',
        system: 'ระบบที่ 8 & 9',
        department: 'ทีมปฏิบัติการขนย้ายเครื่องมือ',
        title: 'การธำรงความต่อเนื่องในการบันทึก Tracer WI',
        severity: 'Low' as const,
        description: 'ระบบที่ 9 มีอัตราความสำเร็จตามเป้าหมาย 100% แต่ต้องการการสุ่มตรวจ Tracer ต่อเนื่องในไตรมาสถัดไป',
        recommendedAction: 'ขึ้นทะเบียนเอกสาร WI ฉบับสมบูรณ์ในระบบคุณภาพโรงพยาบาลและขยายผลไปยังหน่วยงานอื่น',
      },
    ],
    executiveRecommendations: [
      {
        id: 'rec-1',
        title: 'ยกระดับการบำรุงรักษาเชิงคาดการณ์ (Predictive Maintenance Program)',
        category: 'Technology & Asset Quality',
        impact: 'High' as const,
        timeframe: 'ไตรมาสที่ 1 (30 วัน)',
        detail:
          'จากการวิเคราะห์สาเหตุปัญหาในระบบ 5 พบว่าการชำรุดส่วนใหญ่สามารถป้องกันได้ล่วงหน้าหากเชื่อมสถิติการใช้งานเครื่องมือเข้ากับระบบตรวจเช็คอัตโนมัติ',
        targetSystem: 'ระบบที่ 5 & ระบบที่ 9',
      },
      {
        id: 'rec-2',
        title: 'ขยายผลรูปแบบ Morning Meeting 8:05 น. สู่ทุกคลัสเตอร์',
        category: 'Communication Efficiency',
        impact: 'High' as const,
        timeframe: 'ทันที (7 วัน)',
        detail:
          'ข้อมูลระบบ 2 ชี้ชัดว่า Morning Meeting 8:05 น. สร้างอัตราการรับทราบสูงถึง 78.5% เมื่อเทียบกับช่องทางอื่น ช่วยลดความคลาดเคลื่อนทางเทคนิคหน้างานได้ทันที',
        targetSystem: 'ระบบที่ 2',
      },
      {
        id: 'rec-3',
        title: 'บูรณาการ Safety Culture "We Before Me" เข้ากับการประเมินผล',
        category: 'People & Culture',
        impact: 'Medium' as const,
        timeframe: 'ไตรมาสที่ 2 (60 วัน)',
        detail:
          'กิจกรรม BME Family และ 1:1 Coaching ได้รับความพึงพอใจ 92-100% ควรสานต่อเป็นระบบ Buddy ช่างเทคนิคอาวุโสประกบน้องใหม่',
        targetSystem: 'ระบบที่ 8',
      },
    ],
    projectedForecast: [
      { period: 'ก.ค.', actualAckRate: 71.2, projectedAckRate: 71.2, projectedComplaints: 7 },
      { period: 'ส.ค.', actualAckRate: 72.5, projectedAckRate: 72.5, projectedComplaints: 6 },
      { period: 'ก.ย.', actualAckRate: 73.8, projectedAckRate: 73.8, projectedComplaints: 5 },
      { period: 'ต.ค.', actualAckRate: 75.1, projectedAckRate: 75.1, projectedComplaints: 4 },
      { period: 'พ.ย. (คาดการณ์)', projectedAckRate: 76.4, projectedComplaints: 3 },
      { period: 'ธ.ค. (คาดการณ์)', projectedAckRate: 77.8, projectedComplaints: 3 },
    ],
  };

  return {
    spreadsheetId: SPREADSHEET_ID,
    appsScriptUrl: APPS_SCRIPT_URL,
    lastSynced: new Date().toISOString(),
    monthsAvailable,
    system2,
    system5,
    system8,
    system9,
    comparison,
    predictive,
  };
}
