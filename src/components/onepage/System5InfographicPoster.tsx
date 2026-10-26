import React, { useState } from 'react';
import {
  BarChart3,
  Footprints,
  Headphones,
  Globe,
  FileWarning,
  Zap,
  BrainCircuit,
  Activity,
  Search,
  Wrench,
  RefreshCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  Printer,
  Stethoscope,
  X,
} from 'lucide-react';
import { DashboardDataset, System5Row } from '../../types/dashboard';
import { normalizeDate, normalizeThaiMonth } from '../../utils/dateUtils';

interface System5InfographicPosterProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
}

type ChannelKey = 'qualtrics' | 'round' | 'phone' | 'web' | 'ir';
type SevKey = 'G-I' | 'D-F' | 'A-C';

const CHANNELS: Array<{
  key: ChannelKey;
  no: number;
  title: string;
  th: string;
  desc: string;
  icon: React.ElementType;
  test: (r: System5Row) => boolean;
}> = [
  {
    key: 'qualtrics',
    no: 1,
    title: 'Qualtrics',
    th: 'แบบสำรวจดิจิทัล',
    desc: 'วัดความพึงพอใจแบบเรียลไทม์ พร้อมสถิติและกราฟ',
    icon: BarChart3,
    test: (r) => r.channelQualtrics,
  },
  {
    key: 'round',
    no: 2,
    title: 'Ward Round',
    th: 'เดินราวด์เชิงรุก',
    desc: 'วิศวกรลงพื้นที่สำรวจเครื่องมือและรับฟังหน้างาน',
    icon: Footprints,
    test: (r) => r.channelRound,
  },
  {
    key: 'phone',
    no: 3,
    title: 'Hotline',
    th: 'สายตรง BME',
    desc: 'รับแจ้งปัญหาทางโทรศัพท์ ตอบสนองทันที',
    icon: Headphones,
    test: (r) => r.channelPhone,
  },
  {
    key: 'web',
    no: 4,
    title: 'Web / N Smart',
    th: 'Online Portal',
    desc: 'แจ้งซ่อมและติดตามสถานะได้ตลอด 24 ชั่วโมง',
    icon: Globe,
    test: (r) => r.channelWeb,
  },
  {
    key: 'ir',
    no: 5,
    title: 'Incident Report',
    th: 'รายงานอุบัติการณ์ (IR)',
    desc: 'ประเด็นความปลอดภัย มีลำดับความสำคัญสูงสุด',
    icon: FileWarning,
    test: (r) => r.channelIR,
  },
];

const SEVERITY: Array<{
  key: SevKey;
  badge: string;
  label: string;
  meaning: string;
  fix: string;
  fixUnit: string;
  follow: string;
  tone: { bg: string; ring: string; text: string; soft: string; dot: string };
}> = [
  {
    key: 'G-I',
    badge: '1',
    label: 'ระดับ G–I · รุนแรงสูง',
    meaning: 'วิกฤต / กระทบการรักษาผู้ป่วย',
    fix: '30',
    fixUnit: 'นาที',
    follow: 'ติดตามผลภายใน 1 สัปดาห์',
    tone: {
      bg: 'bg-[#0b5d4b]',
      ring: 'ring-[#0b5d4b]',
      text: 'text-[#0b5d4b]',
      soft: 'bg-[#e3f1ec]',
      dot: 'bg-rose-500',
    },
  },
  {
    key: 'D-F',
    badge: '2',
    label: 'ระดับ D–F · ปานกลาง',
    meaning: 'กระทบความสะดวก / ความรวดเร็ว',
    fix: '7',
    fixUnit: 'วัน',
    follow: 'ติดตามผลภายใน 2 สัปดาห์',
    tone: {
      bg: 'bg-[#c48a1d]',
      ring: 'ring-[#c48a1d]',
      text: 'text-[#9a6a10]',
      soft: 'bg-[#fbf1dc]',
      dot: 'bg-amber-500',
    },
  },
  {
    key: 'A-C',
    badge: '3',
    label: 'ระดับ A–C · ทั่วไป',
    meaning: 'ข้อเสนอแนะเพื่อการพัฒนา',
    fix: '14',
    fixUnit: 'วัน',
    follow: 'ติดตามผลภายใน 1 เดือน',
    tone: {
      bg: 'bg-[#1f8a8a]',
      ring: 'ring-[#1f8a8a]',
      text: 'text-[#17706f]',
      soft: 'bg-[#e1f2f2]',
      dot: 'bg-teal-500',
    },
  },
];

