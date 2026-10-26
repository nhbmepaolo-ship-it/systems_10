import React, { useState } from 'react';
import {
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { DashboardDataset } from '../types/dashboard';
import { TrendLineChart } from './TrendLineChart';

interface PredictiveAnalyticsViewProps {
  data: DashboardDataset;
  onNavigateTab: (tabId: string) => void;
}

export const PredictiveAnalyticsView: React.FC<PredictiveAnalyticsViewProps> = ({ data, onNavigateTab }) => {
  // Executive Sensitivity Simulator
  const [extraMorningMeetingPct, setExtraMorningMeetingPct] = useState<number>(10);
  const [enablePredictiveMaint, setEnablePredictiveMaint] = useState<boolean>(true);
  const [bmeFamilySessionCount, setBmeFamilySessionCount] = useState<number>(2);

  // Compute simulated score
  const baseScore = data.predictive.healthIndexScore || 94;
  let simulatedScore = baseScore;
  if (extraMorningMeetingPct > 0) simulatedScore += (extraMorningMeetingPct / 10) * 1.2;
  if (enablePredictiveMaint) simulatedScore += 2.5;
  if (bmeFamilySessionCount > 1) simulatedScore += 1.3;
  simulatedScore = Math.min(99.8, Math.round(simulatedScore * 10) / 10);

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PREDICTIVE AI & DECISION INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400 font-mono">การวิเคราะห์เชิงทำนายเพื่อการตัดสินใจ</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              แบบจำลองทำนายแนวโน้มและตรวจจับความเสี่ยงล่วงหน้า
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              คำนวณด้วย Linear Regression และ Decision Heuristics จากข้อมูล Google Sheet 1,180+ แถว ช่วยเตือนภัยคอขวดและวางแผนเชิงรุก
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400">อัตราทำนายการรับทราบเดือนหน้า</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                {data.predictive.predictedAckRateNextMonth}%
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> แนวโน้มบวก
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS & PREDICTIVE TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trend Projection (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>เส้นแนวโน้มคาดการณ์การรับทราบข้อมูล 6 เดือน (Forecast Model)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Confidence 94.6%</span>
            </div>
            <TrendLineChart predictive={data.predictive} />
          </div>

          <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-300">
            <span className="font-semibold text-emerald-400 block mb-0.5">ผลการวิเคราะห์เชิงทำนาย:</span>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              แบบจำลองชี้ว่าอัตราการรับทราบข้อมูลของ Cluster มีแนวโน้มเพิ่มขึ้นเฉลี่ยเดือนละ +{data.predictive.regressionSlope}% คาดว่าจะแตะ {data.predictive.predictedAckRateNextMonth}% ภายใน 30 วันข้างหน้า โดยปัจจัยเร่งสูงสุดคือช่วงเวลา Morning Meeting 8:05 น.
            </p>
          </div>
        </div>

        {/* Right: Interactive Sensitivity Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>ตัวจำลองผลกระทบการตัดสินใจ (What-If Simulator)</span>
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                Interactive
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              ปรับเปลี่ยนตัวแปรกลยุทธ์เพื่อจำลองผลลัพธ์ต่อดัชนีสุขภาพระบบรวม (PQHS) ก่อนนำไปปฏิบัติจริง
            </p>

            <div className="space-y-4">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">เพิ่มสัดส่วนการสื่อสารผ่าน Morning Meeting:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{extraMorningMeetingPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={extraMorningMeetingPct}
                  onChange={(e) => setExtraMorningMeetingPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">เปิดโปรแกรม Predictive Maintenance</span>
                  <span className="text-[11px] text-slate-500 block">ลด Breakdown เครื่องมือทันตกรรม/ICU</span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePredictiveMaint}
                  onChange={(e) => setEnablePredictiveMaint(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">ความถี่กิจกรรมสัมพันธ์ BME Family / เดือน:</span>
                  <span className="font-mono text-purple-400 font-bold">{bmeFamilySessionCount} ครั้ง</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={bmeFamilySessionCount}
                  onChange={(e) => setBmeFamilySessionCount(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Simulated Score Output */}
          <div className="mt-5 p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-xl text-center">
            <div className="text-xs text-slate-400">ดัชนีคะแนนสุขภาพระบบที่จำลองได้ (Simulated Score):</div>
            <div className="text-3xl font-black text-emerald-400 font-mono my-1">{simulatedScore}%</div>
            <div className="text-[11px] text-slate-400">
              เพิ่มขึ้น <span className="text-emerald-400 font-bold">+{Math.round((simulatedScore - baseScore) * 10) / 10}%</span> จากระดับปัจจุบัน
            </div>
          </div>
        </div>
      </div>

      {/* EARLY WARNING & BOTTLENECK DETECTION */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>ระบบตรวจจับสัญญาณเตือนภัยล่วงหน้า (Automated Early Warning Signals)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ตรวจพบ {data.predictive.highPriorityBottlenecks.length} สัญญาณ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.predictive.highPriorityBottlenecks.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border flex flex-col justify-between ${
                item.severity === 'High'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : item.severity === 'Medium'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-blue-950/20 border-blue-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400">{item.system}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.severity === 'High'
                        ? 'bg-rose-500/20 text-rose-300'
                        : item.severity === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {item.severity} Risk
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                <span className="font-semibold text-emerald-400 block text-[11px] mb-0.5">ข้อแนะนำแก้ไข:</span>
                <p className="text-slate-400 text-[11.5px]">{item.recommendedAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STRATEGIC C-SUITE RECOMMENDATIONS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>คำแนะนำเชิงกลยุทธ์สำหรับผู้บริหารและหัวหน้าหน่วยงาน (Strategic Action Playbook)</span>
        </h3>

        <div className="space-y-3">
          {data.predictive.executiveRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">{rec.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold">{rec.timeframe}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400 font-medium">{rec.targetSystem}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.detail}</p>
              </div>

              <div className="self-end md:self-center shrink-0">
                <span
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    rec.impact === 'High'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  Impact: {rec.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
