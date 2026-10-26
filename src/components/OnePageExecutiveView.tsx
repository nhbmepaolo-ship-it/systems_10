import React, { useState } from 'react';
import {
  FileText,
  Layers,
  MessageSquare,
  ShieldAlert,
  Users,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { DashboardDataset } from '../types/dashboard';
import { OnePageAllSystems } from './onepage/OnePageAllSystems';
import { OnePageSystem2 } from './onepage/OnePageSystem2';
import { OnePageSystem5 } from './onepage/OnePageSystem5';
import { OnePageSystem8 } from './onepage/OnePageSystem8';
import { OnePageSystem9 } from './onepage/OnePageSystem9';

interface OnePageExecutiveViewProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  onNavigateTab: (tabId: string) => void;
  initialSystemView?: 'all' | 'sys2' | 'sys5' | 'sys8' | 'sys9';
}

export const OnePageExecutiveView: React.FC<OnePageExecutiveViewProps> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
  onNavigateTab,
  initialSystemView = 'all',
}) => {
  const [activeSystemView, setActiveSystemView] = useState<'all' | 'sys2' | 'sys5' | 'sys8' | 'sys9'>(
    initialSystemView
  );

  React.useEffect(() => {
    if (initialSystemView) {
      setActiveSystemView(initialSystemView);
    }
  }, [initialSystemView]);

  const viewOptions = [
    {
      id: 'all' as const,
      label: '🌟 One-Page รวมทุกระบบ',
      desc: 'สรุปภาพรวม 4 ระบบคุณภาพผู้บริหาร',
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-500/40',
      icon: Layers,
    },
    {
      id: 'sys2' as const,
      label: '🔷 One-Page ระบบที่ 2',
      desc: 'โปสเตอร์ Infographic 4 เสาหลัก & SLA',
      color: 'bg-blue-600 text-white',
      border: 'border-blue-500/40',
      icon: MessageSquare,
      badge: `🎨 Infographic (${data.system2.length} วาระ)`,
    },
    {
      id: 'sys5' as const,
      label: '🔶 One-Page ระบบที่ 5',
      desc: 'เสียงลูกค้า & แก้ไขข้อร้องเรียน VOC',
      color: 'bg-amber-600 text-white',
      border: 'border-amber-500/40',
      icon: ShieldAlert,
      badge: `${data.system5.length} เคส`,
    },
    {
      id: 'sys8' as const,
      label: '🟣 One-Page ระบบที่ 8',
      desc: 'พัฒนาคน & วัฒนธรรม We Before Me',
      color: 'bg-purple-600 text-white',
      border: 'border-purple-500/40',
      icon: Users,
      badge: `${data.system8.length} กิจกรรม`,
    },
    {
      id: 'sys9' as const,
      label: '🟢 One-Page ระบบที่ 9',
      desc: 'Best Practice & WI ขนย้ายปลอดภัย',
      color: 'bg-teal-600 text-white',
      border: 'border-teal-500/40',
      icon: CheckCircle,
      badge: `${data.system9.length} โครงการ`,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* System Selector Header Bar (Hidden during print) */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 p-3 rounded-xl no-print shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              เลือกรูปแบบรายงาน One-Page (Executive One-Page Switcher)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            แสดง One-Page รวม หรือ แยกเฉพาะเจาะจงแต่ละระบบได้ตามต้องการ
          </span>
        </div>

        {/* System Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {viewOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeSystemView === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setActiveSystemView(opt.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                  isActive
                    ? `${opt.color} shadow-lg scale-[1.02] ring-1 ring-white/30 border-transparent`
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </div>
                </div>
                <div className={`text-[10px] line-clamp-1 ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                  {opt.desc}
                </div>
                {opt.badge && (
                  <span
                    className={`mt-1.5 text-[9px] font-mono px-1.5 py-0.2 rounded self-start ${
                      isActive ? 'bg-black/25 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER THE SELECTED ONE-PAGE DOCUMENT */}
      {activeSystemView === 'all' && (
        <OnePageAllSystems
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeSystemView === 'sys2' && (
        <OnePageSystem2
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
        />
      )}

      {activeSystemView === 'sys5' && (
        <OnePageSystem5
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
        />
      )}

      {activeSystemView === 'sys8' && (
        <OnePageSystem8
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
        />
      )}

      {activeSystemView === 'sys9' && (
        <OnePageSystem9
          data={data}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          onMonthChange={onMonthChange}
          onDateChange={onDateChange}
        />
      )}
    </div>
  );
};