const SHORT_TERM = [
  'Hands-on Workshop เน้น Daily Check & First Aid สำหรับผู้ใช้งานหน้างาน',
  'เชิญ Vendor อบรมการใช้ Advanced Features ของเครื่องมือเฉพาะทาง',
  'เปิด Online Tracking (N Smart) ให้แผนกเช็คสถานะงานซ่อมได้ 24 ชม.',
  'รับ Feedback รายสัปดาห์ ควบคุม MTTR และลดอัตรา Breakdown',
];

const LONG_TERM = [
  'E-learning ต่อเนื่อง และระบบพี่เลี้ยง (Mentor) ประจำแต่ละแผนก',
  'คลังความรู้ดิจิทัล (Knowledge Base) และคู่มือที่เข้าถึงง่าย',
  'Predictive Maintenance วิเคราะห์สถิติก่อนเครื่องเสีย',
  'Real-time Dashboard เชื่อม 3 ฝ่าย: BME – วอร์ดผู้ใช้ – Vendor',
];

const CYCLE = [
  { no: 1, title: 'Monitor & Collect', th: 'เฝ้าระวังและรวบรวม', items: ['รับเรื่องจาก 5 ช่องทาง', 'บันทึกลง Sheet'], icon: Activity },
  { no: 2, title: 'Analyze & Prioritize', th: 'วิเคราะห์และจัดลำดับ', items: ['หา Root Cause', 'จัดระดับ A–I'], icon: Search },
  { no: 3, title: 'Implement', th: 'ลงมือแก้ไข', items: ['แก้ไขตาม SLA', 'มาตรการสั้น/ยาว'], icon: Wrench },
  { no: 4, title: 'Review & Optimize', th: 'ทบทวนและปรับปรุง', items: ['UCC ติดตามผล', 'ป้อนกลับสู่วงจร'], icon: RefreshCcw },
];

const uniqueNames = (rows: System5Row[], pick: (r: System5Row) => string) => {
  const set = new Set<string>();
  rows.forEach((r) =>
    pick(r)
      .split(/[,/、\n]|และ/)
      .map((s) => s.replace(/^(คุณ|ทีม)\s*/, '').trim())
      .filter((s) => s && s.toUpperCase() !== 'UCC')
      .forEach((s) => set.add(s))
  );
  return Array.from(set);
};

