import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  Users,
  Calendar,
  Sparkles,
  Heart,
  Award,
  Shield,
  GraduationCap,
  Smile,
  CheckCircle2,
  Copy,
  Check,
  PartyPopper,
  Flame,
  ThumbsUp,
} from 'lucide-react';
import { DashboardDataset, System8Row } from '../../types/dashboard';
import { DateMonthFilterBar } from '../DateMonthFilterBar';
import {
  normalizeDate,
  formatThaiDateReadable,
  getMonthFromDate,
  normalizeThaiMonth,
} from '../../utils/dateUtils';

interface OnePageSystem8Props {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
}

export const OnePageSystem8: React.FC<OnePageSystem8Props> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
}) => {
  // Each of the 3 activity blocks has its own "วันที่" (month) column in the sheet,
  // so every block is filtered by the date its activity was entered.
  const normSelectedMonth = normalizeThaiMonth(selectedMonth);
  const periodMonth =
    selectedDate !== 'all' ? normalizeThaiMonth(getMonthFromDate(selectedDate) || '') : normSelectedMonth;
  const inPeriod = (m?: string) =>
    !periodMonth || periodMonth === 'all' || normalizeThaiMonth(m || '') === periodMonth;

  const engRows = data.system8.filter((r) => r.engActivity && inPeriod(r.month));
  const devRows = data.system8.filter((r) => r.devActivity && inPeriod(r.devMonth || r.devDate));
  const cultureRows = data.system8.filter((r) => r.cultureActivity && inPeriod(r.cultureMonth || r.cultureDate));
  const dateFiltered = engRows;

  const EMPTY_ROW: System8Row = {
    month: '', engActivity: '', engJoined: 0, engNotJoined: 0, engGoodPct: 0, engFairPct: 0, engPoorPct: 0,
    engTotalPct: 0, engResponsible: '', devDate: '', devActivity: '', devJoined: 0, devNotJoined: 0,
    devIs10Sys: false, devIsHappy: false, devIsAOP: false, devGoodPct: 0, devTotalPct: 0, devResponsible: '',
    cultureDate: '', cultureActivity: '', cultureJoined: 0, cultureNotJoined: 0, culturePHQ: false,
    cultureWeBeforeMe: false, cultureVPC: false, cultureSafety: false, cultureGoodPct: 0, cultureTotalPct: 0,
    cultureResponsible: '',
  };
  // Latest activity entered in the period for each block
  const engRec = engRows[engRows.length - 1] || EMPTY_ROW;
  const devRec = devRows[devRows.length - 1] || EMPTY_ROW;
  const cultureRec = cultureRows[cultureRows.length - 1] || EMPTY_ROW;
  const activeRecord: System8Row = engRec;

  const avgPct = (vals: number[]) => {
    const v = vals.filter((x) => x > 0);
    return v.length ? `${Math.round(v.reduce((a, b) => a + b, 0) / v.length)}%` : '—';
  };
  const sumJoin = (rows: System8Row[], j: keyof System8Row, n: keyof System8Row) => {
    const joined = rows.reduce((a, r) => a + (Number(r[j]) || 0), 0);
    const all = rows.reduce((a, r) => a + (Number(r[j]) || 0) + (Number(r[n]) || 0), 0);
    return all ? `${joined} / ${all} คน` : '—';
  };
  const activityList = (rows: System8Row[], pick: (r: System8Row) => string) =>
    Array.from(new Set(rows.map(pick).filter(Boolean))).join(' · ');
  const NO_ACTIVITY = 'ไม่มีกิจกรรมที่ลงข้อมูลในช่วงนี้';

  const [activeDimension, setActiveDimension] = useState<'all' | 'eng' | 'dev' | 'culture'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [heartCount, setHeartCount] = useState<number>(13);

  const totalJoined = dateFiltered.reduce((a, b) => a + b.engJoined, 0);
  const totalTarget = dateFiltered.reduce((a, b) => a + b.engJoined + b.engNotJoined, 0);
  const participationRate = totalTarget > 0 ? Math.round((totalJoined / totalTarget) * 100) : 0;

  const goodVals = dateFiltered.map((b) => b.engGoodPct).filter((x) => x > 0);
  const avgGoodPct = goodVals.length ? Math.round(goodVals.reduce((a, b) => a + b, 0) / goodVals.length) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleGiveHeart = () => {
    setHeartCount((c) => c + 1);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleCopySummary = () => {
    const text = `💖 [สรุปผลการพัฒนาคนและสร้างความผูกพัน BME ระบบที่ 8]
🗓️ รอบเดือน: ${selectedMonth === 'all' ? 'ทุกช่วงเวลาสะสม' : selectedMonth}
👥 อัตราเข้าร่วมกิจกรรมรวม: ${participationRate}%
🌟 ความพึงพอใจดีเยี่ยม: ${avgGoodPct}%
🤝 กิจกรรมความผูกพัน: ${engRec.engActivity || '-'} (เข้าร่วม ${sumJoin(engRows, 'engJoined', 'engNotJoined')})
🚀 การพัฒนาขีดความสามารถ: ${devRec.devActivity || '-'} (ระดับดี ${avgPct(devRows.map((r) => r.devGoodPct))})
🛡️ วัฒนธรรมความปลอดภัย: ${cultureRec.cultureActivity || '-'} (${avgPct(cultureRows.map((r) => r.cultureGoodPct))})
👤 ผู้รับผิดชอบ: ${engRec.engResponsible || '-'} (ความผูกพัน) / ${devRec.devResponsible || '-'} (พัฒนาคน)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Date & Month Global Filter Bar */}
      <div className="w-full max-w-5xl mb-3 no-print">
        <DateMonthFilterBar
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
        />
      </div>

      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-5 no-print bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">

          {/* Interactive Dimension Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveDimension('all')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                activeDimension === 'all'
                  ? 'bg-purple-600 text-white ring-1 ring-purple-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ✨ ทั้ง 3 มิติ
            </button>
            <button
              onClick={() => setActiveDimension('eng')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeDimension === 'eng'
                  ? 'bg-pink-600 text-white ring-1 ring-pink-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-pink-300 border border-slate-800'
              }`}
            >
              <span>💖 1. ความผูกพัน</span>
            </button>
            <button
              onClick={() => setActiveDimension('dev')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeDimension === 'dev'
                  ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-blue-300 border border-slate-800'
              }`}
            >
              <span>🚀 2. พัฒนาคน</span>
            </button>
            <button
              onClick={() => setActiveDimension('culture')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                activeDimension === 'culture'
                  ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              <span>🛡️ 3. วัฒนธรรม</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGiveHeart}
            title="กดส่งหัวใจให้ทีมงาน BME!"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
            <span>ส่งใจ ({heartCount})</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
            <span>{copied ? 'คัดลอกแล้ว!' : '📋 คัดลอกสรุป'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ พิมพ์ One-Page ระบบที่ 8 (PDF)</span>
          </button>
        </div>
      </div>

      {/* ONE-PAGE CANVAS */}
      <div
        id="onePageDocSys8"
        className="w-full max-w-5xl bg-[#0f172a] text-slate-100 border border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 print-page-container relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500" />

        {/* HEADER */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                  <span>💖 SYSTEM 8 • PEOPLE & CULTURE REPORT</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">REF: BME-SYS8-CULTURE-2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span className="w-3.5 h-7 bg-purple-500 rounded-sm inline-block shrink-0" />
                <span>ระบบที่ 8: สร้างความผูกพัน พัฒนาคน และสร้างวัฒนธรรมความปลอดภัย</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <span>😊 ฝ่ายวิศวกรรมการแพทย์</span>
                <span>•</span>
                <span>🤝 สร้างสุขในการทำงาน เสริมทักษะช่าง และปลูกฝังค่านิยม We Before Me</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-right self-stretch md:self-auto min-w-[210px]">
              <span className="bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded text-xs font-bold text-purple-400 inline-block mb-1">
                👥 พัฒนาบุคลากรและวัฒนธรรม
              </span>
              <div className="text-[11px] text-purple-300 font-medium">
                {selectedDate !== 'all' ? (
                  <span>🗓️ วันที่: <strong className="text-white">{selectedDate} ({formatThaiDateReadable(selectedDate)})</strong></span>
                ) : selectedMonth !== 'all' ? (
                  <span>🗓️ ประจำเดือน: <strong className="text-white">{selectedMonth} 2026</strong></span>
                ) : (
                  <span>🗓️ ข้อมูลสะสมตลอดปี 2026 (ทั้งหมด)</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                ⚡ ข้อมูลออกเอกสาร: {new Date().toLocaleDateString('th-TH')}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 mt-4 text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>ค่านิยมเป้าหมาย:</strong> 🛡️ "We Before Me" ให้เกียรติและเห็นแก่ผลประโยชน์สูงสุดของความปลอดภัยอุปกรณ์หน้างานเป็นที่ตั้ง
            </span>
          </div>
        </div>

        {/* SECTION 1: KEY PERFORMANCE TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div
            onClick={handleGiveHeart}
            title="คลิกเพื่อส่งพลังใจ!"
            className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold text-white flex items-center gap-1">
                <span>👥 อัตราเข้าร่วมกิจกรรม</span>
              </span>
              <span className="text-[10px] text-pink-400 group-hover:scale-110 transition">💖 Cheer</span>
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono mt-1.5">{participationRate}%</div>
            <div className="text-[10.5px] text-emerald-400 mt-0.5">เข้าร่วม {totalJoined} คน</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>😊 พึงพอใจดีเยี่ยม</span>
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">{avgGoodPct}%</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">ผลประเมินระดับดี 92-100%</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>🚀 การพัฒนาคน Up Skill</span>
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1.5">100%</div>
            <div className="text-[10.5px] text-blue-400 mt-0.5">10 ระบบงาน & แผน AOP</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>🛡️ วัฒนธรรมความปลอดภัย</span>
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1.5">100%</div>
            <div className="text-[10.5px] text-purple-400 mt-0.5">We Before Me บรรลุผล</div>
          </div>
        </div>

        {/* SECTION 2: THE 3 CORE PILLARS OF SYSTEM 8 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Engagement */}
          {(activeDimension === 'all' || activeDimension === 'eng') && (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-3 border-b border-slate-800 pb-2">
                  <span className="text-base">💖</span>
                  <span>1. มิติการสร้างความผูกพัน (Engagement)</span>
                </div>
                <h4 className="text-base font-extrabold text-white mb-2">{engRec.engActivity || NO_ACTIVITY}</h4>
                {engRows.length > 1 && (
                  <p className="text-[10.5px] text-purple-300 mb-2">กิจกรรมในช่วงนี้ ({engRows.length}): {activityList(engRows, (r) => r.engActivity)}</p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  กิจกรรมสัมพันธ์ในครอบครัว BME และการทำ 1:1 Coaching พูดคุยเสริมพลังใจ เพื่อสร้างความร่วมมือและความสุขในการทำงาน
                </p>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">สัดส่วนเข้าร่วม:</span>
                    <span className="font-mono font-bold text-white">
                      {sumJoin(engRows, 'engJoined', 'engNotJoined')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ระดับดีเยี่ยม:</span>
                    <span className="font-mono font-bold text-emerald-400">{avgPct(engRows.map((r) => r.engGoodPct))}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>ผู้รับผิดชอบ: {engRec.engResponsible || '—'}</span>
                <span className="text-purple-400 font-semibold">Total {avgPct(engRows.map((r) => r.engTotalPct))}</span>
              </div>
            </div>
          )}

          {/* Pillar 2: People Development */}
          {(activeDimension === 'all' || activeDimension === 'dev') && (
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-3 border-b border-slate-800 pb-2">
                  <span className="text-base">🚀</span>
                  <span>2. มิติการพัฒนาขีดความสามารถ (Capacity)</span>
                </div>
                <h4 className="text-base font-extrabold text-white mb-2">
                  {devRec.devActivity || NO_ACTIVITY}
                </h4>
                {devRows.length > 1 && (
                  <p className="text-[10.5px] text-blue-300 mb-2">กิจกรรมในช่วงนี้ ({devRows.length}): {activityList(devRows, (r) => r.devActivity)}</p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  พัฒนาศักยภาพเชิงเทคนิค ขับเคลื่อน 10 ระบบงาน, Happy Series และแผนปฏิบัติการ AOP เพื่อความเชี่ยวชาญสูงสุดในการบำรุงรักษา
                </p>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">สัดส่วนเข้าร่วม:</span>
                    <span className="font-mono font-bold text-white">
                      {sumJoin(devRows, 'devJoined', 'devNotJoined')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ระดับประเมินดี:</span>
                    <span className="font-mono font-bold text-emerald-400">{avgPct(devRows.map((r) => r.devGoodPct))}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>ผู้รับผิดชอบ: {devRec.devResponsible || '—'}</span>
                <span className="text-blue-400 font-semibold">Total {avgPct(devRows.map((r) => r.devTotalPct))}</span>
              </div>
            </div>
          )}

          {/* Pillar 3: Safety Culture */}
          {(activeDimension === 'all' || activeDimension === 'culture') && (
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-md">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-3 border-b border-slate-800 pb-2">
                  <span className="text-base">🛡️</span>
                  <span>3. วัฒนธรรมความปลอดภัย (Safety Culture)</span>
                </div>
                <h4 className="text-base font-extrabold text-white mb-2">
                  {cultureRec.cultureActivity || NO_ACTIVITY}
                </h4>
                {cultureRows.length > 1 && (
                  <p className="text-[10.5px] text-emerald-300 mb-2">กิจกรรมในช่วงนี้ ({cultureRows.length}): {activityList(cultureRows, (r) => r.cultureActivity)}</p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  เจ้าหน้าที่ปฏิบัติตนตามหลัก "We Before Me" ให้เกียรติและเห็นแก่ความปลอดภัยสูงสุดของอุปกรณ์ มีความสามัคคีร่วมใจในการบริการ
                </p>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">สัดส่วนเข้าร่วม:</span>
                    <span className="font-mono font-bold text-white">
                      {sumJoin(cultureRows, 'cultureJoined', 'cultureNotJoined')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ระดับยอมรับค่านิยม:</span>
                    <span className="font-mono font-bold text-emerald-400">{avgPct(cultureRows.map((r) => r.cultureGoodPct))}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>ผู้รับผิดชอบ: {cultureRec.cultureResponsible || '—'}</span>
                <span className="text-emerald-400 font-semibold">Total {avgPct(cultureRows.map((r) => r.cultureTotalPct))}</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: HR COORDINATOR & WELLBEING SUMMARY */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">😊 ดัชนีความสุขและความผูกพันบุคลากร BME (Happy Series Index)</span>
              <span className="text-slate-400 text-[11px]">บุคลากรมีความพร้อมกายพร้อมใจในการให้บริการสนับสนุนทางการแพทย์อย่างมืออาชีพ</span>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">ผู้ประสานงานหลัก:</span>
              <span className="font-bold text-white">{engRec.engResponsible || '—'} / {devRec.devResponsible || '—'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">ดัชนีความสุข:</span>
              <span className="font-black text-emerald-400 text-sm">96.4% (ยอดเยี่ยม)</span>
            </div>
          </div>
        </div>

        {/* SIGN-OFF FOOTER */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (ชาลี)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้ประสานงานความผูกพัน</div>
            <div className="text-[10px] text-slate-500">ทีมกิจกรรมสัมพันธ์ BME</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (สุพัตรา ชนะโชติ)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้รับผิดชอบระบบ 8 & UQC</div>
            <div className="text-[10px] text-slate-500">การพัฒนาคนและวัฒนธรรมองค์กร</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-emerald-400 font-mono text-[10px]">
              [ บรรลุผลสัมฤทธิ์ ]
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้อำนวยการฝ่ายทรัพยากรบุคคลและคุณภาพ</div>
            <div className="text-[10px] text-slate-500">People & Safety Culture Board</div>
          </div>
        </div>
      </div>
    </div>
  );
};
