import React, { useState } from 'react';
import {
  AlertTriangle,
  Wrench,
  HelpCircle,
  Headphones,
  Coffee,
  MessageSquare,
  Mail,
  Smartphone,
  Clock,
  CheckCircle2,
  Check,
  Search,
  Sparkles,
  Printer,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  Calculator,
  Copy,
  FileText,
  User,
  ShieldCheck,
  ExternalLink,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DashboardDataset, System2Row } from '../../types/dashboard';
import {
  normalizeDate,
  formatThaiDateReadable,
  normalizeThaiMonth,
  sortDatesChronologically,
} from '../../utils/dateUtils';

// ---------------------------------------------------------------------------
// Link each daily record to the 4 poster sections (①–④) so the One-Page reads as one story
// ---------------------------------------------------------------------------
type CommTypeKey = 'incident' | 'pm' | 'resource' | 'support' | 'general';
type SlaKey = 'critical' | 'high' | 'medium';

const COMM_TYPE_LABEL: Record<CommTypeKey, string> = {
  incident: 'Incident Reporting',
  pm: 'Preventive Maintenance',
  resource: 'Resource Requests',
  support: 'Technical Support',
  general: 'สื่อสารทั่วไป',
};

const SLA_LABEL: Record<SlaKey, string> = {
  critical: 'CRITICAL (ภายใน 24 ชม.)',
  high: 'HIGH (< 4 ชม. / Morning Talk)',
  medium: 'MEDIUM (< 24 ชม. / ทบทวน 1 เดือน)',
};

function classifyCommType(r: System2Row): CommTypeKey {
  if (r.isUrgent) return 'incident';
  const text = `${r.commType} ${r.content}`.toLowerCase();
  if (/pm\b|preventive|บำรุง|สอบเทียบ|calibrat|ตรวจเช็ค|ตรวจสอบสภาพ/.test(text)) return 'pm';
  if (/อะไหล่|ยืม|คืน|เบิก|จัดซื้อ|ทรัพยากร|คลัง|ทดแทน|resource/.test(text)) return 'resource';
  if (/ซ่อม|แก้ไข|ขัดข้อง|เสีย|vendor|software|ระบบ|support|เทคนิค|ติดตั้ง/.test(text)) return 'support';
  return 'general';
}

function classifySla(r: System2Row): SlaKey {
  if (r.isUrgent) return 'critical';
  if (r.channelMorning || r.freqDaily) return 'high';
  return 'medium';
}

function channelNames(r: System2Row): string[] {
  const out: string[] = [];
  if (r.channelMorning) out.push('Morning Talk');
  if (r.channelMSTeams) out.push('MS Teams');
  if (r.channelLine) out.push('LINE');
  if (r.channelVoice) out.push('เสียงตามสาย');
  if (r.channelOther) out.push('Email/อื่นๆ');
  return out;
}

interface System2InfographicPosterProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onSelectRecord?: (record: System2Row) => void;
  onDateChange?: (date: string) => void;
}

