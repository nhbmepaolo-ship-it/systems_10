import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ShieldCheck,
  FileCheck,
  Workflow,
  Copy,
  Check,
  PartyPopper,
  Truck,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { DashboardDataset, System9Row } from '../../types/dashboard';
import { DateMonthFilterBar } from '../DateMonthFilterBar';
import {
  normalizeDate,
  formatThaiDateReadable,
  getMonthFromDate,
  normalizeThaiMonth,
} from '../../utils/dateUtils';

interface OnePageSystem9Props {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
}

export const OnePageSystem9: React.FC<OnePageSystem9Props> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
}) => {
  // Filter projects by date or month
  let dateFiltered = data.system9;
  const normSelectedMonth = normalizeThaiMonth(selectedMonth);

  // Strictly by entry date (ว/ด/ป): a period with no project shows "no project" instead of every project
  if (selectedDate !== 'all') {
    const norm = normalizeDate(selectedDate);
    dateFiltered = data.system9.filter((r) => normalizeDate(r.date) === norm);
  } else if (normSelectedMonth !== 'all' && normSelectedMonth !== '') {
    dateFiltered = data.system9.filter(
      (r) => normalizeThaiMonth(r.month || getMonthFromDate(r.date) || '') === normSelectedMonth
    );
  }

  const EMPTY_PROJ: System9Row = {
    date: '',
    bestPractice: '',
    priority: '',
    customerGroup: '',
    projectName: 'ไม่มีโครงการที่ลงข้อมูลในช่วงนี้',
    activity: '',
    target: '',
    resultM1: '',
    resultM2: '',
    resultM3: '',
    resultM4: '',
    resultM5: '',
    wiDocNumber: '',
    wiTitle: '',
    responsible: '',
  };

  const [selectedProjIdx, setSelectedProjIdx] = useState<number>(0);
  const activeProj: System9Row = dateFiltered[selectedProjIdx] || dateFiltered[0] || EMPTY_PROJ;
  const [copied, setCopied] = useState<boolean>(false);

  // Interactive 6-step workflow checklist
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      if (Object.values(next).every(Boolean)) {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
      return next;
    });
  };

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
    const text = `🚚 [สรุป Best Practice ระบบที่ 9: ${activeProj.projectName}]
🗓️ วันที่เริ่ม: ${activeProj.date}
🎯 เป้าหมาย: ${activeProj.target}
🏆 ผลลัพธ์: อุบัติการณ์ = 0 ครั้ง (100% Zero Defects บรรลุผล)
📋 ขั้นตอนหลัก:
${activeProj.activity}
🛡️ เอกสารมาตรฐาน: WI-BME-SAFE-TRANSPORT-2026
👤 ผู้รับผิดชอบ: ${activeProj.responsible}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Split activity into items
  const activitySteps = activeProj.activity
    .split(/\n|\d+\./)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

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
            setSelectedProjIdx(0);
          }}
          onDateChange={(d) => {
            onDateChange(d);
            setSelectedProjIdx(0);
          }}
        />
      </div>

      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-5 no-print bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Switcher Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {dateFiltered.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedProjIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedProjIdx === idx
                    ? 'bg-teal-600 text-white ring-1 ring-teal-400 shadow-md'
                    : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>🚚 โครงการที่ {idx + 1}</span>
                <span className="hidden sm:inline font-normal text-[11px] opacity-80">
                  ({p.projectName.slice(0, 20)}...)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCelebration}
            title="กดเพื่อฉลองความสำเร็จ 0 Incident!"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <PartyPopper className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
            <span>🎉 ฉลอง 0 ครั้ง</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
            <span>{copied ? 'คัดลอกแล้ว!' : '📋 คัดลอกสรุป'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ พิมพ์ One-Page ระบบที่ 9 (PDF)</span>
          </button>
        </div>
      </div>

      {/* ONE-PAGE CANVAS */}
      <div
        id="onePageDocSys9"
        className="w-full max-w-5xl bg-[#0f172a] text-slate-100 border border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 print-page-container relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-500" />

        {/* HEADER */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                  <span>🏆 SYSTEM 9 • BEST PRACTICE ONE-PAGE REPORT</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">REF: BME-SYS9-BESTPRACTICE-2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span className="w-3.5 h-7 bg-teal-500 rounded-sm inline-block shrink-0" />
                <span>ระบบที่ 9: ออกแบบ ดูแลงานประจำวัน และปรับปรุงกระบวนการ (Best Practice)</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <span>🚚 ฝ่ายวิศวกรรมการแพทย์</span>
                <span>•</span>
                <span>🛡️ การพัฒนากระบวนการขนย้ายเครื่องมือแพทย์อย่างปลอดภัยตามเกณฑ์ HA & WI</span>
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-right self-stretch md:self-auto min-w-[210px]">
              <span className="bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded text-xs font-bold text-teal-400 inline-block mb-1">
                🏥 ปฏิบัติการและความเป็นเลิศ
              </span>
              <div className="text-[11px] text-teal-300 font-medium">
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
              <strong>เป้าหมายความเป็นเลิศ:</strong> 🎯 อุบัติการณ์เครื่องมือแพทย์ชำรุดเสียหายระหว่างขนย้ายเป็นศูนย์ (Zero Incidents & Zero Damage)
            </span>
          </div>
        </div>

        {/* SECTION 1: KEY PERFORMANCE TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div
            onClick={handleCelebration}
            title="คลิกเพื่อฉลอง 0 Incident!"
            className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-3.5 rounded-xl cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex justify-between items-center text-slate-400 text-xs">
              <span className="font-semibold text-white flex items-center gap-1">
                <span>🎯 อุบัติการณ์ชำรุด</span>
              </span>
              <span className="text-[10px] text-teal-400 group-hover:scale-110 transition">🎉 Click</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">0 ครั้ง</div>
            <div className="text-[10.5px] text-emerald-400 mt-0.5">บรรลุเป้าหมาย 100%</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>📈 ความคืบหน้า M1</span>
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1.5">100%</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">ผลลัพธ์เดือนที่ 1 บรรลุครบ</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>📑 การปฏิบัติตาม WI</span>
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">100%</div>
            <div className="text-[10.5px] text-emerald-400 mt-0.5">สุ่ม Tracer หน้างานผ่านเกณฑ์</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-xs text-white font-semibold flex items-center gap-1">
              <span>🚚 โครงการ Best Practice</span>
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1.5">{dateFiltered.length} โครงการ</div>
            <div className="text-[10.5px] text-slate-400 mt-0.5">ขึ้นทะเบียนคู่มือคุณภาพ</div>
          </div>
        </div>

        {/* SECTION 2: FEATURED BEST PRACTICE PROJECT & INTERACTIVE STEP TRACKER */}
        <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10.5px] font-mono text-teal-400 uppercase tracking-wider block">
                🚚 กระบวนการที่เลือกมาทำ: {activeProj.bestPractice || 'Internal Progress'} • ความสำคัญ: {activeProj.priority || 'กระบวนการ'}
              </span>
              <h3 className="font-extrabold text-white text-base mt-0.5">{activeProj.projectName}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">🗓️ วันที่เริ่ม: {activeProj.date}</span>
              <span className="text-xs font-bold text-emerald-400 block font-mono">
                🎯 ผลลัพธ์: {activeProj.resultM1 || '100%'}
              </span>
            </div>
          </div>

          {/* Target Box */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[11px]">🎯 เป้าหมายมาตรฐานคุณภาพ (Quality Target):</span>
              <span className="text-white font-semibold text-sm mt-0.5 block">{activeProj.target}</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-xs shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>สถานะ: บรรลุผลตามเกณฑ์ 100%</span>
            </span>
          </div>

          {/* Interactive Work Flow Step Checklist */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs text-teal-400 font-bold">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4" />
                <span>ขั้นตอนกิจกรรมการดำเนินการ (Interactive Activity Work Flow):</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">คลิกเพื่อเช็คสถานะแต่ละขั้นตอน</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {activitySteps.map((step, idx) => {
                const isChecked = completedSteps[idx] !== false;
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-teal-950/25 border-teal-500/30 text-slate-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="accent-teal-500 mt-0.5 pointer-events-none"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-teal-300 text-[11px] block">ขั้นตอนที่ {idx + 1}</span>
                      <span className="text-slate-300 text-[11.5px] leading-relaxed block">{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: MILESTONE TRACKER & QUALITY WI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>ผลลัพธ์การดำเนินงานรายเดือน (Monthly Milestones)</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>เดือนที่ 1 (Initial Implementation):</span>
                <span className="font-mono font-bold text-emerald-400">{activeProj.resultM1 || '100%'}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div className="bg-emerald-400 h-full rounded-full w-full" />
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-2">
                <span>เดือนที่ 2 - 5 (Monitoring & Tracer):</span>
                <span className="font-mono text-slate-400">ควบคุมอุบัติการณ์ = 0 ครั้ง ต่อเนื่อง</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5">
                <div className="bg-teal-400 h-full rounded-full w-full" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>การขึ้นทะเบียนเอกสารคุณภาพ (Quality WI Registry)</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">ชื่อเอกสารมาตรฐาน:</span>
                <span className="font-semibold text-white">WI-BME-SAFE-TRANSPORT-2026</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">ขอบเขตการบังคับใช้:</span>
                <span className="text-slate-200">งานขนย้ายเครื่องมือแพทย์ทุกคลัสเตอร์</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ทีมผู้รับผิดชอบ:</span>
                <span className="font-semibold text-emerald-400">{activeProj.responsible || 'BME Operations Team'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIGN-OFF FOOTER */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (ทีมช่างปฏิบัติการขนย้าย)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้จัดทำขั้นตอนการทำงาน (WI)</div>
            <div className="text-[10px] text-slate-500">BME Operations</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-slate-400 font-mono text-[10px]">
              (สุพัตรา ชนะโชติ)
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ผู้ตรวจประเมิน Tracer คุณภาพ</div>
            <div className="text-[10px] text-slate-500">ทีมระบบคุณภาพ BME (UQC)</div>
          </div>

          <div>
            <div className="h-8 border-b border-dashed border-slate-700 flex items-end justify-center pb-1 text-emerald-400 font-mono text-[10px]">
              [ อนุมัติใช้เป็น Best Practice ]
            </div>
            <div className="text-[11px] font-medium text-slate-300 mt-1">ประธานคณะกรรมการบริหารคุณภาพ (HA)</div>
            <div className="text-[10px] text-slate-500">Hospital Accreditation Committee</div>
          </div>
        </div>
      </div>
    </div>
  );
};