export const System5InfographicPoster: React.FC<System5InfographicPosterProps> = ({
  data,
  selectedMonth,
  selectedDate,
}) => {
  const [activeChannel, setActiveChannel] = useState<ChannelKey | null>(null);
  const [activeSeverity, setActiveSeverity] = useState<SevKey | null>(null);

  // Period filter (same rules as the detailed view)
  let rows = data.system5;
  const normMonth = normalizeThaiMonth(selectedMonth);
  if (selectedDate !== 'all') {
    const target = normalizeDate(selectedDate);
    rows = rows.filter((r) => normalizeDate(r.date) === target);
  } else if (normMonth !== 'all' && normMonth !== '') {
    rows = rows.filter((r) => normalizeThaiMonth(r.month) === normMonth);
  }

  const total = rows.length;
  const complete = rows.filter((r) => (r.status || '').toLowerCase() === 'complete').length;
  const rate = total ? Math.round((complete / total) * 100) : 0;
  const internal = rows.filter((r) => r.customerInternal).length;
  const external = rows.filter((r) => r.customerExternal).length;

  const channelCount = (k: ChannelKey) => rows.filter(CHANNELS.find((c) => c.key === k)!.test).length;
  const sevCount = (k: SevKey) => rows.filter((r) => r.severityLevel === k).length;
  const maxChannel = Math.max(1, ...CHANNELS.map((c) => channelCount(c.key)));

  // Case list driven by the two clickable sections
  let caseRows = rows;
  if (activeChannel) caseRows = caseRows.filter(CHANNELS.find((c) => c.key === activeChannel)!.test);
  if (activeSeverity) caseRows = caseRows.filter((r) => r.severityLevel === activeSeverity);
  const showCases = activeChannel !== null || activeSeverity !== null;

  // 03: real measures recorded in the sheet (fallback to the standard guideline when empty)
  const pickFixes = (pick: (r: System5Row) => string) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of [...rows].reverse()) {
      const t = (pick(r) || '').trim();
      if (t && t !== '-' && !seen.has(t)) {
        seen.add(t);
        out.push(r.issue ? `${t}  (เคส: ${r.issue})` : t);
      }
      if (out.length >= 4) break;
    }
    return out;
  };
  const sheetShort = pickFixes((r) => r.shortTermFix);
  const sheetLong = pickFixes((r) => r.longTermFix);
  const shortItems = sheetShort.length ? sheetShort : SHORT_TERM;
  const longItems = sheetLong.length ? sheetLong : LONG_TERM;

  // 04: how many cases reached each step of the loop
  const cycleCounts = [
    total,
    rows.filter((r) => (r.rootCause || '').trim()).length,
    rows.filter((r) => (r.shortTermFix || '').trim() || (r.longTermFix || '').trim()).length,
    complete,
  ];

  // 05: case list (always shown; filtered by clicking sections 01 / 02)
  const listRows = caseRows;

  const leads = uniqueNames(rows, (r) => r.leadSupervisor);
  const monitors = uniqueNames(rows, (r) => r.responsible);

  const periodLabel =
    selectedDate !== 'all'
      ? `วันที่ ${selectedDate}`
      : selectedMonth !== 'all'
      ? `ประจำเดือน ${selectedMonth}`
      : 'ข้อมูลสะสมทั้งปี';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-5xl flex justify-end mb-3 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0b5d4b] hover:bg-[#0e7059] text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>พิมพ์ / บันทึก PDF (A4)</span>
        </button>
      </div>

      {/* POSTER CANVAS */}
      <div
        id="onePageDocSys5Poster"
        className="print-page-container w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-[#cfe5dc] bg-[#f4faf7] text-[#12332b]"
        style={{ fontFamily: 'var(--font-prompt)' }}
      >
        {/* HEADER */}
        <header className="relative bg-gradient-to-br from-[#0b5d4b] via-[#0d6b56] to-[#13806a] text-white px-6 md:px-8 pt-6 pb-5">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] tracking-[0.18em] uppercase text-emerald-100/90 font-semibold">
                  System 5 · Voice of Customer (VOC)
                </div>
                <h1 className="text-xl md:text-[26px] font-bold leading-snug mt-0.5">
                  ระบบที่ 5 : ระบบนำเสียงลูกค้ามาพัฒนาและปรับปรุงการบริการ
                </h1>
                <p className="text-[12.5px] text-emerald-50/90 mt-1">
                  ฝ่ายวิศวกรรมชีวการแพทย์ (BME) · โรงพยาบาลพญาไท พหลโยธิน
                </p>
              </div>
            </div>
            <div className="bg-white/12 ring-1 ring-white/25 rounded-xl px-4 py-2.5 text-right min-w-[170px] backdrop-blur-sm">
              <div className="text-[10.5px] text-emerald-100/90">{periodLabel}</div>
              <div className="text-3xl font-bold leading-tight">{total ? `${rate}%` : '—'}</div>
              <div className="text-[11px] text-emerald-50/90">
                ปิดงานสำเร็จ {complete}/{total} เคส
              </div>
            </div>
          </div>
          <div className="relative mt-4 text-[11.5px] bg-black/15 rounded-lg px-3 py-2 text-emerald-50">
            <span className="font-semibold text-[#f3c969]">PHQ Spirit</span>
            <span className="mx-2 opacity-50">|</span>
            มืออาชีพ วินัยมั่น ร่วมมือกัน สู่เส้นชัย คุณภาพคือหัวใจ ลูกค้าเป็นศูนย์กลาง
          </div>
        </header>

        <div className="px-5 md:px-8 py-6 space-y-6">
          {/* KPI STRIP */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'เสียงลูกค้าทั้งหมด', value: total, unit: 'เคส' },
              { label: 'ลูกค้าภายใน', value: internal, unit: 'เคส' },
              { label: 'ลูกค้าภายนอก', value: external, unit: 'เคส' },
              { label: 'ระดับรุนแรง G–I', value: sevCount('G-I'), unit: 'เคส', alert: true },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl border border-[#d6e9e1] px-4 py-3">
                <div className="text-[11.5px] text-[#4d6b62]">{k.label}</div>
                <div className={`text-2xl font-bold mt-0.5 ${k.alert && k.value > 0 ? 'text-rose-600' : 'text-[#0b5d4b]'}`}>
                  {k.value} <span className="text-xs font-medium text-[#6b8a81]">{k.unit}</span>
                </div>
              </div>
            ))}
          </section>

          {/* 5 CHANNELS */}
          <section>
            <SectionTitle no="01" title="5 ช่องทางรับฟังเสียงลูกค้า" en="VOC Listening Channels" hint="คลิกการ์ดเพื่อดูเคส" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {CHANNELS.map((c) => {
                const n = channelCount(c.key);
                const on = activeChannel === c.key;
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActiveChannel(on ? null : c.key)}
                    className={`text-left bg-white rounded-xl border p-3.5 transition cursor-pointer relative ${
                      on ? 'border-[#0b5d4b] ring-2 ring-[#0b5d4b]/25 shadow-md' : 'border-[#d6e9e1] hover:border-[#8fc4b3]'
                    } ${c.key === 'ir' ? 'col-span-2 md:col-span-1' : ''}`}
                  >
                    <span className="absolute top-2.5 right-3 text-[10px] font-bold text-[#9bb9af]">0{c.no}</span>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.key === 'ir' ? 'bg-[#fbf1dc] text-[#b07610]' : 'bg-[#e3f1ec] text-[#0b5d4b]'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-[14px] mt-2.5 leading-tight">{c.title}</div>
                    <div className="text-[11.5px] text-[#0d6b56] font-medium">{c.th}</div>
                    <p className="text-[11px] text-[#5b766e] mt-1 leading-snug min-h-[30px]">{c.desc}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#e8f2ee] overflow-hidden">
                        <div className="h-full bg-[#13806a] rounded-full" style={{ width: `${(n / maxChannel) * 100}%` }} />
                      </div>
                      <span className="text-[12px] font-bold text-[#0b5d4b] tabular-nums">{n}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SEVERITY MATRIX */}
          <section>
            <SectionTitle no="02" title="เมทริกซ์ระดับความรุนแรงและกรอบเวลาแก้ไข" en="3-Tier Severity SLA" hint="คลิกระดับเพื่อดูเคส" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SEVERITY.map((s) => {
                const n = sevCount(s.key);
                const on = activeSeverity === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setActiveSeverity(on ? null : s.key)}
                    className={`text-left rounded-xl overflow-hidden bg-white border transition cursor-pointer ${
                      on ? `ring-2 ${s.tone.ring} border-transparent shadow-md` : 'border-[#d6e9e1] hover:shadow-sm'
                    }`}
                  >
                    <div className={`${s.tone.bg} text-white px-4 py-3 flex items-center gap-3`}>
                      <span className="w-8 h-8 rounded-full bg-white/20 ring-1 ring-white/40 flex items-center justify-center font-bold">
                        {s.badge}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-[14px] leading-tight">{s.label}</div>
                        <div className="text-[11px] opacity-90">{s.meaning}</div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-[#5b766e] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> แก้ไขภายใน
                        </div>
                        <div className={`text-3xl font-bold leading-none mt-1 ${s.tone.text}`}>
                          {s.fix} <span className="text-sm font-semibold">{s.fixUnit}</span>
                        </div>
                        <div className="text-[11px] text-[#5b766e] mt-1.5">{s.follow}</div>
                      </div>
                      <div className={`${s.tone.soft} rounded-lg px-3 py-2 text-center`}>
                        <div className={`text-xl font-bold leading-none ${s.tone.text}`}>{n}</div>
                        <div className="text-[10px] text-[#5b766e] mt-0.5">เคส</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* TWO-TIER STRATEGY */}
          <section>
            <SectionTitle
              no="03"
              title="ยุทธศาสตร์แก้ไขปัญหา 2 มิติ"
              en="Two-Tier Solution Strategy"
              hint={sheetShort.length || sheetLong.length ? 'มาตรการจริงจาก Google Sheet' : 'ยังไม่มีมาตรการในชีท · แสดงแนวทางมาตรฐาน'}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StrategyCard
                icon={Zap}
                title="ระยะสั้น · Quick Wins"
                sub="เห็นผลเร็ว แก้ปัญหาหน้างานทันที"
                items={shortItems}
                accent="amber"
              />
              <StrategyCard
                icon={BrainCircuit}
                title="ระยะยาว · Predictive & Sustainable"
                sub="ป้องกันเชิงระบบ ขับเคลื่อนด้วยข้อมูล"
                items={longItems}
                accent="emerald"
              />
            </div>
          </section>

          {/* GOVERNANCE CYCLE */}
          <section>
            <SectionTitle no="04" title="วงจรการกำกับติดตามคุณภาพ" en="UCC Governance Loop" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
              {CYCLE.map((c, i) => {
                const Icon = c.icon;
                const gold = i % 2 === 1;
                return (
                  <div key={c.no} className="relative">
                    <div className={`rounded-xl p-3.5 h-full text-white ${gold ? 'bg-[#c48a1d]' : 'bg-[#0d6b56]'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[22px] font-bold opacity-90 leading-none">{c.no}</span>
                        <Icon className="w-5 h-5 opacity-90" />
                      </div>
                      <div className="mt-1.5 inline-block rounded-md bg-black/20 px-2 py-0.5 text-[11px] font-semibold">
                        {cycleCounts[i]} / {total} เคส
                      </div>
                      <div className="font-bold text-[13.5px] mt-1.5 leading-tight">{c.title}</div>
                      <div className="text-[11.5px] opacity-90">{c.th}</div>
                      <ul className="mt-2 space-y-0.5 text-[11px] opacity-95">
                        {c.items.map((t) => (
                          <li key={t}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                    {i < CYCLE.length - 1 && (
                      <ArrowRight className="hidden md:block absolute top-1/2 -right-[13px] -translate-y-1/2 w-4 h-4 text-[#7fae9f] z-10" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-[#5b766e] flex items-center gap-1.5">
              <RefreshCcw className="w-3.5 h-3.5" /> ผลการทบทวน (ขั้นที่ 4) ป้อนกลับเข้าสู่การเฝ้าระวัง (ขั้นที่ 1) อย่างต่อเนื่อง
            </div>
          </section>

          {/* 05: CASE LIST LINKED TO SECTIONS 01–04 */}
          <section>
            <SectionTitle
              no="05"
              title="เคสเสียงลูกค้าจาก Google Sheet"
              en="VOC Case Log"
              hint="แต่ละเคสบอกว่าอยู่ในข้อ 01–04 ไหน · คลิกการ์ดข้อ 01/02 เพื่อกรอง"
            />
            <div className="bg-white rounded-xl border border-[#d6e9e1] p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-[12.5px] font-bold">
                  {showCases ? 'เคสที่ตรงเงื่อนไข ' : 'เคสทั้งหมดในช่วงนี้ '}
                  {showCases && (
                    <span className="text-[#0d6b56]">
                      {[activeChannel && CHANNELS.find((c) => c.key === activeChannel)!.title, activeSeverity && `ระดับ ${activeSeverity}`]
                        .filter(Boolean)
                        .join(' · ')}{' '}
                    </span>
                  )}
                  <span className="text-[#6b8a81] font-normal">({listRows.length} เคส)</span>
                </div>
                {showCases && (
                  <button
                    onClick={() => {
                      setActiveChannel(null);
                      setActiveSeverity(null);
                    }}
                    className="no-print text-[11px] text-[#5b766e] hover:text-[#0b5d4b] flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> ล้างตัวกรอง
                  </button>
                )}
              </div>
              {listRows.length === 0 ? (
                <div className="text-[12px] text-[#6b8a81] py-3 text-center">ไม่มีเคสในช่วงเวลานี้</div>
              ) : (
                <div className="divide-y divide-[#e8f2ee] max-h-96 overflow-y-auto pf-unclip">
                  {listRows.slice(0, 40).map((r, i) => {
                    const sev = SEVERITY.find((x) => x.key === r.severityLevel);
                    const done = (r.status || '').toLowerCase() === 'complete';
                    const chans = CHANNELS.filter((c) => c.test(r)).map((c) => c.title);
                    const step = done
                      ? '4 Review'
                      : (r.shortTermFix || '').trim() || (r.longTermFix || '').trim()
                      ? '3 Implement'
                      : (r.rootCause || '').trim()
                      ? '2 Analyze'
                      : '1 Monitor';
                    return (
                      <div key={i} className={`py-2.5 text-[12px] ${i >= 5 ? 'pf-print-hide' : ''}`}>
                        <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">
                          <span className={`mt-1.5 w-2 h-2 rounded-full ${sev?.tone.dot || 'bg-slate-400'}`} />
                          <div>
                            <div className="font-medium text-[#12332b]">{r.issue || '—'}</div>
                            <div className="text-[11px] text-[#6b8a81]">
                              {r.date} · {r.targetDept || r.department}
                              {r.rootCause ? ` · สาเหตุ: ${r.rootCause}` : ''}
                            </div>
                          </div>
                          <span
                            className={`text-[10.5px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${
                              done ? 'bg-[#e3f1ec] text-[#0b5d4b]' : 'bg-[#fbf1dc] text-[#9a6a10]'
                            }`}
                          >
                            {r.status || '—'}
                          </span>
                        </div>
                        <div className="mt-1.5 ml-5 flex flex-wrap gap-1.5 text-[10.5px]">
                          <span className="px-2 py-0.5 rounded-md bg-[#e3f1ec] text-[#0b5d4b] border border-[#bfe0d4]">
                            01 ช่องทาง: <strong>{chans.length ? chans.join(', ') : 'ไม่ระบุ'}</strong>
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border border-[#e5d6b3] ${sev ? sev.tone.soft : 'bg-slate-100'} ${sev ? sev.tone.text : 'text-slate-600'}`}>
                            02 ระดับ: <strong>{r.severityLevel}</strong>
                            {sev ? ` · แก้ภายใน ${sev.fix} ${sev.fixUnit}` : ''}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#fbf1dc] text-[#9a6a10] border border-[#ecd9a8]">
                            03 มาตรการ:{' '}
                            <strong>
                              {[(r.shortTermFix || '').trim() && 'ระยะสั้น', (r.longTermFix || '').trim() && 'ระยะยาว']
                                .filter(Boolean)
                                .join(' + ') || 'ยังไม่บันทึก'}
                            </strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#eef2f1] text-[#35554c] border border-[#d6e1dd]">
                            04 ขั้นที่: <strong>{step}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {listRows.length > 5 && (
                    <p className="pf-print-show text-[11px] text-[#6b8a81] text-center pt-2">
                      … และอีก {listRows.length - 5} เคส (ดูทั้งหมดได้บนแดชบอร์ด)
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ACCOUNTABILITY */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-[#d6e9e1] p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#e3f1ec] text-[#0b5d4b] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11.5px] text-[#5b766e]">ผู้รับผิดชอบดำเนินการเคส</div>
                <div className="font-bold text-[14px]">
                  {leads.length ? leads.map((n) => `คุณ${n}`).join(', ') : 'คุณกานต์สิชา, คุณสุพัตรา (BME)'}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#d6e9e1] p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#fbf1dc] text-[#b07610] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11.5px] text-[#5b766e]">คณะกำกับติดตาม (ทีม UCC)</div>
                <div className="font-bold text-[14px]">
                  {monitors.length ? monitors.join(', ') : 'สุพัตรา, ไชยเวศ, ศุภวัฒน์, สุภา'}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="px-6 md:px-8 py-3 bg-[#e3f1ec] text-[10.5px] text-[#4d6b62] flex flex-wrap justify-between gap-2">
          <span>BME-SYS5-VOC · ข้อมูลจาก Google Sheet ระบบที่ 5 ({data.lastSynced ? `ซิงค์ล่าสุด ${data.lastSynced}` : 'ซิงค์อัตโนมัติ'})</span>
          <span>ออกเอกสาร {new Date().toLocaleDateString('th-TH')}</span>
        </footer>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ no: string; title: string; en: string; hint?: string }> = ({ no, title, en, hint }) => (
  <div className="flex items-end justify-between gap-2 mb-3">
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] font-bold text-white bg-[#0b5d4b] rounded-md px-1.5 py-0.5">{no}</span>
      <h2 className="text-[16px] font-bold leading-tight">
        {title} <span className="text-[12px] font-medium text-[#6b8a81]">· {en}</span>
      </h2>
    </div>
    {hint && <span className="text-[10.5px] text-[#8aa69d] no-print hidden sm:block">{hint}</span>}
  </div>
);

const StrategyCard: React.FC<{
  icon: React.ElementType;
  title: string;
  sub: string;
  items: string[];
  accent: 'amber' | 'emerald';
}> = ({ icon: Icon, title, sub, items, accent }) => {
  const a =
    accent === 'amber'
      ? { bar: 'bg-[#c48a1d]', chip: 'bg-[#fbf1dc] text-[#b07610]', num: 'text-[#b07610]' }
      : { bar: 'bg-[#0d6b56]', chip: 'bg-[#e3f1ec] text-[#0b5d4b]', num: 'text-[#0b5d4b]' };
  return (
    <div className="bg-white rounded-xl border border-[#d6e9e1] overflow-hidden">
      <div className={`h-1 ${a.bar}`} />
      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.chip}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-[14.5px] leading-tight">{title}</div>
            <div className="text-[11px] text-[#5b766e]">{sub}</div>
          </div>
        </div>
        <ol className="mt-3 space-y-1.5">
          {items.map((t, i) => (
            <li key={t} className="flex gap-2 text-[12px] leading-snug">
              <span className={`font-bold ${a.num} w-4 shrink-0`}>{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
