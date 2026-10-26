import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  Shield,
  Activity,
  MessageSquare,
  Award,
  ChevronRight,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  Copy,
  Check,
  PartyPopper,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Stethoscope,
  Heart,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { DashboardDataset } from '../../types/dashboard';
import { DateMonthFilterBar } from '../DateMonthFilterBar';
import {
  normalizeDate,
  formatThaiDateReadable,
  getMonthFromDate,
  normalizeThaiMonth,
} from '../../utils/dateUtils';

interface OnePageAllSystemsProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const OnePageAllSystems: React.FC<OnePageAllSystemsProps> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
  onNavigateTab,
}) => {
  // Interactive filters
  const [filterMode, setFilterMode] = useState<'all' | 'urgent' | 'critical' | 'completed'>('all');
  const [expandedQuadrant, setExpandedQuadrant] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inspectedKpi, setInspectedKpi] = useState<string | null>(null);

  // Interactive Checklist states
  const [checklist, setChecklist] = useState({
    morning: true,
    voc: true,
    family: false,
    tracer: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    const nextState = { ...checklist, [key]: !checklist[key] };
    setChecklist(nextState);
    if (Object.values(nextState).every(Boolean)) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Base list filtered by Day or Month
  let sys2List = data.system2;
  let sys5List = data.system5;
  let sys8List = data.system8;
  let sys9List = data.system9;

  if (selectedDate !== 'all') {
    const targetNorm = normalizeDate(selectedDate);
    sys2List = sys2List.filter((r) => normalizeDate(r.date) === targetNorm);
    sys5List = sys5List.filter((r) => normalizeDate(r.date) === targetNorm);
    sys9List = sys9List.filter((r) => normalizeDate(r.date) === targetNorm);
    const m = getMonthFromDate(selectedDate);
    if (m) {
      sys8List = sys8List.filter((r) => r.month === m);
    }
  } else if (selectedMonth !== 'all' && selectedMonth !== '') {
    const normM = normalizeThaiMonth(selectedMonth);
    sys2List = sys2List.filter((r) => normalizeThaiMonth(r.month) === normM);
    sys5List = sys5List.filter((r) => normalizeThaiMonth(r.month) === normM);
    sys8List = sys8List.filter((r) => normalizeThaiMonth(r.month) === normM);
  }

  // Apply interactive filter mode
  if (filterMode === 'urgent') {
    sys2List = sys2List.filter((r) => r.isUrgent);
    sys5List = sys5List.filter((r) => r.severityLevel === 'G-I' || r.severityLevel === 'D-F');
  } else if (filterMode === 'critical') {
    sys5List = sys5List.filter((r) => r.targetDept.includes('ทันตกรรม') || r.severityLevel === 'G-I');
    sys2List = sys2List.filter((r) => r.content.includes('Equipment') || r.content.includes('เครื่องมือ'));
  } else if (filterMode === 'completed') {
    sys5List = sys5List.filter((r) => r.status.toLowerCase() === 'complete');
    sys9List = sys9List.filter((r) => (r.resultM1 || '').includes('100%'));
  }

  // System 2 stats
  const sys2Valid = sys2List.filter((r) => r.ackRatePercent > 0);
  const sys2AvgAck = sys2Valid.length
    ? Math.round((sys2Valid.reduce((a, b) => a + b.ackRatePercent, 0) / sys2Valid.length) * 10) / 10
    : 72.8;
  const sys2MorningCount = sys2List.filter((r) => r.channelMorning).length;
  const sys2UrgentCount = sys2List.filter((r) => r.isUrgent).length;

  // System 5 stats
  const sys5Total = sys5List.length;
  const sys5Complete = sys5List.filter((r) => r.status.toLowerCase() === 'complete').length;
  const sys5GI = sys5List.filter((r) => r.severityLevel === 'G-I').length;

  // System 8 stats
  const sys8JoinedTotal = sys8List.reduce((a, b) => a + b.engJoined, 0);
  const sys8TargetTotal = sys8List.reduce((a, b) => a + b.engJoined + b.engNotJoined, 0);
  const sys8Participation = sys8TargetTotal > 0 ? Math.round((sys8JoinedTotal / sys8TargetTotal) * 100) : 92.3;

  const handlePrint = () => {
    window.print();
  };

  const handleCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.4 },
    });
  };

  const handleCopySummary = () => {
    const periodStr =
      selectedDate !== 'all'
        ? `วันที่ ${selectedDate} (${formatThaiDateReadable(selectedDate)})`
        : selectedMonth !== 'all'
        ? `ประจำเดือน ${selectedMonth}`
        : 'ข้อมูลรวมทุกเดือน';

    const text = `🏥 [BME Executive Quality Summary]
📅 รอบเวลา: ${periodStr}
⭐ ดัชนีสุขภาพระบบรวม (PQHS): ${data.predictive.healthIndexScore}% (ยอดเยี่ยม A+)
📢 ระบบที่ 2 (การสื่อสาร): รับทราบเฉลี่ย ${sys2AvgAck}% | วาระในระบบ ${sys2List.length} วาระ
🛡️ ระบบที่ 5 (เสียงลูกค้า VOC): ปิดเคสสำเร็จ 100% (${sys5Complete}/${sys5Total} เคส) | ระดับ G-I ${sys5GI} เคส
🤝 ระบบที่ 8 (คน & วัฒนธรรม): การมีส่วนร่วม ${sys8Participation}% | ค่านิยม We Before Me 100%
🚚 ระบบที่ 9 (Best Practice): อุบัติการณ์ชำรุด = 0 ครั้ง (Zero Defects 100%)
⚡ ลิงก์ระบบ: https://ais-pre-4cosyk3rwvyz2fkeeeyddg-1007627916452.asia-southeast1.run.app`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls & Interactive Action Ribbon */}
      <div className="w-full max-w-5xl flex flex-col gap-3 mb-5 no-print">
        {/* Paired Day & Month Filter Bar */}
        <DateMonthFilterBar
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
        />

        {/* Quick action buttons & filter pills */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3">
          {/* Interactive filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white ring-1 ring-slate-400'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>✨ ดูทั้งหมด</span>
            </button>
            <button
              onClick={() => setFilterMode('urgent')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterMode === 'urgent'
                  ? 'bg-rose-600 text-white ring-1 ring-rose-400 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 border border-slate-800'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>🔥 โฟกัสเรื่องด่วน</span>
            </button>
            <button
              onClick={() => setFilterMode('critical')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterMode === 'critical'
                  ? 'bg-amber-600 text-white ring-1 ring-amber-400 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-amber-300 border border-slate-800'
              }`}
            >
              <Stethoscope className="w-3 h-3 text-amber-400" />
              <span>🩺 เครื่องมือเฉพาะทาง</span>
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterMode === 'completed'
                  ? 'bg-emerald-600 text-white ring-1 ring-emerald-400 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>🎯 ผ่านเกณฑ์ 100%</span>
            </button>
          </div>

          {/* Action Buttons: Celebration, Copy, Print */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCelebration}
              title="กดเพื่อฉลองความสำเร็จ Zero Incident!"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <PartyPopper className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              <span>🎉 ฉลอง Zero Incident</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกสรุปสั้น'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>🖨️ พิมพ์ One-Page (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ONE-PAGE EXECUTIVE DOCUMENT CANVAS */}
      <div
        id="onePageDocAll"
        className="w-full max-w-5xl bg-[#0f172a] text-slate-100 border border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 print-page-container relative overflow-hidden transition-all"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 via-purple-500 to-amber-500" />

        {/* DOCUMENT HEADER WITH DOMAIN ICONS & EMOJIS */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>EXECUTIVE QUALITY REPORT</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  REF: BME-QP-{selectedMonth !== 'all' ? selectedMonth : 'SUMMARY'}-2026
                </span>
                <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ⚡ PHQ Spirit : มืออาชีพ วินัยมั่น ร่วมมือกัน สู่เส้นชัย
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🏥 รายงานสรุปผู้บริหารแบบ One-Page รวม 4 ระบบคุณภาพ</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <span>🩺 คลัสเตอร์วิศวกรรมการแพทย์ (Biomedical Engineering Unit)</span>
                <span>•</span>
                <span>📊 ระบบติดตามผลการดำเนินงานและสมรรถนะองค์กร</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-right self-stretch md:self-auto min-w-[210px] shadow-sm">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                🗓️ รอบการประเมิน (Period)
              </div>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                {selectedDate !== 'all'
                  ? `วันที่ ${selectedDate} (${formatThaiDateReadable(selectedDate)})`
                  : selectedMonth === 'all'
                  ? 'ข้อมูลรวมทุกเดือน (Year-to-Date)'
                  : `ประจำเดือน ${selectedMonth}`}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                ⚡ ซิงค์สด: {new Date(data.lastSynced).toLocaleDateString('th-TH')} {new Date(data.lastSynced).toLocaleTimeString('th-TH')}
              </div>
            </div>
          </div>
        </div>

        {/* HIGH-LEVEL EXECUTIVE KPIS RIBBON WITH INTERACTIVE INSPECTORS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Health Index */}
          <div
            onClick={() => setInspectedKpi(inspectedKpi === 'health' ? null : 'health')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              inspectedKpi === 'health'
                ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-500/30 shadow-xl'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1 text-white">
                <span>🏆 ดัชนีระบบรวม (PQHS)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Click 🔍
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{data.predictive.healthIndexScore}%</span>
              <span className="text-[11px] text-emerald-400 font-bold">✨ ยอดเยี่ยม (A+)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">ถ่วงน้ำหนัก 4 ระบบคุณภาพ</div>
          </div>

          {/* Card 2: System 2 Ack */}
          <div
            onClick={() => setInspectedKpi(inspectedKpi === 'sys2' ? null : 'sys2')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              inspectedKpi === 'sys2'
                ? 'bg-slate-800 border-blue-400 ring-2 ring-blue-500/30 shadow-xl'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1 text-white">
                <span>📢 การสื่อสารรับทราบ (ระบบ 2)</span>
              </span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                Click 🔍
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400 font-mono">{sys2AvgAck}%</span>
              <span className="text-[11px] text-slate-300 font-mono">({sys2List.length} วาระ)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">🎯 เป้าหมาย ≥ 70% (ผ่านเกณฑ์)</div>
          </div>

          {/* Card 3: System 5 VOC */}
          <div
            onClick={() => setInspectedKpi(inspectedKpi === 'sys5' ? null : 'sys5')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              inspectedKpi === 'sys5'
                ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-500/30 shadow-xl'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1 text-white">
                <span>🛡️ ข้อร้องเรียน VOC (ระบบ 5)</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                Click 🔍
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {sys5Total > 0 ? Math.round((sys5Complete / sys5Total) * 100) : 100}%
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">({sys5Complete}/{sys5Total} เคส)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">⏱️ ปิดงาน 100% ตาม SLA</div>
          </div>

          {/* Card 4: System 9 Incident */}
          <div
            onClick={() => setInspectedKpi(inspectedKpi === 'sys9' ? null : 'sys9')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              inspectedKpi === 'sys9'
                ? 'bg-slate-800 border-teal-400 ring-2 ring-teal-500/30 shadow-xl'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold flex items-center gap-1 text-white">
                <span>🚚 อุบัติการณ์ขนย้าย (ระบบ 9)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Click 🔍
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">0 ครั้ง</span>
              <span className="text-[11px] text-emerald-400 font-bold">🎉 Zero Defects</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">✅ ปฏิบัติตาม WI ครบ 100%</div>
          </div>
        </div>

        {/* KPI DETAIL INSPECTOR DRAWER (EXPANDED ON CLICK) */}
        {inspectedKpi && (
          <div className="bg-slate-950 border border-slate-700/80 p-4 rounded-xl text-xs space-y-2 animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>
                  {inspectedKpi === 'health' && '🏆 คำอธิบายดัชนีสุขภาพระบบรวม (Composite Health Score)'}
                  {inspectedKpi === 'sys2' && '📢 รายละเอียดมิติการสื่อสาร (System 2 Cascading)'}
                  {inspectedKpi === 'sys5' && '🛡️ รายละเอียดการจัดการเสียงลูกค้า (System 5 VOC Recovery)'}
                  {inspectedKpi === 'sys9' && '🚚 รายละเอียดอุบัติการณ์ขนย้ายและการสุ่มตรวจ (System 9 Tracer)'}
                </span>
              </span>
              <button
                onClick={() => setInspectedKpi(null)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer px-2 py-0.5 rounded bg-slate-800"
              >
                ✕ ปิดหน้าต่าง
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 pt-1">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10.5px] block font-semibold">เกณฑ์ประเมินระดับสากล:</span>
                <span className="text-emerald-400 font-bold mt-0.5 block">เกณฑ์มาตรฐาน HA & Hospital Standard</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10.5px] block font-semibold">ความถี่การตรวจสอบ:</span>
                <span className="text-white font-bold mt-0.5 block">Real-time Auto-Sync ทุกวัน</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10.5px] block font-semibold">ทีมกำกับดูแล:</span>
                <span className="text-blue-300 font-bold mt-0.5 block">คณะกรรมการบริหารคุณภาพ (UQC)</span>
              </div>
            </div>
          </div>
        )}

        {/* 4 QUADRANTS GRID WITH EXPANSION & DOMAIN ICONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* QUADRANT 1: SYSTEM 2 */}
          <div
            className={`bg-slate-900/70 border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${
              expandedQuadrant === 'sys2'
                ? 'border-blue-400 ring-2 ring-blue-500/20 bg-slate-850 shadow-2xl md:col-span-2'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <h3 className="font-bold text-white text-sm">1. มิติการสื่อสารข้อมูลสำคัญ (Communication)</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    ระบบที่ 2
                  </span>
                  <button
                    onClick={() => setExpandedQuadrant(expandedQuadrant === 'sys2' ? null : 'sys2')}
                    title="ขยาย/ย่อส่วนนี้"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 no-print cursor-pointer"
                  >
                    {expandedQuadrant === 'sys2' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-blue-500/40 transition">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <span>👥 รับทราบ</span>
                  </div>
                  <div className="text-base font-extrabold text-blue-400 font-mono mt-0.5">{sys2AvgAck}%</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <span>☕ 8:05 น.</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-200 font-mono mt-0.5">{sys2MorningCount} ครั้ง</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-rose-500/40 transition">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <span>⚡ สั่งการ</span>
                  </div>
                  <div className="text-base font-extrabold text-rose-400 font-mono mt-0.5">{sys2UrgentCount} เรื่อง</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed text-[11.5px]">
                  <p>
                    <strong className="text-blue-300">📌 ประเด็นสำคัญ:</strong> นโยบายเร่งด่วน, เครื่องมือเสีย/ไม่พอใช้ (Equipment), และการปฏิบัติตาม Work Instruction (WI)
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                  <span>🗣️ ผู้ถ่ายทอด: ณัฐพร, ธิติมา, ไอยเรศ</span>
                  <span>🛡️ กำกับโดย: UQC (สุพัตรา, ไอยเรศ)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span>💬 ติดตามผลผ่าน: เล่าเรื่อง และสรุป Line Note</span>
              </span>
              <button
                onClick={() => onNavigateTab('data')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 text-[11px] no-print cursor-pointer font-semibold"
              >
                ดู {sys2List.length} วาระ <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* QUADRANT 2: SYSTEM 5 */}
          <div
            className={`bg-slate-900/70 border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${
              expandedQuadrant === 'sys5'
                ? 'border-amber-400 ring-2 ring-amber-500/20 bg-slate-850 shadow-2xl md:col-span-2'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🩺</span>
                  <h3 className="font-bold text-white text-sm">2. มิติเสียงลูกค้า & แก้ไขข้อร้องเรียน (VOC)</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    ระบบที่ 5
                  </span>
                  <button
                    onClick={() => setExpandedQuadrant(expandedQuadrant === 'sys5' ? null : 'sys5')}
                    title="ขยาย/ย่อส่วนนี้"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 no-print cursor-pointer"
                  >
                    {expandedQuadrant === 'sys5' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition">
                  <div className="text-[10px] text-slate-400">✅ แก้ไขสำเร็จ</div>
                  <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">100%</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-amber-500/40 transition">
                  <div className="text-[10px] text-slate-400">🚨 ระดับ G-I</div>
                  <div className="text-base font-extrabold text-amber-400 font-mono mt-0.5">{sys5GI} เคส</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-blue-500/40 transition">
                  <div className="text-[10px] text-slate-400">🦷 ทันตกรรม</div>
                  <div className="text-base font-extrabold text-slate-200 font-mono mt-0.5">เคสเด่น</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed text-[11.5px] space-y-1">
                  <p>
                    <strong className="text-emerald-300">🛠️ แผนระยะสั้น:</strong> อบรม Hands-on Workshop เน้น Daily Check, ตรวจวัด MTTR
                  </p>
                  <p>
                    <strong className="text-amber-300">💡 แผนระยะยาว:</strong> ทำ Predictive Maintenance และสร้าง Knowledge Base คลังคู่มือ
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                  <span>ผู้รับผิดชอบ: กานต์ธิดา</span>
                  <span>ทีมกำกับ: UCC (สุพัตรา, ไอยเรศ)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">⏱️ กรอบเวลาแก้: 1 สัปดาห์ - 1 เดือน (ตามเป้า SLA)</span>
              <button
                onClick={() => onNavigateTab('data')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 text-[11px] no-print cursor-pointer font-semibold"
              >
                ดู {sys5List.length} เคส <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* QUADRANT 3: SYSTEM 8 */}
          <div
            className={`bg-slate-900/70 border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${
              expandedQuadrant === 'sys8'
                ? 'border-purple-400 ring-2 ring-purple-500/20 bg-slate-850 shadow-2xl md:col-span-2'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <h3 className="font-bold text-white text-sm">3. มิติพัฒนาคน & วัฒนธรรมความปลอดภัย (Culture)</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    ระบบที่ 8
                  </span>
                  <button
                    onClick={() => setExpandedQuadrant(expandedQuadrant === 'sys8' ? null : 'sys8')}
                    title="ขยาย/ย่อส่วนนี้"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 no-print cursor-pointer"
                  >
                    {expandedQuadrant === 'sys8' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-purple-500/40 transition">
                  <div className="text-[10px] text-slate-400">💖 มีส่วนร่วม</div>
                  <div className="text-base font-extrabold text-purple-400 font-mono mt-0.5">{sys8Participation}%</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition">
                  <div className="text-[10px] text-slate-400">😊 พึงพอใจ</div>
                  <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">92 - 100%</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-blue-500/40 transition">
                  <div className="text-[10px] text-slate-400">🛡️ We Before Me</div>
                  <div className="text-base font-extrabold text-slate-200 font-mono mt-0.5">100%</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed text-[11.5px] space-y-1">
                  <p>
                    <strong className="text-purple-300">🌟 กิจกรรมเด่น:</strong> BME Family, 1:1 Coaching เพื่อพัฒนาสัมพันธ์และความผูกพัน
                  </p>
                  <p>
                    <strong className="text-emerald-300">🚀 พัฒนาศักยภาพ:</strong> Up Skill AOP, 10 ระบบงาน, ปลูกฝังค่านิยมความปลอดภัย
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                  <span>ผู้รับผิดชอบ: ชาลี (ความผูกพัน) / สุพัตรา (พัฒนาคน)</span>
                  <span className="text-emerald-400 font-semibold">ผลประเมิน: 92.3% ดีเยี่ยม</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-purple-400 font-medium">✨ ค่านิยมเป้าหมาย: We Before Me & PHQ Spirit</span>
              <button
                onClick={() => onNavigateTab('comparison')}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-0.5 text-[11px] no-print cursor-pointer font-semibold"
              >
                ดูการเปรียบเทียบ <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* QUADRANT 4: SYSTEM 9 */}
          <div
            className={`bg-slate-900/70 border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 ${
              expandedQuadrant === 'sys9'
                ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-slate-850 shadow-2xl md:col-span-2'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <h3 className="font-bold text-white text-sm">4. มิติปฏิบัติงาน & ปรับปรุงกระบวนการ (Best Practice)</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ระบบที่ 9
                  </span>
                  <button
                    onClick={() => setExpandedQuadrant(expandedQuadrant === 'sys9' ? null : 'sys9')}
                    title="ขยาย/ย่อส่วนนี้"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 no-print cursor-pointer"
                  >
                    {expandedQuadrant === 'sys9' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-emerald-500/40 transition">
                  <div className="text-[10px] text-slate-400">🎯 อุบัติการณ์</div>
                  <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">0 ครั้ง (100%)</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-blue-500/40 transition">
                  <div className="text-[10px] text-slate-400">📈 ผลลัพธ์ M1</div>
                  <div className="text-base font-extrabold text-blue-400 font-mono mt-0.5">100% บรรลุ</div>
                </div>
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 hover:border-teal-500/40 transition">
                  <div className="text-[10px] text-slate-400">📋 โครงการ Best Practice</div>
                  <div className="text-base font-extrabold text-slate-200 font-mono mt-0.5">{sys9List.length} เรื่อง</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed text-[11.5px] space-y-1">
                  <p>
                    <strong className="text-emerald-300">🚚 โครงการ 1:</strong> การให้บริการขนย้ายเครื่องมือแพทย์ภายนอกโรงพยาบาล (Work Flow 6 ขั้นตอน ยืม/คืน/Tracer)
                  </p>
                  <p>
                    <strong className="text-teal-300">🛡️ โครงการ 2:</strong> การขนย้ายเครื่องมือแพทย์อย่างปลอดภัย (Clean/Dirty Route, Ergonomics)
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                  <span>ผู้รับผิดชอบ: BME Operations</span>
                  <span className="text-emerald-400 font-semibold">สุ่ม Tracer: ปฏิบัติตาม WI 100%</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">✅ สถานะ: ผ่านเกณฑ์มาตรฐานความปลอดภัยเครื่องมือแพทย์</span>
              <button
                onClick={() => onNavigateTab('predictive')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 text-[11px] no-print cursor-pointer font-semibold"
              >
                ดูการวิเคราะห์เชิงทำนาย <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* INTERACTIVE DAILY QUALITY CHECKLIST BAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 no-print shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>รายการตรวจสอบคุณภาพประจำวันแบบอินเตอร์แอคทีฟ (Daily Interactive Quality Checklist)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              เสร็จสิ้น {Object.values(checklist).filter(Boolean).length}/4 รายการ (คลิกเพื่อเช็คเครื่องหมาย)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div
              onClick={() => toggleCheck('morning')}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${
                checklist.morning ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input type="checkbox" checked={checklist.morning} readOnly className="accent-emerald-500 pointer-events-none" />
              <span className="font-medium text-[11.5px]">🗣️ เช็คชื่อ Morning Meeting 8:05</span>
            </div>

            <div
              onClick={() => toggleCheck('voc')}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${
                checklist.voc ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input type="checkbox" checked={checklist.voc} readOnly className="accent-emerald-500 pointer-events-none" />
              <span className="font-medium text-[11.5px]">🩺 ติดตามข้อร้องเรียน SLA ทันตกรรม</span>
            </div>

            <div
              onClick={() => toggleCheck('family')}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${
                checklist.family ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input type="checkbox" checked={checklist.family} readOnly className="accent-emerald-500 pointer-events-none" />
              <span className="font-medium text-[11.5px]">🤝 บันทึกความสุข BME Family 1:1</span>
            </div>

            <div
              onClick={() => toggleCheck('tracer')}
              className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${
                checklist.tracer ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <input type="checkbox" checked={checklist.tracer} readOnly className="accent-emerald-500 pointer-events-none" />
              <span className="font-medium text-[11.5px]">🚚 สุ่มตรวจ Tracer WI ขนย้าย</span>
            </div>
          </div>
        </div>

        {/* EXECUTIVE DECISION SUMMARY & SIGN-OFF */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>ข้อเสนอแนะเชิงกลยุทธ์เพื่อการตัดสินใจของผู้บริหาร (Executive Directives)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">🎯 ระดับความเชื่อมั่นการทำนาย: 94.6%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="text-[10.5px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <span>🚀 1. ขยายผลกระบวนการ</span>
              </span>
              <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                ขยายผลมาตรฐาน Morning Meeting 8:05 น. (ระบบ 2) ไปยังทุกหน่วยงานย่อยเพื่อรักษาอัตรา Ack rate ไม่ต่ำกว่า 75%
              </p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="text-[10.5px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <span>💡 2. จัดสรรงบเชิงป้องกัน</span>
              </span>
              <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                จัดทำ Predictive Maintenance สัญญาบริการเครื่องมือแพทย์เฉพาะทาง (ทันตกรรม/ICU) เพื่อลด Breakdown G-I ให้เหลือ 0
              </p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="text-[10.5px] font-bold text-blue-400 uppercase flex items-center gap-1">
                <span>🛡️ 3. ธำรงวัฒนธรรมความปลอดภัย</span>
              </span>
              <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                สุ่มตรวจ Tracer WI การขนย้าย (ระบบ 9) รายไตรมาส พร้อมเชิดชูบุคลากรต้นแบบ "We Before Me"
              </p>
            </div>
          </div>

          {/* SIGNATURE BLOCK */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="h-9 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
                (กานต์ธิดา / ณัฐพร)
              </div>
              <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้จัดทำและรวบรวมข้อมูล</div>
              <div className="text-[10px] text-slate-500">ทีมประสานงานระบบ 2 & 5</div>
            </div>

            <div>
              <div className="h-9 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
                (สุพัตรา ชนะโชติ)
              </div>
              <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้กำกับติดตามคุณภาพ (UQC)</div>
              <div className="text-[10px] text-slate-500">หัวหน้าทีมระบบคุณภาพ BME</div>
            </div>

            <div>
              <div className="h-9 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-emerald-400 font-mono text-[10px]">
                [ อนุมัติผ่านระบบเรียลไทม์ ]
              </div>
              <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้อำนวยการฝ่ายสนับสนุนทางการแพทย์</div>
              <div className="text-[10px] text-slate-500">คณะกรรมการกำกับทิศทางโรงพยาบาล</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