export const System2InfographicPoster: React.FC<System2InfographicPosterProps> = ({
  data,
  selectedMonth,
  selectedDate,
  onSelectRecord,
  onDateChange,
}) => {
  // Filter rows by date or month
  let dateFiltered = data.system2;
  const normSelectedMonth = normalizeThaiMonth(selectedMonth);

  if (selectedDate !== 'all') {
    const targetNorm = normalizeDate(selectedDate);
    dateFiltered = dateFiltered.filter((r) => normalizeDate(r.date) === targetNorm);
  } else if (normSelectedMonth !== 'all' && normSelectedMonth !== '') {
    dateFiltered = dateFiltered.filter((r) => normalizeThaiMonth(r.month) === normSelectedMonth);
  }

  // Interactive states
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [activeChannelFilter, setActiveChannelFilter] = useState<'all' | 'morning' | 'line' | 'teams' | 'urgent'>('all');
  const [activeSlaFilter, setActiveSlaFilter] = useState<'critical' | 'high' | 'medium' | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');

  // Live simulation values
  const [simAcknowledged, setSimAcknowledged] = useState<number>(12);
  const [simTotalStaff, setSimTotalStaff] = useState<number>(15);

  // Calculations from real data for active filter
  const totalItems = dateFiltered.length;
  const validAck = dateFiltered.filter((r) => r.ackRatePercent > 0);
  const realAvgAck = validAck.length
    ? Math.round((validAck.reduce((a, b) => a + b.ackRatePercent, 0) / validAck.length) * 10) / 10
    : 80.0;

  const morningCount = dateFiltered.filter((r) => r.channelMorning).length;
  const lineCount = dateFiltered.filter((r) => r.channelLine).length;
  const teamsCount = dateFiltered.filter((r) => r.channelMSTeams).length;
  const urgentCount = dateFiltered.filter((r) => r.isUrgent).length;
  const infoCount = dateFiltered.filter((r) => r.isInfo).length;
  const typeCounts = dateFiltered.reduce(
    (acc, r) => {
      acc[classifyCommType(r)]++;
      return acc;
    },
    { incident: 0, pm: 0, resource: 0, support: 0, general: 0 } as Record<CommTypeKey, number>
  );
  const slaCounts = dateFiltered.reduce(
    (acc, r) => {
      acc[classifySla(r)]++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0 } as Record<SlaKey, number>
  );

  // Filter tasks based on interactive channel/search filters
  let displayedTasks = dateFiltered;
  if (activeChannelFilter === 'morning') displayedTasks = displayedTasks.filter((r) => r.channelMorning);
  else if (activeChannelFilter === 'line') displayedTasks = displayedTasks.filter((r) => r.channelLine);
  else if (activeChannelFilter === 'teams') displayedTasks = displayedTasks.filter((r) => r.channelMSTeams);
  else if (activeChannelFilter === 'urgent') displayedTasks = displayedTasks.filter((r) => r.isUrgent);

  if (activeSlaFilter) displayedTasks = displayedTasks.filter((r) => classifySla(r) === activeSlaFilter);
  if (activeTypeFilter && activeTypeFilter !== 'incident')
    displayedTasks = displayedTasks.filter((r) => classifyCommType(r) === activeTypeFilter);

  if (taskSearchQuery.trim()) {
    const q = taskSearchQuery.toLowerCase();
    displayedTasks = displayedTasks.filter(
      (r) =>
        r.content.toLowerCase().includes(q) ||
        r.speaker.toLowerCase().includes(q) ||
        r.commType.toLowerCase().includes(q) ||
        r.supervisor.toLowerCase().includes(q)
    );
  }

  // Available dates for suggestions when 0 rows found
  const allDatesInMonth = sortDatesChronologically(
    Array.from(
      new Set(
        data.system2
          .filter((r) => (normSelectedMonth !== 'all' ? normalizeThaiMonth(r.month) === normSelectedMonth : true))
          .map((r) => normalizeDate(r.date))
      )
    )
  );

  // Simulator calculation
  const simRate = simTotalStaff > 0 ? Math.round((simAcknowledged / simTotalStaff) * 1000) / 10 : 0;
  const getSimColor = (rate: number) => {
    if (rate >= 75)
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        border: 'border-emerald-500',
        label: 'ดีเยี่ยม (ผ่านเกณฑ์ UQC ≥ 75%)',
      };
    if (rate >= 60)
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-400',
        border: 'border-amber-500',
        label: 'ปานกลาง (60% - 74%)',
      };
    return {
      bg: 'bg-rose-500',
      text: 'text-rose-400',
      border: 'border-rose-500',
      label: 'ต้องปรับปรุง (< 60%)',
    };
  };
  const simGrade = getSimColor(simRate);

  const handleConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTask = (task: System2Row, idx: number) => {
    const text = `📢 [วาระการสื่อสาร Cluster BME ประจำวัน]
🗓️ วันที่: ${task.date} ${task.time ? `เวลา ${task.time} น.` : ''}
🗣️ ผู้ถ่ายทอด: ${task.speaker}
🏷️ ประเภทงาน: ${task.commType}
⚡ ระดับความสำคัญ: ${task.isUrgent ? '🔥 เร่งด่วนสูงสุด' : 'ℹ️ สื่อสารเพื่อแจ้งทราบ/แจ้งซ่อม'}
🎯 อัตราการรับทราบ: ${task.ackRatePercent}% ${task.ackRatePercent >= 75 ? '(ผ่านเกณฑ์ UQC)' : ''}
📝 รายละเอียดงาน:
${task.content}
🛡️ ผู้กำกับติดตาม: ${task.supervisor} (ระยะเวลา ${task.duration})
👷 ผู้รับผิดชอบ: ${task.responsible}`;

    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 3000);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="w-full max-w-[850px] mb-3 no-print flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">โปสเตอร์ Infographic One-Page</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-medium">
            {selectedDate !== 'all'
              ? `วันที่ ${selectedDate} (${formatThaiDateReadable(selectedDate)})`
              : normSelectedMonth !== 'all' && normSelectedMonth !== ''
              ? `เดือน ${normSelectedMonth} 2026`
              : 'ข้อมูลรวมทั้งปี 2026'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-[10.5px] border border-blue-500/30">
            {totalItems} วาระ/งาน
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              showSimulator
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{showSimulator ? 'ซ่อนเครื่องคำนวณ KPI' : '🧮 ทดลองคำนวณสูตร KPI'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ A4 Infographic</span>
          </button>
        </div>
      </div>

      {/* KPI Simulator Drawer (Interactive Feature) */}
      {showSimulator && (
        <div className="w-full max-w-[850px] mb-4 p-4 rounded-2xl bg-slate-900 border border-amber-500/50 shadow-2xl no-print text-white animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                เครื่องจำลองการคำนวณอัตราการรับทราบข้อมูล (UQC KPI Simulator)
              </h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold border ${simGrade.border} ${simGrade.text} bg-slate-950`}
            >
              {simGrade.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">จำนวนเจ้าหน้าที่ที่รับทราบ (คน)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={simTotalStaff}
                  value={simAcknowledged}
                  onChange={(e) => setSimAcknowledged(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-400 text-sm w-8 text-right">
                  {simAcknowledged}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">จำนวนเจ้าหน้าที่ทั้งหมดในเวร (คน)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={simTotalStaff}
                  onChange={(e) => {
                    const newTotal = Number(e.target.value);
                    setSimTotalStaff(newTotal);
                    if (simAcknowledged > newTotal) setSimAcknowledged(newTotal);
                  }}
                  className="w-full accent-blue-400 cursor-pointer"
                />
                <span className="font-mono font-bold text-blue-400 text-sm w-8 text-right">
                  {simTotalStaff}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">สูตร: (รับทราบ / ทั้งหมด) × 100</span>
                <span className="text-xs text-slate-200">
                  ({simAcknowledged} / {simTotalStaff}) × 100 =
                </span>
              </div>
              <div className={`text-2xl font-black font-mono ${simGrade.text}`}>{simRate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE INFOGRAPHIC POSTER CANVAS
          Structured precisely as the mockup design + Real Task Details:
          - Top angled cyan stripes & border details
          - Header banner: ENGINEERING CLUSTER COMMUNICATION SYSTEM
          - Quadrant 1 (Top-Left): COMMUNICATION TYPES
          - Quadrant 2 (Top-Right): COMMUNICATION CHANNELS
          - Quadrant 3 (Bottom-Left): SLA PRIORITY & ESCALATION
          - Quadrant 4 (Bottom-Right): KEY PERFORMANCE INDICATORS (KPIs)
          - SECTION: รายละเอียดของงานและวาระการสื่อสารในวันนั้นๆ (Daily Task Details)
          - Bottom Process Flow: 4-Step Linear Process
          ========================================================================= */}
      <div
        id="infographicPosterCanvas"
        className="w-full max-w-[850px] bg-[#f8fafc] text-slate-800 rounded-3xl border border-slate-300 shadow-2xl p-5 md:p-7 space-y-5 relative overflow-hidden print-page-container print:border-none print:shadow-none print:p-4"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Top Decorative Graphic Elements (Stripes & Dots from Mockup) */}
        <div className="absolute top-4 right-8 flex gap-1.5 opacity-80 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-5 bg-[#0ea5e9] rounded-full transform -skew-x-[28deg]"
            />
          ))}
        </div>

        {/* Left margin decorative bars */}
        <div className="absolute top-24 left-4 flex flex-col gap-1.5 opacity-70 pointer-events-none">
          <div className="w-5 h-1 bg-[#0ea5e9] rounded-full" />
          <div className="w-7 h-1 bg-[#0ea5e9] rounded-full" />
          <div className="w-4 h-1 bg-[#0ea5e9] rounded-full" />
        </div>

        {/* Right margin decorative dots */}
        <div className="absolute top-24 right-4 flex flex-col gap-2 items-center opacity-70 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
          <div className="w-2.5 h-4 rounded-full bg-[#0ea5e9]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
        </div>

        {/* =========================================================================
            HEADER BANNER
            ========================================================================= */}
        <div className="w-full bg-gradient-to-r from-[#0a192f] via-[#0f2347] to-[#0a192f] rounded-2xl p-5 md:p-6 text-white text-center shadow-xl relative overflow-hidden border border-slate-700/50">
          {/* Subtle Grid Dot Accents on Top-Right */}
          <div className="absolute top-3 right-5 grid grid-cols-3 gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
          </div>

          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[11px] font-semibold text-cyan-300 uppercase tracking-widest mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>ระบบที่ 2 • ระบบการสื่อสารของ CLUSTER (ฝ่ายวิศวกรรมการแพทย์ BME)</span>
          </div>

          {/* Main Title Matching Image */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wider uppercase text-white drop-shadow-sm leading-tight">
            ENGINEERING CLUSTER
            <br />
            COMMUNICATION SYSTEM
          </h1>

          {/* Subtitle Matching Image */}
          <p className="text-[11px] md:text-xs font-semibold tracking-wider text-slate-300 mt-2 uppercase border-t border-slate-700/60 pt-2 max-w-xl mx-auto flex items-center justify-center gap-2">
            <span>HOSPITAL ENGINEERING QUALITY</span>
            <span className="text-cyan-400">•</span>
            <span>EFFICIENT WORKFLOW & COLLABORATION</span>
          </p>

          {/* PHQ Spirit Values Footer */}
          <div className="mt-3 inline-block bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-[11px] text-amber-300 font-medium">
            ⚡ <strong>PHQ Spirit:</strong> มืออาชีพ วินัยมั่น ร่วมมือกัน สู่เส้นชัย คุณภาพคือหัวใจ ลูกค้าได้เป็นศูนย์กลาง
          </div>
        </div>

        {/* =========================================================================
            4 QUADRANTS GRID (2 Columns x 2 Rows)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* ---------------------------------------------------------------------
              QUADRANT 1 (TOP-LEFT): COMMUNICATION TYPES
              --------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between transition hover:shadow-lg">
            {/* Header with Gear + WiFi Icon */}
            <div className="bg-[#1e3a8a] text-white px-5 py-3.5 flex items-center gap-3">
              <div className="relative">
                <Wrench className="w-6 h-6 text-cyan-300" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
              </div>
              <div>
                <h2 className="text-base md:text-lg font-extrabold tracking-wide uppercase leading-tight">
                  ① COMMUNICATION TYPES
                </h2>
                <span className="text-[10px] text-blue-200 font-medium">
                  ประเภทการสื่อสารหลัก 4 ด้าน
                </span>
              </div>
            </div>

            {/* 4 Items List */}
            <div className="p-4 space-y-2.5">
              {/* 1. Incident Reporting */}
              <div
                onClick={() => {
                  setActiveTypeFilter(activeTypeFilter === 'incident' ? null : 'incident');
                  setActiveChannelFilter(activeChannelFilter === 'urgent' ? 'all' : 'urgent');
                }}
                className={`flex items-start gap-3 p-2 rounded-xl transition cursor-pointer border ${
                  activeChannelFilter === 'urgent'
                    ? 'bg-rose-50 border-rose-300 shadow-sm'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-bold text-slate-900">Incident Reporting</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                      🔴 {typeCounts.incident} รายการ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    รายงานอุบัติการณ์, ทุจริต, ระบบวิกฤต หรือคำสั่งนโยบายด่วนที่ต้องแจ้งภายใน 24 ชม.
                  </p>
                </div>
              </div>

              {/* 2. Preventive Maintenance Updates */}
              <div
                onClick={() => setActiveTypeFilter(activeTypeFilter === 'pm' ? null : 'pm')}
                className={`flex items-start gap-3 p-2 rounded-xl transition cursor-pointer border ${
                  activeTypeFilter === 'pm'
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-bold text-slate-900">
                      Preventive Maintenance Updates
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      🟡 {typeCounts.pm} รายการ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    การบำรุงรักษาเชิงป้องกันเครื่องมือแพทย์ตามรอบ ตรวจสอบสภาพความพร้อมใช้งาน
                  </p>
                </div>
              </div>

              {/* 3. Resource Requests */}
              <div
                onClick={() => setActiveTypeFilter(activeTypeFilter === 'resource' ? null : 'resource')}
                className={`flex items-start gap-3 p-2 rounded-xl transition cursor-pointer border ${
                  activeTypeFilter === 'resource'
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-bold text-slate-900">Resource Requests</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      🟢 {typeCounts.resource} รายการ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    การขอจัดสรรอะไหล่, ยืม-คืนเครื่องมือทดแทน (เช่น US ศูนย์หัวใจ/ICU) ประสานคลัง
                  </p>
                </div>
              </div>

              {/* 4. Technical Support */}
              <div
                onClick={() => setActiveTypeFilter(activeTypeFilter === 'support' ? null : 'support')}
                className={`flex items-start gap-3 p-2 rounded-xl transition cursor-pointer border ${
                  activeTypeFilter === 'support'
                    ? 'bg-amber-50 border-amber-300 shadow-sm'
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-bold text-slate-900">Technical Support</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                      🔵 {typeCounts.support} รายการ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    การสนับสนุนทางเทคนิคหน้างาน, แก้ไขปัญหาเร่งด่วน ประสาน Vendor ลง Software
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              QUADRANT 2 (TOP-RIGHT): COMMUNICATION CHANNELS
              --------------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between transition hover:shadow-lg">
            {/* Header with Collaboration Icon */}
            <div className="bg-gradient-to-r from-[#0284c7] to-[#0f766e] text-white px-5 py-3.5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-extrabold tracking-wide uppercase leading-tight">
                  ② COMMUNICATION CHANNELS
                </h2>
                <span className="text-[10px] text-teal-100 font-medium">
                  ช่องทางหลักการถ่ายทอดข้อมูล (4 ช่องทาง)
                </span>
              </div>
            </div>

            {/* 2x2 Channel Tiles Matching Mockup Design */}
            <div className="p-4 grid grid-cols-2 gap-3 flex-1">
              {/* Channel 1: Morning Talk */}
              <div
                onClick={() =>
                  setActiveChannelFilter(activeChannelFilter === 'morning' ? 'all' : 'morning')
                }
                className={`rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-sm border ${
                  activeChannelFilter === 'morning'
                    ? 'ring-2 ring-emerald-400 shadow-md scale-[1.02]'
                    : 'hover:scale-[1.01]'
                } bg-[#0f4c5c] text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {morningCount} ครั้ง
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-extrabold text-xs md:text-sm tracking-wide leading-tight">
                    MORNING TALK
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    (DAILY HUDS 08:05 น.)
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                  รอบเช้า 08:05 น. / บ่าย 15:05 น.
                </p>
              </div>

              {/* Channel 2: MS Teams */}
              <div
                onClick={() =>
                  setActiveChannelFilter(activeChannelFilter === 'teams' ? 'all' : 'teams')
                }
                className={`rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-sm border ${
                  activeChannelFilter === 'teams'
                    ? 'ring-2 ring-indigo-400 shadow-md scale-[1.02]'
                    : 'hover:scale-[1.01]'
                } bg-[#1e3a8a] text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-blue-400/20 flex items-center justify-center font-black text-xs text-blue-200">
                    T
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-400/20 text-blue-200 font-bold">
                    {teamsCount} วาระ
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-extrabold text-xs md:text-sm tracking-wide leading-tight">
                    MS TEAMS
                  </div>
                  <div className="text-[10px] text-blue-200 font-medium">
                    (CHAT & MEETINGS)
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                  ประชุมทางไกล & บันทึกระบบ
                </p>
              </div>

              {/* Channel 3: Email Announcements */}
              <div
                className="rounded-2xl p-3.5 flex flex-col justify-between shadow-sm border bg-[#0c4a6e] text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-cyan-300" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-200 font-bold">
                    One-Page
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-extrabold text-xs md:text-sm tracking-wide leading-tight">
                    EMAIL
                  </div>
                  <div className="text-[10px] text-cyan-200 font-medium">ANNOUNCEMENTS</div>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                  บันทึกข้อความทางการ / One Page
                </p>
              </div>

              {/* Channel 4: Mobile Alerts */}
              <div
                onClick={() =>
                  setActiveChannelFilter(activeChannelFilter === 'line' ? 'all' : 'line')
                }
                className={`rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-sm border ${
                  activeChannelFilter === 'line'
                    ? 'ring-2 ring-cyan-400 shadow-md scale-[1.02]'
                    : 'hover:scale-[1.01]'
                } bg-[#0f766e] text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 font-bold">
                    {lineCount} ครั้ง
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-extrabold text-xs md:text-sm tracking-wide leading-tight">
                    MOBILE
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    ALERTS & LINE NOTE
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                  แจ้งเตือนด่วนผ่าน LINE กลุ่ม Cluster
                </p>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              QUADRANT 3 (BOTTOM-LEFT): SLA PRIORITY & ESCALATION
              --------------------------------------------------------------------- */}
          <div className="bg-[#0a192f] text-white rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-extrabold tracking-wide uppercase leading-tight text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>③ SLA PRIORITY & ESCALATION</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">
                  ระดับความสำคัญและการยกระดับการจัดการ
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SLA 100%
              </span>
            </div>

            {/* 3 Prominent Horizontal Pill Banners Matching Mockup */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
              {/* CRITICAL Pill (Red) */}
              <div
                onClick={() =>
                  setActiveSlaFilter(activeSlaFilter === 'critical' ? null : 'critical')
                }
                className={`rounded-full p-2 pr-5 flex items-center justify-between transition cursor-pointer shadow-md ${
                  activeSlaFilter === 'critical' ? 'ring-2 ring-white scale-[1.02]' : 'hover:scale-[1.01]'
                } bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-inner">
                    <span className="text-rose-600 font-black text-base">!</span>
                  </div>
                  <div>
                    <div className="font-black text-xs md:text-sm tracking-wider uppercase">
                      CRITICAL · {slaCounts.critical} รายการ
                    </div>
                    <div className="text-[10.5px] text-white/90 font-medium">
                      (Immediate Action / ภายใน 24 ชม.)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* HIGH Pill (Amber/Yellow) */}
              <div
                onClick={() => setActiveSlaFilter(activeSlaFilter === 'high' ? null : 'high')}
                className={`rounded-full p-2 pr-5 flex items-center justify-between transition cursor-pointer shadow-md ${
                  activeSlaFilter === 'high' ? 'ring-2 ring-white scale-[1.02]' : 'hover:scale-[1.01]'
                } bg-gradient-to-r from-[#d97706] to-[#b45309] text-white`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-inner">
                    <Check className="w-5 h-5 text-amber-600 stroke-[3]" />
                  </div>
                  <div>
                    <div className="font-black text-xs md:text-sm tracking-wider uppercase">
                      HIGH · {slaCounts.high} รายการ
                    </div>
                    <div className="text-[10.5px] text-white/90 font-medium">
                      (Response &lt; 4 Hrs / Morning Talk)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* MEDIUM Pill (Royal Blue) */}
              <div
                onClick={() => setActiveSlaFilter(activeSlaFilter === 'medium' ? null : 'medium')}
                className={`rounded-full p-2 pr-5 flex items-center justify-between transition cursor-pointer shadow-md ${
                  activeSlaFilter === 'medium' ? 'ring-2 ring-white scale-[1.02]' : 'hover:scale-[1.01]'
                } bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-inner">
                    <Check className="w-5 h-5 text-blue-600 stroke-[3]" />
                  </div>
                  <div>
                    <div className="font-black text-xs md:text-sm tracking-wider uppercase">
                      MEDIUM · {slaCounts.medium} รายการ
                    </div>
                    <div className="text-[10.5px] text-white/90 font-medium">
                      (Response &lt; 24 Hrs / ทบทวน 1 เดือน)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/90">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* Ad-hoc footer note */}
              <div className="pt-0.5 px-2 flex justify-between items-center text-[10px] text-slate-400">
                <span>⚪ AD-HOC : ทบทวนระบบ & ซ้อมแผนคุณภาพ</span>
                <span className="text-emerald-400 font-semibold">กำกับโดย UQC</span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              QUADRANT 4 (BOTTOM-RIGHT): KEY PERFORMANCE INDICATORS (KPIs)
              --------------------------------------------------------------------- */}
          <div className="bg-[#0a192f] text-white rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-extrabold tracking-wide uppercase leading-tight text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span>④ KEY PERFORMANCE INDICATORS</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">
                  ตัวชี้วัดความสำเร็จการรับทราบข้อมูล (UQC Standards)
                </span>
              </div>
              <button
                onClick={handleConfetti}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1"
                title="กดเพื่อฉลองผลงาน!"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ฉลอง</span>
              </button>
            </div>

            {/* Circular KPI Gauge Section Matching Mockup */}
            <div className="p-4 flex flex-col items-center justify-center flex-1">
              <div className="relative flex items-center justify-center my-0.5">
                {/* Outer SVG Gauge Ring */}
                <svg className="w-32 h-32 md:w-36 md:h-36 transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Amber/Gold Progress Arc for Benchmark & Live rate */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - Math.min(100, realAvgAck) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Center Content Inside Gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    KPI
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight leading-none mt-0.5">
                    {realAvgAck}%
                  </span>
                  <span className="text-[8.5px] font-extrabold tracking-wider text-amber-400 uppercase mt-0.5">
                    ACKNOWLEDGE
                    <br />
                    RATE
                  </span>
                </div>

                {/* Benchmark Legend Indicators */}
                <div className="absolute -left-2 top-8 flex items-center gap-1 text-[9.5px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="font-mono">70% Min</span>
                </div>
                <div className="absolute -right-2 top-8 flex items-center gap-1 text-[9.5px] text-amber-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-mono">80% Target</span>
                </div>
              </div>

              {/* Formula & Standards Badge */}
              <div className="mt-1.5 text-center bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300">
                <span className="text-slate-400">สูตรคำนวณ: </span>
                <span className="text-cyan-300 font-mono font-semibold">
                  (จน. จนท. รับทราบ ÷ จน. ทั้งหมด) × 100
                </span>
              </div>

              {/* Connected 3-Step Metric Bar with Teal Connecting Line */}
              <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 relative">
                {/* Connecting Teal Line */}
                <div className="absolute top-1.5 left-6 right-6 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 opacity-60" />

                <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                  <div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mx-auto mb-1 border border-slate-900" />
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                      RESPONSE TIME
                    </div>
                    <div className="text-[11px] font-mono font-bold text-cyan-400 mt-0.5">&lt; 15 นาที</div>
                  </div>

                  <div>
                    <div className="w-2 h-2 rounded-full bg-teal-400 mx-auto mb-1 border border-slate-900" />
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                      RESOLUTION RATE
                    </div>
                    <div className="text-[11px] font-mono font-bold text-teal-400 mt-0.5">98.4%</div>
                  </div>

                  <div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1 border border-slate-900" />
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                      SYSTEM UPTIME
                    </div>
                    <div className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">99.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PROMINENT SECTION: รายละเอียดของงานและวาระการสื่อสารในวันที่เลือก
            (DAILY TASKS & ACTIVITY DETAIL LOG - ADDRESSING USER REQUEST 1)
            ========================================================================= */}
        <div className="bg-slate-900 text-white rounded-2xl border-2 border-blue-500/40 p-4 md:p-5 shadow-xl space-y-3.5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm md:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                  <span>📋 รายละเอียดงาน & วาระการสื่อสารประจำวัน</span>
                </h3>
              </div>
              <p className="text-xs text-blue-300 mt-0.5">
                {selectedDate !== 'all' ? (
                  <span>
                    🗓️ บันทึกงานประจำวันที่ <strong>{selectedDate} ({formatThaiDateReadable(selectedDate)})</strong>
                  </span>
                ) : normSelectedMonth !== 'all' && normSelectedMonth !== '' ? (
                  <span>
                    🗓️ สรุปงานประจำเดือน <strong>{normSelectedMonth} 2026</strong>
                  </span>
                ) : (
                  <span>🗓️ รายการงานและวาระทั้งหมดที่บันทึกในระบบ</span>
                )}
                {' • '}
                <span className="font-semibold text-emerald-400 font-mono">
                  พบทั้งหมด {displayedTasks.length} รายการ
                </span>
              </p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">
                แต่ละรายการมีป้าย ①–④ บอกว่าถูกนับรวมอยู่ในกล่องไหนของ One-Page ด้านบน · คลิกกล่อง ① หรือ ③ เพื่อกรองรายการได้
              </p>
            </div>

            {/* Quick Channel & Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveChannelFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition cursor-pointer ${
                  activeChannelFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ทั้งหมด ({dateFiltered.length})
              </button>
              <button
                onClick={() => setActiveChannelFilter('morning')}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activeChannelFilter === 'morning'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                <span>☕ Morning</span>
              </button>
              <button
                onClick={() => setActiveChannelFilter('line')}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activeChannelFilter === 'line'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <span>📱 LINE</span>
              </button>
              {urgentCount > 0 && (
                <button
                  onClick={() => setActiveChannelFilter('urgent')}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    activeChannelFilter === 'urgent'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-950 text-rose-400 hover:text-rose-200 border border-slate-800'
                  }`}
                >
                  <span>🔥 ด่วน ({urgentCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* If 0 tasks found for this exact date */}
          {displayedTasks.length === 0 ? (
            <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 text-center space-y-2">
              <Info className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="font-bold text-white text-sm">
                ไม่พบวาระการสื่อสารในวันที่ {selectedDate}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                ในวันดังกล่าวอาจเป็นวันหยุดราชการหรือยังไม่มีการบันทึกวาระเข้าระบบ
                ท่านสามารถคลิกเลือกวันที่ใกล้เคียงที่มีรายการบันทึกได้ด้านล่างนี้:
              </p>
              {/* Suggest dates in the same month */}
              {allDatesInMonth.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  <span className="text-[11px] text-slate-400 mr-1">วันที่แนะนำ:</span>
                  {allDatesInMonth.slice(0, 8).map((d) => (
                    <button
                      key={d}
                      onClick={() => onDateChange && onDateChange(d)}
                      className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/40 text-xs font-mono font-medium transition cursor-pointer"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Stack of Detailed Task Cards for the Date */
            <div className="space-y-3">
              {displayedTasks.map((task, idx) => {
                const ackGrade =
                  task.ackRatePercent >= 75
                    ? { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', label: 'ผ่านเกณฑ์ UQC (≥ 75%)' }
                    : task.ackRatePercent >= 60
                    ? { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', label: 'ปานกลาง (60-74%)' }
                    : { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', label: 'ต่ำกว่าเกณฑ์ (< 60%)' };

                // Split content into clean bullet points if contains newlines or hyphens
                const contentLines = task.content
                  .split('\n')
                  .map((l) => l.trim())
                  .filter((l) => l.length > 0);

                return (
                  <div
                    key={idx}
                    className={`bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-blue-500/50 transition shadow-sm space-y-3 ${idx >= 4 ? 'pf-print-hide' : ''}`}
                  >
                    {/* Top Row: Meta & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{task.time ? `เวลา ${task.time} น.` : 'รอบ 08:05 น. (Morning Talk)'}</span>
                        </span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>ผู้ถ่ายทอด: <strong>คุณ{task.speaker}</strong></span>
                        </span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs text-cyan-300 font-medium">
                          หมวด: {task.commType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.isUrgent && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
                            🔥 เร่งด่วนสูงสุด
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold border ${ackGrade.border} ${ackGrade.bg} ${ackGrade.text}`}
                        >
                          รับทราบ {task.ackRatePercent}% ({ackGrade.label})
                        </span>
                      </div>
                    </div>

                    {/* Where this record is counted on the poster (①–④) */}
                    {(() => {
                      const typeKey = classifyCommType(task);
                      const slaKey = classifySla(task);
                      const chans = channelNames(task);
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                          <span className="text-slate-400 font-semibold mr-0.5">นับรวมอยู่ใน:</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-200 border border-blue-500/40">
                            ① ประเภท: <strong>{COMM_TYPE_LABEL[typeKey]}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-200 border border-teal-500/40">
                            ② ช่องทาง: <strong>{chans.length ? chans.join(', ') : 'ไม่ระบุ'}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md border ${
                              slaKey === 'critical'
                                ? 'bg-rose-500/15 text-rose-200 border-rose-500/40'
                                : slaKey === 'high'
                                ? 'bg-amber-500/15 text-amber-200 border-amber-500/40'
                                : 'bg-indigo-500/15 text-indigo-200 border-indigo-500/40'
                            }`}
                          >
                            ③ SLA: <strong>{SLA_LABEL[slaKey]}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-200 border border-amber-500/30">
                            ④ KPI รับทราบ: <strong>{task.ackRatePercent}%</strong>
                          </span>
                        </div>
                      );
                    })()}

                    {/* Main Content Box (The exact work done / details) */}
                    <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800 space-y-2">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>รายละเอียดเนื้องานและวาระการสื่อสาร (Task Description):</span>
                      </div>
                      <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans space-y-1.5">
                        {contentLines.map((line, lIdx) => (
                          <div key={lIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                            <span className="text-slate-100">{line.replace(/^[-•]\s*/, '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Details Grid & Quick Copy Action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                      <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                        <div>
                          <span>🛡️ ผู้กำกับติดตาม: </span>
                          <span className="font-semibold text-slate-200">{task.supervisor}</span>
                        </div>
                        <div>
                          <span>⏱️ ระยะเวลา: </span>
                          <span className="font-semibold text-slate-200">{task.duration || '24 ชม.'}</span>
                        </div>
                        <div>
                          <span>👷 ผู้รับผิดชอบ: </span>
                          <span className="font-semibold text-slate-200">{task.responsible || 'UCC'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>ช่องทาง: </span>
                          {task.channelMorning && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium text-[10px]">
                              ☕ Morning
                            </span>
                          )}
                          {task.channelLine && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium text-[10px]">
                              📱 LINE
                            </span>
                          )}
                          {task.channelMSTeams && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium text-[10px]">
                              💻 Teams
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyTask(task, idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer ml-auto"
                      >
                        {copiedIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span>{copiedIdx === idx ? 'คัดลอกลงคลิปบอร์ดแล้ว!' : '📱 คัดลอกส่ง LINE'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {displayedTasks.length > 4 && (
                <p className="pf-print-show text-[11px] text-slate-400 text-center">
                  … และอีก {displayedTasks.length - 4} รายการ (ดูทั้งหมดได้บนแดชบอร์ด)
                </p>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            BOTTOM PROCESS WORKFLOW: 4-STEP LINEAR CHEVRON PROCESS FLOW
            Faithful to the mockup design:
            - Step 1: Issue Identification (Reports a problem)
            - Step 2: Dispatch & Assignment (Task allocation)
            - Step 3: Work Execution (Engineering tasks)
            - Step 4: Resolution & Reporting (Completion and feedback)
            ========================================================================= */}
        <div className="pt-1">
          {/* Section Subhead */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="text-xs md:text-sm font-extrabold text-slate-900 tracking-wide uppercase">
                4-STEP ENGINEERING CLUSTER WORKFLOW
              </h3>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                (ขั้นตอนการปฏิบัติงานและการสื่อสาร 4 ขั้นตอน)
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              End-to-End SLA
            </span>
          </div>

          {/* Chevron Pipeline Container */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 relative">
            {/* Step 1: Issue Identification */}
            <div
              onClick={() => setActiveStep(1)}
              className={`rounded-2xl p-3.5 transition cursor-pointer flex flex-col justify-between border ${
                activeStep === 1
                  ? 'ring-2 ring-blue-600 shadow-md bg-blue-50/70 border-blue-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black text-xs shadow-md ring-4 ring-blue-100">
                  1
                </div>
                {/* 3 connecting dots */}
                <div className="flex gap-1 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-tight uppercase">
                  ISSUE IDENTIFICATION
                </h4>
                <p className="text-[10.5px] font-semibold text-blue-700 mt-0.5">
                  Reports a problem
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  รับเรื่องและคัดกรองอุบัติการณ์ หรือเครื่องมือแพทย์ชำรุดหน้างาน
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-400">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-mono font-medium text-slate-500">Step 01</span>
              </div>
            </div>

            {/* Step 2: Dispatch & Assignment */}
            <div
              onClick={() => setActiveStep(2)}
              className={`rounded-2xl p-3.5 transition cursor-pointer flex flex-col justify-between border ${
                activeStep === 2
                  ? 'ring-2 ring-blue-600 shadow-md bg-blue-50/70 border-blue-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-black text-xs shadow-md ring-4 ring-sky-100">
                  2
                </div>
                {/* 2 connecting lines */}
                <div className="flex flex-col gap-1 w-5 opacity-70">
                  <span className="h-0.5 w-full bg-sky-500 rounded" />
                  <span className="h-0.5 w-full bg-sky-500 rounded" />
                </div>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-tight uppercase">
                  DISPATCH & ASSIGNMENT
                </h4>
                <p className="text-[10.5px] font-semibold text-sky-700 mt-0.5">
                  Task allocation
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  วิเคราะห์อาการ ประสานช่าง BME ประจำระบบ & มอบหมายงาน
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-400">
                <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-mono font-medium text-slate-500">Step 02</span>
              </div>
            </div>

            {/* Step 3: Work Execution */}
            <div
              onClick={() => setActiveStep(3)}
              className={`rounded-2xl p-3.5 transition cursor-pointer flex flex-col justify-between border ${
                activeStep === 3
                  ? 'ring-2 ring-teal-600 shadow-md bg-teal-50/70 border-teal-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-black text-xs shadow-md ring-4 ring-teal-100">
                  3
                </div>
                {/* 3 connecting dots */}
                <div className="flex gap-1 opacity-70">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                </div>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-tight uppercase">
                  WORK EXECUTION
                </h4>
                <p className="text-[10.5px] font-semibold text-teal-700 mt-0.5">
                  Engineering tasks
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  ลงมือซ่อมบำรุง, ตรวจสอบความปลอดภัยทางไฟฟ้า, เปลี่ยนอะไหล่
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-400">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-mono font-medium text-slate-500">Step 03</span>
              </div>
            </div>

            {/* Step 4: Resolution & Reporting */}
            <div
              onClick={() => setActiveStep(4)}
              className={`rounded-2xl p-3.5 transition cursor-pointer flex flex-col justify-between border ${
                activeStep === 4
                  ? 'ring-2 ring-emerald-600 shadow-md bg-emerald-50/70 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-8 h-8 rounded-full bg-[#15803d] text-white flex items-center justify-center font-black text-xs shadow-md ring-4 ring-emerald-100">
                  4
                </div>
                {/* Final check badge */}
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Complete
                </span>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-extrabold text-slate-900 leading-tight uppercase">
                  RESOLUTION & REPORTING
                </h4>
                <p className="text-[10.5px] font-semibold text-emerald-700 mt-0.5">
                  Completion and feedback
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  ส่งมอบงาน บันทึกประวัติ และยืนยันการรับทราบผลงานในระบบ
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-400">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-mono font-medium text-slate-500">Step 04</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            AUTHORITY & COMPLIANCE FOOTER SIGN-OFF
            ========================================================================= */}
        <div className="pt-3 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-7 border-b border-dashed border-slate-400 flex items-end justify-center pb-1 text-slate-600 font-mono text-[10px]">
              (ทีมถ่ายทอดข้อมูล BME)
            </div>
            <div className="text-[10.5px] font-bold text-slate-800 mt-1">ผู้ถ่ายทอดข้อมูล</div>
            <div className="text-[9.5px] text-slate-500">รอบ Morning Talk ประจำวัน</div>
          </div>

          <div>
            <div className="h-7 border-b border-dashed border-slate-400 flex items-end justify-center pb-1 text-slate-600 font-mono text-[10px]">
              (สุพัตรา ชนะโชติ / ไอยเรศ)
            </div>
            <div className="text-[10.5px] font-bold text-slate-800 mt-1">ผู้กำกับติดตามการสื่อสาร (UQC)</div>
            <div className="text-[9.5px] text-slate-500">เกณฑ์มาตรฐานคุณภาพ &gt; 75%</div>
          </div>

          <div>
            <div className="h-7 border-b border-dashed border-slate-400 flex items-end justify-center pb-1 text-emerald-700 font-mono text-[10px] font-bold">
              [ อนุมัติผ่านระบบอัตโนมัติ ]
            </div>
            <div className="text-[10.5px] font-bold text-slate-800 mt-1">หัวหน้าฝ่ายวิศวกรรมการแพทย์</div>
            <div className="text-[9.5px] text-slate-500">Hospital Engineering Cluster Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
};
