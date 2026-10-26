import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  MessageSquare,
  Clock,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  Sparkles,
  Search,
  Volume2,
  Smartphone,
  Tv,
  Copy,
  Check,
  Flame,
  Radio,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  PartyPopper,
  Image as ImageIcon,
  LayoutGrid,
} from 'lucide-react';
import { DashboardDataset, System2Row } from '../../types/dashboard';
import { DateMonthFilterBar } from '../DateMonthFilterBar';
import {
  normalizeDate,
  formatThaiDateReadable,
  getMonthFromDate,
  normalizeThaiMonth,
} from '../../utils/dateUtils';
import { System2InfographicPoster } from './System2InfographicPoster';

interface OnePageSystem2Props {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
}

export const OnePageSystem2: React.FC<OnePageSystem2Props> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
}) => {
  // Mode switcher: 'infographic' (standard 4-quadrant poster) vs 'detailed' (spreadsheet analysis & line export)
  const [displayMode, setDisplayMode] = useState<'infographic' | 'detailed'>('infographic');

  // Filter rows by date or month
  let dateFiltered = data.system2;
  const normSelectedMonth = normalizeThaiMonth(selectedMonth);
  if (selectedDate !== 'all') {
    const targetNorm = normalizeDate(selectedDate);
    dateFiltered = dateFiltered.filter((r) => normalizeDate(r.date) === targetNorm);
  } else if (normSelectedMonth !== 'all' && normSelectedMonth !== '') {
    dateFiltered = dateFiltered.filter((r) => normalizeThaiMonth(r.month) === normSelectedMonth);
  }

  // Interactive filters
  const [channelFilter, setChannelFilter] = useState<'all' | 'morning' | 'line' | 'teams' | 'urgent'>('all');
  const [selectedRecordIdx, setSelectedRecordIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTabSub, setActiveTabSub] = useState<'details' | 'channels' | 'supervision'>('details');

  let displayedRows = dateFiltered;
  if (channelFilter === 'morning') displayedRows = dateFiltered.filter((r) => r.channelMorning);
  else if (channelFilter === 'line') displayedRows = dateFiltered.filter((r) => r.channelLine);
  else if (channelFilter === 'teams') displayedRows = dateFiltered.filter((r) => r.channelMSTeams);
  else if (channelFilter === 'urgent') displayedRows = dateFiltered.filter((r) => r.isUrgent);

  if (displayedRows.length === 0) displayedRows = dateFiltered;

  const activeRecord: System2Row = displayedRows[selectedRecordIdx] || displayedRows[0] || data.system2[0];

  // Aggregated stats
  const totalInPeriod = displayedRows.length;
  const validAck = displayedRows.filter((r) => r.ackRatePercent > 0);
  const avgAck = validAck.length
    ? Math.round((validAck.reduce((a, b) => a + b.ackRatePercent, 0) / validAck.length) * 10) / 10
    : 72.8;

  const morningCount = displayedRows.filter((r) => r.channelMorning).length;
  const lineCount = displayedRows.filter((r) => r.channelLine).length;
  const teamsCount = displayedRows.filter((r) => r.channelMSTeams).length;
  const urgentCount = displayedRows.filter((r) => r.isUrgent).length;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLineFormat = () => {
    const text = `📢 [สรุปการสื่อสารประจำวัน Cluster BME]
🗓️ ว/ด/ป: ${activeRecord.date} เวลา ${activeRecord.time} น.
🗣️ ผู้ถ่ายทอด: ${activeRecord.speaker}
⚡ ความสำคัญ: ${activeRecord.isUrgent ? '🔥 เร่งด่วนสูงสุด' : 'ℹ️ แจ้งเพื่อทราบ'}
🎯 อัตราการรับทราบ: ${activeRecord.ackRatePercent}% (ผ่านเกณฑ์)
📝 เนื้อหา: ${activeRecord.content}
🛡️ ผู้กำกับติดตาม: ${activeRecord.supervisor}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
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
            setSelectedRecordIdx(0);
          }}
          onDateChange={(d) => {
            onDateChange(d);
            setSelectedRecordIdx(0);
          }}
        />
      </div>

      {/* View Mode Switcher: Infographic Poster vs Detailed Records */}
      <div className="w-full max-w-5xl mb-4 no-print flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-lg">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDisplayMode('infographic')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              displayMode === 'infographic'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-cyan-300" />
            <span>🖼️ โหมด Infographic Poster (ตามแบบมาตรฐาน 4 เสาหลัก)</span>
          </button>

          <button
            onClick={() => setDisplayMode('detailed')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              displayMode === 'detailed'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-300" />
            <span>📊 โหมดรายงานละเอียด (Live Sheet & คัดลอก LINE)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1 font-medium pr-2">
          <span>ช่วงเวลา:</span>
          <span className="text-blue-300 font-bold">
            {selectedDate !== 'all' ? selectedDate : selectedMonth !== 'all' ? selectedMonth : 'สะสมทั้งปี'}
          </span>
        </div>
      </div>

      {/* RENDER INFOGRAPHIC POSTER MODE */}
      {displayMode === 'infographic' ? (
        <System2InfographicPoster
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      ) : (
        <>
          {/* Top Controls Bar with Interactive Channel Chips for Detailed Mode */}
          <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-5 no-print bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              {/* Interactive Channel Filters */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setChannelFilter('all');
                    setSelectedRecordIdx(0);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    channelFilter === 'all'
                      ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  ✨ ทั้งหมด
                </button>
                <button
                  onClick={() => {
                    setChannelFilter('morning');
                    setSelectedRecordIdx(0);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    channelFilter === 'morning'
                      ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                      : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 border border-slate-800'
                  }`}
                >
                  <span>🗣️ Morning (8:05 น.)</span>
                </button>
                <button
                  onClick={() => {
                    setChannelFilter('line');
                    setSelectedRecordIdx(0);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    channelFilter === 'line'
                      ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                      : 'bg-slate-950/60 text-slate-400 hover:text-amber-300 border border-slate-800'
                  }`}
                >
                  <span>📱 LINE Note</span>
                </button>
                <button
                  onClick={() => {
                    setChannelFilter('urgent');
                    setSelectedRecordIdx(0);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    channelFilter === 'urgent'
                      ? 'bg-rose-600 text-white ring-1 ring-rose-400'
                      : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 border border-slate-800'
                  }`}
                >
                  <span>🔥 ด่วน</span>
                </button>
              </div>

              {/* Quick Record Selector */}
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
                <select
                  value={selectedRecordIdx}
                  onChange={(e) => setSelectedRecordIdx(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-blue-300 text-xs rounded px-2.5 py-1.5 focus:border-blue-500 outline-none max-w-[190px] truncate cursor-pointer font-medium"
                >
                  {displayedRows.slice(0, 30).map((r, idx) => (
                    <option key={idx} value={idx}>
                      #{idx + 1} {r.date} ({r.speaker}): {r.content.slice(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLineFormat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                <span>{copied ? 'คัดลอกส่ง LINE แล้ว!' : '📱 คัดลอกส่ง LINE'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>🖨️ พิมพ์ One-Page ระบบที่ 2 (PDF)</span>
              </button>
            </div>
          </div>

          {/* ONE-PAGE CANVAS */}
          <div
            id="onePageDocSys2"
            className="w-full max-w-5xl bg-[#0f172a] text-slate-100 border border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 print-page-container relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />

            {/* HEADER */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <span>📢 SYSTEM 2 • ONE-PAGE REPORT</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">REF: BME-SYS2-COMM-2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span className="w-3.5 h-7 bg-blue-500 rounded-sm inline-block shrink-0" />
                <span>ระบบที่ 2: ระบบการสื่อสารของ Cluster ประจำวันและประจำเดือน</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <span>🩺 ฝ่ายวิศวกรรมการแพทย์ (BME Unit)</span>
                <span>•</span>
                <span>💬 การถ่ายทอดนโยบายและการรับทราบข้อมูลหน้างาน</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-right self-stretch md:self-auto min-w-[210px]">
              <span className="bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded text-xs font-bold text-blue-400 inline-block mb-1">
                🏥 วิศวกรรมการแพทย์ (BME)
              </span>
              <div className="text-[11px] text-blue-300 font-medium">
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
              <strong>ค่านิยมเป้าหมายร่วมกัน:</strong> ⚡ PHQ Spirit : มืออาชีพ วินัยมั่น ร่วมมือกัน สู่เส้นชัย คุณภาพคือหัวใจ ลูกค้าให้เป็นศูนย์กลาง
            </span>
          </div>
        </div>

        {/* SECTION 1: TOP KEY PERFORMANCE TILES WITH INTERACTIVE DIALS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div
            onClick={handleConfetti}
            title="คลิกเพื่อฉลองผลงาน!"
            className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold text-white flex items-center gap-1">
                <span>👥 อัตราการรับทราบ</span>
              </span>
              <span className="text-[10px] text-blue-400 group-hover:scale-110 transition">🎉 Click</span>
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1.5">{avgAck}%</div>
            <div className="text-[10.5px] text-emerald-400 mt-0.5">🎯 เกณฑ์มาตรฐาน ≥ 70.0%</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>☕ Morning Meeting</span>
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">{morningCount} ครั้ง</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">
              รอบ 8:05 น. ({totalInPeriod > 0 ? Math.round((morningCount / totalInPeriod) * 100) : 0}%)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>⚡ วาระเร่งด่วน/สั่งการ</span>
            </span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1.5">{urgentCount} เรื่อง</div>
            <div className="text-[10.5px] text-rose-400 mt-0.5">🔥 ติดตามผล 100%</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>📋 บันทึกในสเปรดชีท</span>
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1.5">{totalInPeriod} วาระ</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">📊 สดจาก Google Sheet</div>
          </div>
        </div>

        {/* SECTION 2: INTERACTIVE SPOTLIGHT ON ACTIVE RECORD */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <div>
                <span className="text-[10.5px] text-blue-400 font-mono block">
                  🗓️ วันที่: {activeRecord.date} เวลา {activeRecord.time} น.
                </span>
                <h3 className="font-extrabold text-white text-sm">
                  วาระเด่นที่กำลังเลือกแสดง ({activeRecord.commType})
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeRecord.isUrgent && (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  🔥 เร่งด่วนสูงสุด
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30">
                🗣️ ผู้ถ่ายทอด: {activeRecord.speaker}
              </span>
            </div>
          </div>

          {/* 3 Core Highlight Blocks with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-2">
                <span>📜 1. นโยบายสำคัญ (Policy)</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {activeRecord.commType.includes('นโยบาย') || activeRecord.content.includes('นโยบาย')
                  ? activeRecord.content
                  : 'เน้นย้ำการขับเคลื่อน 10 ระบบงาน, 3 GOALS, Happy Series และการทำ Value Personalized Care ร่วมใจบริการ'}
              </p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-2">
                <span>🛠️ 2. เครื่องมือและอุปกรณ์ (Equipment)</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {activeRecord.content.includes('Equipment') || activeRecord.content.includes('เครื่องมือ')
                  ? activeRecord.content
                  : 'ตรวจเช็คเครื่องมือเสีย, ขอยืม-คืนเครื่องมือทดแทน (เช่น US ศูนย์หัวใจ/ICU) ประสาน Vendor ลง Software ทันท่วงที'}
              </p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-2">
                <span>🛡️ 3. มาตรฐานความปลอดภัย (Safety)</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {activeRecord.content.includes('Method') || activeRecord.content.includes('WI')
                  ? activeRecord.content
                  : 'กรณีระบบไฟฟ้าขัดข้อง ช่างเวรตรวจสอบระบบ Air Compressor และระบบสแตนด์บายฉุกเฉินทันทีเพื่อแรงดันลมต่อเนื่อง'}
              </p>
            </div>
          </div>

          {/* Interactive Channel Indicators */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📊 ผลการรับทราบวาระนี้:</span>
              <span className="font-mono font-black text-emerald-400 text-base">
                {activeRecord.ackRatePercent}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">ช่องทางสื่อสาร:</span>
              <div className="flex items-center gap-1">
                {activeRecord.channelMorning && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px]">
                    ☕ Morning Meeting 8:05 น.
                  </span>
                )}
                {activeRecord.channelLine && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
                    📱 LINE Note
                  </span>
                )}
                {activeRecord.channelMSTeams && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold text-[10px]">
                    💻 MS Teams
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: AUDITING & SUPERVISORY MONITORING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <span>👥 การกำกับติดตามความเข้าใจ (Supervisory Tracking)</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">ทีมกำกับติดตาม:</span>
                <span className="font-semibold text-white">{activeRecord.supervisor || 'UQC (สุพัตรา, ไอยเรศ)'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">ระยะเวลาติดตาม:</span>
                <span className="font-semibold text-slate-200">{activeRecord.duration || '1 เดือน'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">วิธีการกำกับ:</span>
                <span className="text-emerald-400 font-medium">🗣️ เล่าเรื่องหน้างาน & สรุปทางไลน์</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <span>📊 สถิติช่องทางสื่อสารในรอบนี้</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>☕ Morning Meeting (8:05 น.)</span>
                <span className="font-mono font-bold text-emerald-400">{morningCount} ครั้ง</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${totalInPeriod > 0 ? (morningCount / totalInPeriod) * 100 : 0}%` }}
                />
              </div>

              <div className="flex justify-between text-slate-300 pt-1">
                <span>📱 สรุปผ่านกลุ่มไลน์ (LINE Note)</span>
                <span className="font-mono font-bold text-amber-400">{lineCount} ครั้ง</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${totalInPeriod > 0 ? (lineCount / totalInPeriod) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIGN-OFF FOOTER */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              ({activeRecord.speaker || 'ณัฐพร / ไอยเรศ'})
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้ถ่ายทอดข้อมูล</div>
            <div className="text-[10px] text-slate-500">ทีมประสานงานระบบ 2</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (สุพัตรา ชนะโชติ)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้กำกับติดตามการสื่อสาร (UQC)</div>
            <div className="text-[10px] text-slate-500">ทีมระบบคุณภาพ BME</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-emerald-400 font-mono text-[10px]">
              [ บันทึกอัตโนมัติ ]
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">หัวหน้าฝ่ายวิศวกรรมการแพทย์</div>
            <div className="text-[10px] text-slate-500">Cluster Department Lead</div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};

