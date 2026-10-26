import React, { useState } from 'react';
import {
  MessageSquare,
  ShieldAlert,
  Users,
  CheckCircle,
  Filter,
  BarChart2,
  PieChart,
  Calendar,
  Layers,
  ArrowRight,
  Search,
} from 'lucide-react';
import { DashboardDataset } from '../types/dashboard';
import { DateMonthFilterBar } from './DateMonthFilterBar';
import { normalizeDate, getMonthFromDate } from '../utils/dateUtils';

interface InteractiveAnalyticsViewProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  onNavigateTab: (tabId: string, systemFilter?: string) => void;
}

export const InteractiveAnalyticsView: React.FC<InteractiveAnalyticsViewProps> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sys2' | 'sys5' | 'sys8' | 'sys9'>('sys2');
  const [searchFilter, setSearchFilter] = useState('');

  // Filter lists by selected date or month
  let baseSys2 = data.system2;
  let baseSys5 = data.system5;
  let baseSys8 = data.system8;
  let baseSys9 = data.system9;

  if (selectedDate !== 'all') {
    const targetNorm = normalizeDate(selectedDate);
    baseSys2 = baseSys2.filter((r) => normalizeDate(r.date) === targetNorm);
    baseSys5 = baseSys5.filter((r) => normalizeDate(r.date) === targetNorm);
    baseSys9 = baseSys9.filter((r) => normalizeDate(r.date) === targetNorm);
    const m = getMonthFromDate(selectedDate);
    if (m) {
      baseSys8 = baseSys8.filter((r) => r.month === m);
    }
  } else if (selectedMonth !== 'all') {
    baseSys2 = baseSys2.filter((r) => r.month === selectedMonth);
    baseSys5 = baseSys5.filter((r) => r.month === selectedMonth);
    baseSys8 = baseSys8.filter((r) => r.month === selectedMonth);
    baseSys9 = baseSys9.filter((r) => getMonthFromDate(r.date) === selectedMonth);
  }

  const sys2List = baseSys2.filter(
    (r) => !searchFilter || r.content.includes(searchFilter) || r.speaker.includes(searchFilter)
  );

  const sys5List = baseSys5.filter(
    (r) => !searchFilter || r.issue.includes(searchFilter) || r.targetDept.includes(searchFilter)
  );

  const sys8List = baseSys8.filter(
    (r) => !searchFilter || r.engActivity.includes(searchFilter) || r.devActivity.includes(searchFilter)
  );

  const sys9List = baseSys9.filter(
    (r) => !searchFilter || r.projectName.includes(searchFilter) || r.activity.includes(searchFilter)
  );

  // System 2 Aggregations
  const totalSys2 = sys2List.length;
  const morningCount = sys2List.filter((r) => r.channelMorning).length;
  const lineCount = sys2List.filter((r) => r.channelLine).length;
  const teamsCount = sys2List.filter((r) => r.channelMSTeams).length;
  const urgentCount = sys2List.filter((r) => r.isUrgent).length;
  const spiritCount = sys2List.filter((r) => r.isSpirit).length;

  // Speaker breakdown in Sys 2
  const speakerCounts: Record<string, number> = {};
  sys2List.forEach((r) => {
    if (r.speaker) {
      speakerCounts[r.speaker] = (speakerCounts[r.speaker] || 0) + 1;
    }
  });
  const topSpeakers = Object.entries(speakerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // System 5 Aggregations
  const totalSys5 = sys5List.length;
  const giCount = sys5List.filter((r) => r.severityLevel === 'G-I').length;
  const dfCount = sys5List.filter((r) => r.severityLevel === 'D-F').length;
  const acCount = sys5List.filter((r) => r.severityLevel === 'A-C').length;

  const deptCounts: Record<string, number> = {};
  sys5List.forEach((r) => {
    const dept = r.targetDept || 'ทั่วไป';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });
  const topDepts = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="w-full max-w-6xl space-y-4">
      {/* Date & Month Global Filter Bar */}
      <DateMonthFilterBar
        data={data}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        onMonthChange={onMonthChange}
        onDateChange={onDateChange}
      />

      {/* Top Filter & Sub-system tab navigation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* System Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('sys2')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'sys2'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ระบบที่ 2 (การสื่อสาร)</span>
            <span className="font-mono text-[10.5px] opacity-80">({totalSys2})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sys5')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'sys5'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ระบบที่ 5 (เสียงลูกค้า VOC)</span>
            <span className="font-mono text-[10.5px] opacity-80">({totalSys5})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sys8')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'sys8'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ระบบที่ 8 (คน & วัฒนธรรม)</span>
            <span className="font-mono text-[10.5px] opacity-80">({sys8List.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sys9')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === 'sys9'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>ระบบที่ 9 (Best Practice)</span>
            <span className="font-mono text-[10.5px] opacity-80">({sys9List.length})</span>
          </button>
        </div>

        {/* Quick Search Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาข้อความ/บุคคล..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-emerald-500 outline-none w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* CONTENT FOR SELECTED SUB-TAB */}

      {/* 1. SYSTEM 2 VIEW */}
      {activeSubTab === 'sys2' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">จำนวนการสื่อสารทั้งหมด</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{totalSys2.toLocaleString()}</div>
              <span className="text-[11px] text-blue-400 mt-1 block">รอบ 8:05 น. สม่ำเสมอ</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">Morning Meeting</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{morningCount}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {totalSys2 > 0 ? Math.round((morningCount / totalSys2) * 100) : 0}% ของทั้งหมด
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">สื่อสารผ่าน LINE Note</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{lineCount}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">สรุปบันทึกข้อความสำคัญ</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">เรื่องด่วน / สั่งการเร่งด่วน</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">{urgentCount}</div>
              <span className="text-[11px] text-rose-400 mt-1 block">ระดับความสำคัญสูงสุด</span>
            </div>
          </div>

          {/* Interactive Channel Breakdown & Speaker Ranking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channels Bar breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <span>สัดส่วนช่องทางการสื่อสาร (Communication Channels)</span>
              </h3>

              <div className="space-y-3.5">
                {[
                  { name: 'Morning Meeting หน้างาน (8:05 น.)', count: morningCount, color: 'bg-emerald-400' },
                  { name: 'ทางไลน์กลุ่ม (LINE Note)', count: lineCount, color: 'bg-amber-400' },
                  { name: 'ประชุมออนไลน์ MS Teams', count: teamsCount, color: 'bg-blue-400' },
                  { name: 'ค่านิยม PHQ Spirit & นโยบาย', count: spiritCount, color: 'bg-purple-400' },
                ].map((item, i) => {
                  const pct = totalSys2 > 0 ? Math.round((item.count / totalSys2) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="font-mono text-slate-400 font-bold">
                          {item.count} ครั้ง ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Communicators */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>ผู้ถ่ายทอดข้อมูลหลัก (Key Communicators / Speakers)</span>
              </h3>

              <div className="space-y-2.5">
                {topSpeakers.map(([speaker, count], i) => (
                  <div
                    key={speaker}
                    className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px]">
                        {i + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">{speaker}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-400 font-bold">{count} ครั้ง</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({totalSys2 > 0 ? Math.round((count / totalSys2) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM 5 VIEW */}
      {activeSubTab === 'sys5' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">ข้อร้องเรียนทั้งหมด</span>
              <div className="text-2xl font-black text-white font-mono mt-1">{totalSys5}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">ปิดงานครบ 100%</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">ระดับรุนแรงสูงสุด (G-I)</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">{giCount}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">เครื่องมือเสีย / ซับซ้อน</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">ระดับปานกลาง (D-F)</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">{dfCount}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">แก้เสร็จใน 1-2 สัปดาห์</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400">ระดับทั่วไป (A-C)</span>
              <div className="text-2xl font-black text-blue-400 font-mono mt-1">{acCount}</div>
              <span className="text-[11px] text-blue-400 mt-1 block">แก้ไขทันทีหน้างาน</span>
            </div>
          </div>

          {/* Department Breakdown & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>การกระจายตามหน่วยงานที่เกี่ยวข้อง (Department Incident Frequency)</span>
              </h3>

              <div className="space-y-3">
                {topDepts.map(([dept, count]) => {
                  const pct = totalSys5 > 0 ? Math.round((count / totalSys5) * 100) : 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{dept}</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {count} เคส ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>มาตรการแก้ไขและฟื้นฟูบริการ (Corrective Actions)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="font-bold text-emerald-400 mb-1">ระยะสั้น (Short-Term Action):</div>
                  <p className="text-slate-300 leading-relaxed">
                    จัดอบรม Hands-on Workshop เน้นการ Daily Check & First Aid เบื้องต้นโดยช่างเทคนิค และเชิญ Vendor เสริมทักษะขั้นสูง
                  </p>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="font-bold text-blue-400 mb-1">ระยะยาว (Long-Term Action):</div>
                  <p className="text-slate-300 leading-relaxed">
                    เปลี่ยนเป็นการ บำรุงรักษาเชิงคาดการณ์ (Predictive Maintenance) โดยใช้สถิติตรวจจับก่อนเครื่องเสีย พร้อมสร้าง Knowledge Base
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SYSTEM 8 VIEW */}
      {activeSubTab === 'sys8' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">มิติที่ 1</span>
              <h4 className="font-bold text-white text-base mt-1">การสร้างความผูกพัน (Engagement)</h4>
              <p className="text-xs text-slate-400 mt-1">กิจกรรม BME Family และ 1:1 Coaching</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs text-slate-400">อัตราความพึงพอใจ:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">92%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">เข้าร่วม 12 จาก 13 คน (92.3%)</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">มิติที่ 2</span>
              <h4 className="font-bold text-white text-base mt-1">การพัฒนาคน (Capacity & Up Skill)</h4>
              <p className="text-xs text-slate-400 mt-1">Up Skill AOP, 10 ระบบงาน, Happy Series</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs text-slate-400">ผลการประเมินระดับดี:</span>
                <span className="text-2xl font-black text-blue-400 font-mono">100%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">ผู้รับผิดชอบ: สุพัตรา ชนะโชติ</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">มิติที่ 3</span>
              <h4 className="font-bold text-white text-base mt-1">วัฒนธรรมความปลอดภัย (Culture)</h4>
              <p className="text-xs text-slate-400 mt-1">ค่านิยม We Before Me & PHQ Spirit</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-xs text-slate-400">การยอมรับค่านิยม:</span>
                <span className="text-2xl font-black text-purple-400 font-mono">100%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">ยึดความปลอดภัยหน้างานเป็นหลัก</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SYSTEM 9 VIEW */}
      {activeSubTab === 'sys9' && (
        <div className="space-y-4">
          {data.system9.map((proj, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    BEST PRACTICE #{idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{proj.projectName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">วันที่: {proj.date}</span>
                  <span className="text-xs text-emerald-400 font-bold block">กลุ่มลูกค้า: {proj.customerGroup}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1">เป้าหมายมาตรฐาน (Target):</span>
                  <span className="text-emerald-400 font-semibold block">{proj.target}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-300 block mb-1">ผลลัพธ์เดือนที่ 1 - 3:</span>
                  <span className="text-blue-400 font-mono font-bold block">{proj.resultM1 || '100%'} (สำเร็จตามเกณฑ์)</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                <strong className="text-white block mb-1">กิจกรรมดำเนินการ (Activity):</strong>
                <pre className="whitespace-pre-line font-sans text-slate-300 text-[11.5px] leading-relaxed">
                  {proj.activity}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
