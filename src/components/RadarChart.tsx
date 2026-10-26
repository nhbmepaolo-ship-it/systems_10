import React, { useState } from 'react';
import { SystemComparisonMetric } from '../types/dashboard';

interface RadarChartProps {
  systems: SystemComparisonMetric[];
  activeSystemId?: string;
  onSelectSystem?: (id: 'sys2' | 'sys5' | 'sys8' | 'sys9') => void;
}

const DIMENSIONS = [
  { key: 'executionEfficiency', label: 'ประสิทธิภาพการปฏิบัติงาน' },
  { key: 'standardCompliance', label: 'ความสอดคล้องตามมาตรฐาน' },
  { key: 'stakeholderEngagement', label: 'การมีส่วนร่วมของบุคลากร' },
  { key: 'continuousImprovement', label: 'การปรับปรุงกระบวนการต่อเนื่อง' },
  { key: 'safetyAndRiskControl', label: 'การควบคุมความปลอดภัยและความเสี่ยง' },
];

const SYSTEM_COLORS: Record<string, { stroke: string; fill: string; dot: string; glow: string }> = {
  sys2: { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.18)', dot: '#60A5FA', glow: 'rgba(59, 130, 246, 0.5)' },
  sys5: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.18)', dot: '#FBBF24', glow: 'rgba(245, 158, 11, 0.5)' },
  sys8: { stroke: '#A855F7', fill: 'rgba(168, 85, 247, 0.18)', dot: '#C084FC', glow: 'rgba(168, 85, 247, 0.5)' },
  sys9: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.18)', dot: '#34D399', glow: 'rgba(16, 185, 129, 0.5)' },
};

export const RadarChart: React.FC<RadarChartProps> = ({ systems, activeSystemId, onSelectSystem }) => {
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [visibleSystems, setVisibleSystems] = useState<Record<string, boolean>>({
    sys2: true,
    sys5: true,
    sys8: true,
    sys9: true,
  });

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleSystems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const size = 380;
  const center = size / 2;
  const radius = 135;
  const totalAxes = DIMENSIONS.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (valueNormalized: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueNormalized;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col items-center">
      {/* Legend & toggles */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {systems.map((sys) => {
          const isVisible = visibleSystems[sys.id] !== false;
          const isSelected = activeSystemId === sys.id || hoveredSystem === sys.id;
          const colors = SYSTEM_COLORS[sys.id];

          return (
            <button
              key={sys.id}
              onClick={() => onSelectSystem && onSelectSystem(sys.id)}
              onMouseEnter={() => setHoveredSystem(sys.id)}
              onMouseLeave={() => setHoveredSystem(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                isSelected
                  ? 'border-slate-400 bg-slate-800 text-white shadow-md'
                  : isVisible
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                  : 'border-slate-900 bg-slate-950/40 text-slate-500 line-through'
              }`}
            >
              <span
                onClick={(e) => toggleVisibility(sys.id, e)}
                title="คลิกเพื่อซ่อน/แสดงในเรดาร์"
                className="w-2.5 h-2.5 rounded-full cursor-pointer hover:scale-125 transition-transform"
                style={{ backgroundColor: isVisible ? colors.stroke : '#475569' }}
              />
              <span>{sys.name}</span>
              <span className="font-mono text-[11px] text-slate-400">({sys.score}%)</span>
            </button>
          );
        })}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full max-w-[390px] aspect-square flex items-center justify-center">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
          <defs>
            {Object.entries(SYSTEM_COLORS).map(([id, col]) => (
              <filter key={`glow-${id}`} id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Background web polygons */}
          {levels.map((lvl, lvlIdx) => {
            const points = DIMENSIONS.map((_, i) => {
              const { x, y } = getCoordinates(lvl, i);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={`lvl-${lvlIdx}`}>
                <polygon
                  points={points}
                  fill={lvlIdx === levels.length - 1 ? 'rgba(15, 23, 42, 0.4)' : 'none'}
                  stroke="rgba(51, 65, 85, 0.45)"
                  strokeWidth={lvlIdx === levels.length - 1 ? '1.5' : '1'}
                  strokeDasharray={lvlIdx < levels.length - 1 ? '2 3' : undefined}
                />
                {/* Level % label */}
                <text
                  x={center + 4}
                  y={center - radius * lvl + 10}
                  className="fill-slate-600 text-[9px] font-mono select-none"
                >
                  {Math.round(lvl * 100)}%
                </text>
              </g>
            );
          })}

          {/* Radial Spokes */}
          {DIMENSIONS.map((dim, i) => {
            const { x, y } = getCoordinates(1.0, i);
            const labelCoord = getCoordinates(1.22, i);
            const isTop = i === 0;
            const isRight = i === 1 || i === 2;

            return (
              <g key={`axis-${i}`}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(71, 85, 105, 0.5)" strokeWidth="1" />
                {/* Text Label */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y + (isTop ? -4 : 4)}
                  textAnchor={Math.abs(labelCoord.x - center) < 15 ? 'middle' : isRight ? 'start' : 'end'}
                  className="fill-slate-300 text-[10px] font-medium"
                >
                  {dim.label}
                </text>
              </g>
            );
          })}

          {/* Render Systems polygons */}
          {systems.map((sys) => {
            if (visibleSystems[sys.id] === false) return null;

            const isHighlighted = hoveredSystem === sys.id || activeSystemId === sys.id;
            const colors = SYSTEM_COLORS[sys.id];

            const coords = DIMENSIONS.map((dim, i) => {
              const val = (sys.radar as any)[dim.key] || 50;
              return getCoordinates(val / 100, i);
            });

            const pointsString = coords.map((c) => `${c.x},${c.y}`).join(' ');

            return (
              <g
                key={`poly-${sys.id}`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectSystem && onSelectSystem(sys.id)}
                onMouseEnter={() => setHoveredSystem(sys.id)}
                onMouseLeave={() => setHoveredSystem(null)}
              >
                <polygon
                  points={pointsString}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isHighlighted ? '2.5' : '1.8'}
                  strokeOpacity={hoveredSystem && !isHighlighted ? 0.3 : 1}
                  fillOpacity={hoveredSystem && !isHighlighted ? 0.05 : 0.25}
                  filter={isHighlighted ? `url(#glow-${sys.id})` : undefined}
                />
                {/* Dots at vertices */}
                {coords.map((c, i) => (
                  <circle
                    key={`dot-${sys.id}-${i}`}
                    cx={c.x}
                    cy={c.y}
                    r={isHighlighted ? 4 : 2.5}
                    fill={colors.dot}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-[11px] text-slate-500 mt-2 text-center">
        * เปรียบเทียบสมรรถนะทั้ง 5 มิติจากข้อมูลจริงใน Google Sheet (คลิกป้ายเพื่อไฮไลท์หรือเลือกดูรายละเอียด)
      </p>
    </div>
  );
};
