import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  Sparkles,
  Phone,
  Copy,
  Check,
  Flame,
  Stethoscope,
  Clock,
  Layers,
  ChevronRight,
  PartyPopper,
  Image as ImageIcon,
  LayoutGrid,
} from 'lucide-react';
import { System5InfographicPoster } from './System5InfographicPoster';
import { DashboardDataset, System5Row } from '../../types/dashboard';
import { DateMonthFilterBar } from '../DateMonthFilterBar';
import {
  normalizeDate,
  formatThaiDateReadable,
  getMonthFromDate,
  normalizeThaiMonth,
} from '../../utils/dateUtils';

interface OnePageSystem5Props {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
}

export const OnePageSystem5: React.FC<OnePageSystem5Props> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
}) => {
  let dateFiltered = data.system5;
  const normSelectedMonth = normalizeThaiMonth(selectedMonth);
  if (selectedDate !== 'all') {
    const targetNorm = normalizeDate(selectedDate);
    dateFiltered = dateFiltered.filter((r) => normalizeDate(r.date) === targetNorm);
  } else if (normSelectedMonth !== 'all' && normSelectedMonth !== '') {
    dateFiltered = dateFiltered.filter((r) => normalizeThaiMonth(r.month) === normSelectedMonth);
  }

  // Interactive filters
  const [severityFilter, setSeverityFilter] = useState<'all' | 'GI' | 'DF' | 'AC'>('all');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [planTab, setPlanTab] = useState<'short' | 'long'>('short');
  const [copied, setCopied] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'infographic' | 'detailed'>('infographic');

  let displayedCases = dateFiltered;
  if (severityFilter === 'GI') displayedCases = dateFiltered.filter((r) => r.severityLevel === 'G-I');
  else if (severityFilter === 'DF') displayedCases = dateFiltered.filter((r) => r.severityLevel === 'D-F');
  else if (severityFilter === 'AC') displayedCases = dateFiltered.filter((r) => r.severityLevel === 'A-C');

  if (displayedCases.length === 0) displayedCases = dateFiltered;

  const activeCase: System5Row = displayedCases[selectedCaseIdx] || displayedCases[0] || data.system5[0];

  const totalCases = displayedCases.length;
  const completeCases = displayedCases.filter((r) => r.status.toLowerCase() === 'complete').length;
  const resolutionRate = totalCases > 0 ? Math.round((completeCases / totalCases) * 100) : 100;

  const giCount = displayedCases.filter((r) => r.severityLevel === 'G-I').length;
  const dfCount = displayedCases.filter((r) => r.severityLevel === 'D-F').length;
  const acCount = displayedCases.filter((r) => r.severityLevel === 'A-C').length;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVoc = () => {
    const text = `🩺 [สรุปข้อร้องเรียนและฟื้นฟูบริการ VOC ระบบที่ 5]
🏥 แผนก: ${activeCase.targetDept || activeCase.department}
🚨 ระดับความรุนแรง: ${activeCase.severityLevel}
📝 ประเด็น: ${activeCase.issue}
⏱️ กรอบเวลาแก้ไข: ${activeCase.resolutionTimeframe} (สถานะ: ${activeCase.status})
🛠️ แผนระยะสั้น: ${activeCase.shortTermFix}
💡 แผนระยะยาว: ${activeCase.longTermFix}
👤 ผู้รับผิดชอบ: ${activeCase.leadSupervisor}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Date & Month Global Filter Bar */}
      <div className="w-full max-w-5xl mb-3 no-print">
        <DateMonthFilterBar
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={(m) => {
            onMonthChange(m);
            setSelectedCaseIdx(0);
          }}
          onDateChange={(d) => {
            onDateChange(d);
            setSelectedCaseIdx(0);
          }}
        />
      </div>

      {/* View Mode Switcher: Infographic Poster vs Detailed Case Report */}
      <div className="w-full max-w-5xl mb-4 no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDisplayMode('infographic')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              displayMode === 'infographic'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-lg ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-200" />
            <span>🖼️ โหมด Infographic Poster (VOC 5 ช่องทาง & SLA)</span>
          </button>
          <button
            onClick={() => setDisplayMode('detailed')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              displayMode === 'detailed'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg ring-1 ring-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-amber-200" />
            <span>📊 โหมดรายงานรายเคส (คัดลอก LINE)</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1 font-medium pr-2">
          <span>ช่วงเวลา:</span>
          <span className="text-emerald-300 font-bold">
            {selectedDate !== 'all' ? selectedDate : selectedMonth !== 'all' ? selectedMonth : 'สะสมทั้งปี'}
          </span>
        </div>
      </div>

      {displayMode === 'infographic' ? (
        <System5InfographicPoster data={data} selectedMonth={selectedMonth} selectedDate={selectedDate} />
      ) : (
      <>
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-5 no-print bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">

          {/* Interactive Severity Filters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSeverityFilter('all');
                setSelectedCaseIdx(0);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                severityFilter === 'all'
                  ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ✨ ทั้งหมด
            </button>
            <button
              onClick={() => {
                setSeverityFilter('GI');
                setSelectedCaseIdx(0);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                severityFilter === 'GI'
                  ? 'bg-rose-600 text-white ring-1 ring-rose-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 border border-slate-800'
              }`}
            >
              <span>🚨 รุนแรง G-I</span>
            </button>
            <button
              onClick={() => {
                setSeverityFilter('DF');
                setSelectedCaseIdx(0);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                severityFilter === 'DF'
                  ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-amber-300 border border-slate-800'
              }`}
            >
              <span>⚠️ ปานกลาง D-F</span>
            </button>
            <button
              onClick={() => {
                setSeverityFilter('AC');
                setSelectedCaseIdx(0);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                severityFilter === 'AC'
                  ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-blue-300 border border-slate-800'
              }`}
            >
              <span>ℹ️ ทั่วไป A-C</span>
            </button>
          </div>

          {/* Quick Case Selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
            <select
              value={selectedCaseIdx}
              onChange={(e) => setSelectedCaseIdx(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-amber-300 text-xs rounded px-2.5 py-1.5 focus:border-amber-500 outline-none max-w-[190px] truncate cursor-pointer font-medium"
            >
              {displayedCases.slice(0, 30).map((r, idx) => (
                <option key={idx} value={idx}>
                  #{idx + 1} [{r.targetDept || r.department}] {r.issue.slice(0, 28)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyVoc}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'คัดลอกเคสแล้ว!' : '📋 คัดลอกสรุปเคส'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ พิมพ์ One-Page ระบบที่ 5 (PDF)</span>
          </button>
        </div>
      </div>

      {/* ONE-PAGE CANVAS */}
      <div
        id="onePageDocSys5"
        className="w-full max-w-5xl bg-[#0f172a] text-slate-100 border border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 print-page-container relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />

        {/* HEADER */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <span>🩺 SYSTEM 5 • VOC SERVICE RECOVERY REPORT</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">REF: BME-SYS5-VOC-2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span className="w-3.5 h-7 bg-amber-500 rounded-sm inline-block shrink-0" />
                <span>ระบบที่ 5: เสียงลูกค้า พัฒนาบริการ และแก้ไขข้อร้องเรียน (VOC)</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <span>🛠️ การฟื้นฟูบริการเครื่องมือแพทย์</span>
                <span>•</span>
                <span>⏱️ การแก้ไขปัญหาตามกรอบเวลา SLA และป้องกันเชิงรุก</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-right self-stretch md:self-auto min-w-[210px]">
              <span className="bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded text-xs font-bold text-amber-400 inline-block mb-1">
                🏥 ศูนย์รับเรื่องและพัฒนาบริการ
              </span>
              <div className="text-[11px] text-amber-300 font-medium">
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
              <strong>ปรัชญาการบริการ:</strong> 💖 ลูกค้าให้เป็นศูนย์กลาง คุณภาพคือหัวใจ รับฟังด้วยความใส่ใจ แก้ไขรวดเร็ว พัฒนายั่งยืน
            </span>
          </div>
        </div>

        {/* SECTION 1: KEY PERFORMANCE TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div
            onClick={handleCelebration}
            title="คลิกเพื่อฉลองผลงาน!"
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold text-white flex items-center gap-1">
                <span>✅ อัตราแก้ไขสำเร็จ</span>
              </span>
              <span className="text-[10px] text-emerald-400 group-hover:scale-110 transition">🎉 Click</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">{resolutionRate}%</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">ครบ {completeCases}/{totalCases} เคส</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>🚨 ระดับรุนแรง G-I</span>
            </span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1.5">{giCount} เคส</div>
            <div className="text-[10.5px] text-rose-400 mt-0.5">เข้าสู่แผนแก้ระยะยาว 100%</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>⚠️ ระดับปานกลาง D-F</span>
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">{dfCount} เคส</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">แก้ไขเสร็จใน 1-2 สัปดาห์</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>ℹ️ ระดับหน้างาน A-C</span>
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1.5">{acCount} เคส</div>
            <div className="text-[10.5px] text-blue-400 mt-0.5">แก้ไขเสร็จใน 1 สัปดาห์</div>
          </div>
        </div>

        {/* SECTION 2: INTERACTIVE CASE DRILLDOWN & PLAN TOGGLE */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10.5px] font-mono text-amber-400 uppercase tracking-wider block">
                🏥 หน่วยงานที่เกิดเหตุ: {activeCase.targetDept || activeCase.department}
              </span>
              <h3 className="font-extrabold text-white text-base mt-0.5">
                ประเด็นข้อร้องเรียน: {activeCase.issue || 'การใช้งานและการบำรุงรักษาเครื่องมือเฉพาะทาง'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                🚨 ระดับความรุนแรง: {activeCase.severityLevel}
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✅ สถานะ: {activeCase.status}
              </span>
            </div>
          </div>

          {/* Interactive Plan Tabs: Short-term vs Long-term */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setPlanTab('short')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  planTab === 'short'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🛠️ มาตรการระยะสั้น (Short-Term Action)</span>
              </button>
              <button
                onClick={() => setPlanTab('long')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  planTab === 'long'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>💡 มาตรการระยะยาว (Predictive Long-Term)</span>
              </button>
            </div>

            {planTab === 'short' && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30 space-y-2 animate-fadeIn text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>มาตรการฟื้นฟูบริการระยะสั้น (Immediate & Short-Term Plan):</span>
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line text-[12px]">
                  {activeCase.shortTermFix ||
                    '1. พัฒนาทักษะบุคลากร : จัดอบรม Hands-on Workshop เน้น Daily Check และ First Aid เบื้องต้นโดยช่างเทคนิค\n2. การใช้งานเครื่องมือ : เชิญ Vendor มาสอนเทคนิคการใช้งาน Advanced Features\n3. ติดตามผล Breakdown และค่า MTTR อย่างใกล้ชิดภายใน 3-6 เดือน'}
                </p>
              </div>
            )}

            {planTab === 'long' && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-blue-500/30 space-y-2 animate-fadeIn text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>มาตรการป้องกันเชิงรุกระยะยาว (Systemic Long-Term Plan):</span>
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line text-[12px]">
                  {activeCase.longTermFix ||
                    '1. บำรุงรักษาเชิงคาดการณ์ (Predictive Maintenance) โดยใช้ข้อมูลสถิติการใช้งานมาวิเคราะห์ก่อนเครื่องเสีย\n2. สร้างคลังคู่มือความเชี่ยวชาญ (Knowledge Base) ประจำแผนกที่เข้าถึงได้ง่าย\n3. พัฒนาดัชนีความพึงพอใจ (KPI) เป็นเกณฑ์วัดผลการปฏิบัติงานของทีมช่างและฝ่ายจัดซื้อ'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: CHANNELS & ACCOUNTABILITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>ช่องทางการรับฟังเสียงลูกค้า (Listening Channels)</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">🚶 การเดิน Round:</span>
                <span className="font-bold text-white text-sm">พร้อมบริการหน้างาน</span>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">📊 ระบบ Qualtrics:</span>
                <span className="font-bold text-white text-sm">ความพึงพอใจสูง</span>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">📞 สายด่วน Hotline:</span>
                <span className="font-bold text-white text-sm">รับเรื่องทันที 24 ชม.</span>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">📝 Incident Report (IR):</span>
                <span className="font-bold text-white text-sm">เข้าสู่ระบบสอบสวน</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>การกำกับและกรอบเวลาแก้ไข (Resolution SLA)</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">ผู้รับผิดชอบระบบ 5:</span>
                <span className="font-semibold text-white">{activeCase.leadSupervisor || 'กานต์ธิดา'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">ทีมกำกับติดตาม:</span>
                <span className="font-semibold text-slate-200">{activeCase.responsible || 'UCC (สุพัตรา, ไอยเรศ)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">กรอบเวลาแก้ไข:</span>
                <span className="text-amber-400 font-bold">{activeCase.resolutionTimeframe}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIGN-OFF FOOTER */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (กานต์ธิดา)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้รับผิดชอบระบบ 5 (VOC)</div>
            <div className="text-[10px] text-slate-500">ทีมบริการลูกค้า BME</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (สุพัตรา ชนะโชติ)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้กำกับติดตามการฟื้นฟูบริการ (UQC)</div>
            <div className="text-[10px] text-slate-500">ทีมระบบคุณภาพ BME</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-emerald-400 font-mono text-[10px]">
              [ ปิดงานครบ 100% ]
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ประธานคณะกรรมการบริหารความเสี่ยง</div>
            <div className="text-[10px] text-slate-500">Risk & Service Quality Committee</div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
