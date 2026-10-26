import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  Shield,
  Zap,
  Activity,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { DashboardDataset, SystemComparisonMetric } from '../types/dashboard';
import { RadarChart } from './RadarChart';

interface SystemComparisonViewProps {
  data: DashboardDataset;
  onNavigateTab: (tabId: string, systemFilter?: string) => void;
}

export const SystemComparisonView: React.FC<SystemComparisonViewProps> = ({ data, onNavigateTab }) => {
  const [activeSystemId, setActiveSystemId] = useState<'sys2' | 'sys5' | 'sys8' | 'sys9'>('sys2');

  const selectedSys = data.comparison.find((s) => s.id === activeSystemId) || data.comparison[0];

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
                BENCHMARK & MULTI-SYSTEM COMPARISON
              </span>
              <span className="text-xs text-slate-400 font-mono">เปรียบเทียบเชิงวิเคราะห์ 4 ระบบคุณภาพ</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              เปรียบเทียบประสิทธิภาพและการบรรลุเป้าหมายแต่ละระบบ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              วิเคราะห์สมรรถนะเปรียบเทียบข้ามระบบงาน (Cross-System Benchmark) เพื่อตรวจหาจุดแข็งและโอกาสในการปรับปรุง
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2 rounded-lg text-xs">
            <span className="text-slate-400">ระบบที่มีคะแนนสูงสุด:</span>
            <span className="font-bold text-emerald-400 font-mono">ระบบที่ 9 (100%)</span>
          </div>
        </div>
      </div>

      {/* 4 SUMMARY SYSTEM TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.comparison.map((sys) => {
          const isSelected = activeSystemId === sys.id;
          const statusBg =
            sys.status === 'Target Met'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : sys.status === 'Optimal'
              ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

          return (
            <div
              key={sys.id}
              onClick={() => setActiveSystemId(sys.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-slate-500 shadow-xl ring-1 ring-slate-400'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-base text-white">{sys.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBg}`}>
                    {sys.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 line-clamp-1">{sys.tagline}</div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">คะแนนสมรรถนะรวม</div>
                    <div className="text-2xl font-black text-white font-mono">{sys.score}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">เป้าหมาย</div>
                    <div className="text-sm font-bold text-slate-300 font-mono">{sys.targetScore}%</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sys.score >= 90 ? 'bg-emerald-400' : sys.score >= 75 ? 'bg-blue-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, sys.score)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{sys.totalRecords.toLocaleString()} แถวข้อมูล</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +{sys.trendPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RADAR & SYSTEM DETAIL COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Radar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>เรดาร์เปรียบเทียบ 5 มิติ (5-Axis Radar)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">เชิงโต้ตอบ 100%</span>
            </div>
            <RadarChart
              systems={data.comparison}
              activeSystemId={activeSystemId}
              onSelectSystem={(id) => setActiveSystemId(id)}
            />
          </div>

          <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-300">
            <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>สรุปภาพรวมเรดาร์:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ระบบที่ 9 โดดเด่นด้าน Standard Compliance (100%) และ Zero Incident ในขณะที่ระบบที่ 5 และ 8 มีอัตรา Stakeholder Engagement และวัฒนธรรมความปลอดภัยสูง
            </p>
          </div>
        </div>

        {/* Right: Selected System Deep Dive & Strengths (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  {selectedSys.codeName}
                </span>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>{selectedSys.name}</span>
                  <span className="text-xs font-normal text-slate-400">({selectedSys.tagline})</span>
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('onepage', selectedSys.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
              >
                <span>📄 เปิด One-Page {selectedSys.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('data', selectedSys.name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition cursor-pointer"
              >
                <span>ดูข้อมูลตารางดิบ</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Radar Dimensions Bar Breakdown */}
            <div className="space-y-3 mb-5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                คะแนนย่อย 5 มิติของ {selectedSys.name}:
              </div>

              {[
                { label: 'ประสิทธิภาพการปฏิบัติงาน (Execution Efficiency)', val: selectedSys.radar.executionEfficiency },
                { label: 'ความสอดคล้องตามมาตรฐาน (Standard Compliance)', val: selectedSys.radar.standardCompliance },
                { label: 'การมีส่วนร่วมของบุคลากร (Stakeholder Engagement)', val: selectedSys.radar.stakeholderEngagement },
                { label: 'การปรับปรุงกระบวนการต่อเนื่อง (Continuous Improvement)', val: selectedSys.radar.continuousImprovement },
                { label: 'การควบคุมความปลอดภัยและความเสี่ยง (Safety & Risk Control)', val: selectedSys.radar.safetyAndRiskControl },
              ].map((dim, i) => (
                <div key={i} className="bg-slate-950/50 p-2 rounded border border-slate-800/60">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300">{dim.label}</span>
                    <span className="font-mono font-bold text-white">{dim.val}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dim.val >= 90 ? 'bg-emerald-400' : dim.val >= 80 ? 'bg-blue-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${dim.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Responsibles & Key Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">ผู้กำกับดูแลหลัก (Lead Supervisor):</span>
                <span className="font-semibold text-white mt-0.5 block">{selectedSys.leadResponsible}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">ดัชนีสำคัญเด่น (Key Metric):</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">{selectedSys.keyMetricValue}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>ฐานข้อมูลที่บันทึก: {selectedSys.totalRecords.toLocaleString()} แถวใน Google Sheet</span>
            <span className="text-slate-500 font-mono">สถานะ: {selectedSys.status}</span>
          </div>
        </div>
      </div>

      {/* DETAILED COMPARATIVE MATRIX TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 overflow-hidden">
        <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>ตารางเปรียบเทียบสมรรถนะแบบเคียงข้าง (Side-by-Side Comparison Matrix)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10.5px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ระบบงาน</th>
                <th className="py-2.5 px-3">จำนวนบันทึก</th>
                <th className="py-2.5 px-3">ตัวชี้วัดหลัก (KPI)</th>
                <th className="py-2.5 px-3">ผลลัพธ์จริง</th>
                <th className="py-2.5 px-3">เป้าหมาย</th>
                <th className="py-2.5 px-3">สถานะประเมิน</th>
                <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {data.comparison.map((sys) => (
                <tr
                  key={sys.id}
                  onClick={() => setActiveSystemId(sys.id)}
                  className={`hover:bg-slate-800/60 transition cursor-pointer ${
                    activeSystemId === sys.id ? 'bg-slate-800/40' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-white">
                    <div>{sys.name}</div>
                    <div className="text-[10.5px] text-slate-400 font-normal">{sys.tagline}</div>
                  </td>
                  <td className="py-3 px-3 font-mono">{sys.totalRecords.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-300">{sys.keyMetricLabel}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">{sys.keyMetricValue}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{sys.targetScore}%</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        sys.status === 'Target Met'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {sys.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{sys.leadResponsible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
