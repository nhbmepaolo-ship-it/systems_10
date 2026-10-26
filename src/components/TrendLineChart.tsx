import React, { useState } from 'react';
import { PredictiveInsight } from '../types/dashboard';

interface TrendLineChartProps {
  predictive: PredictiveInsight;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ predictive }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const forecast = predictive.projectedForecast || [
    { period: 'ก.ค.', actualAckRate: 71.2, projectedAckRate: 71.2, projectedComplaints: 7 },
    { period: 'ส.ค.', actualAckRate: 72.5, projectedAckRate: 72.5, projectedComplaints: 6 },
    { period: 'ก.ย.', actualAckRate: 73.8, projectedAckRate: 73.8, projectedComplaints: 5 },
    { period: 'ต.ค.', actualAckRate: 75.1, projectedAckRate: 75.1, projectedComplaints: 4 },
    { period: 'พ.ย. (คาดการณ์)', projectedAckRate: 76.4, projectedComplaints: 3 },
    { period: 'ธ.ค. (คาดการณ์)', projectedAckRate: 77.8, projectedComplaints: 3 },
  ];

  const width = 580;
  const height = 240;
  const padding = { top: 28, right: 35, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = 65;
  const maxVal = 85;

  const getX = (idx: number) => padding.left + (idx / (forecast.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Actual points vs Forecast points
  const actualPoints = forecast
    .map((item, idx) => (item.actualAckRate !== undefined ? { x: getX(idx), y: getY(item.actualAckRate), item, idx } : null))
    .filter(Boolean) as { x: number; y: number; item: (typeof forecast)[0]; idx: number }[];

  const projectedPoints = forecast.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.projectedAckRate),
    item,
    idx,
  }));

  const actualPath = actualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const projectedPath = projectedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient area
  const areaPath = `${projectedPath} L ${projectedPoints[projectedPoints.length - 1].x} ${padding.top + chartH} L ${
    projectedPoints[0].x
  } ${padding.top + chartH} Z`;

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded" />
            <span className="text-slate-300">ข้อมูลจริงในระบบ (Actual %)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-400" />
            <span className="text-emerald-400">แบบจำลองทำนายแนวโน้ม (Predictive Trend)</span>
          </div>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          ความชันสถิติ (Slope): +{predictive.regressionSlope}% / เดือน
        </span>
      </div>

      <div className="relative w-full aspect-[2.4/1] bg-slate-950/60 rounded-lg border border-slate-800/80 p-2">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[65, 70, 75, 80, 85].map((lvl) => {
            const y = getY(lvl);
            return (
              <g key={`grid-${lvl}`}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="fill-slate-500 text-[10px] font-mono">
                  {lvl}%
                </text>
              </g>
            );
          })}

          {/* Area under projected line */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Projected Dotted Line */}
          <path
            d={projectedPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-all"
          />

          {/* Actual Solid Line */}
          <path d={actualPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />

          {/* X Axis Labels & Points */}
          {forecast.map((item, idx) => {
            const x = getX(idx);
            const isForecast = item.actualAckRate === undefined;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={`col-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartH}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* X axis period label */}
                <text
                  x={x}
                  y={padding.top + chartH + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${isForecast ? 'fill-emerald-400 font-bold' : 'fill-slate-400'}`}
                >
                  {item.period}
                </text>

                {/* Point dot for Projected */}
                <circle
                  cx={x}
                  cy={getY(item.projectedAckRate)}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isForecast ? '#10b981' : '#3b82f6'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-10 pointer-events-none bg-slate-900 border border-slate-700 p-2.5 rounded shadow-xl text-xs"
            style={{
              left: `${Math.min(75, Math.max(15, (getX(hoveredIdx) / width) * 100))}%`,
              top: '15%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-white mb-1 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
              <span>{forecast[hoveredIdx].period}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {forecast[hoveredIdx].actualAckRate !== undefined ? 'ข้อมูลบันทึกจริง' : 'ค่าคาดการณ์ AI/สถิติ'}
              </span>
            </div>
            <div className="space-y-1 text-slate-300">
              {forecast[hoveredIdx].actualAckRate !== undefined && (
                <div className="flex justify-between gap-3">
                  <span className="text-blue-400">อัตราการรับทราบจริง:</span>
                  <span className="font-mono font-bold text-white">{forecast[hoveredIdx].actualAckRate}%</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-emerald-400">เป้าหมายตามแบบจำลอง:</span>
                <span className="font-mono font-bold text-white">{forecast[hoveredIdx].projectedAckRate}%</span>
              </div>
              <div className="flex justify-between gap-3 text-[11px] text-slate-400">
                <span>คาดการณ์ข้อร้องเรียน:</span>
                <span className="font-mono">{forecast[hoveredIdx].projectedComplaints} เคส</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
