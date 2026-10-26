import React from 'react';
import {
  FileText,
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  Database,
  ExternalLink,
  Sparkles,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  spreadsheetId: string;
  appsScriptUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  spreadsheetId,
  appsScriptUrl,
}) => {
  const navTabs = [
    { id: 'onepage', label: 'One-Page สรุปผู้บริหาร', icon: FileText, badge: 'Official' },
    { id: 'analytics', label: 'แดชบอร์ดวิเคราะห์สด', icon: LayoutDashboard },
    { id: 'comparison', label: 'เปรียบเทียบแต่ละระบบ', icon: BarChart3, badge: 'Radar' },
    { id: 'predictive', label: 'การวิเคราะห์เชิงทำนาย', icon: BrainCircuit, badge: 'AI/สถิติ' },
    { id: 'data', label: 'ตารางข้อมูลดิบ (1,180+)', icon: Database },
  ];

  return (
    <header className="bg-slate-950/80 border-b border-slate-800/80 no-print">
      {/* Top hospital banner */}
      <div className="bg-[#0b101d] border-b border-slate-900 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">Cluster Department / BME Healthcare Unit</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-amber-400/90 hidden sm:inline flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> PHQ Spirit : มืออาชีพ วินัยมั่น ร่วมมือกัน สู่เส้นชัย
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10.5px]">
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
            >
              <span>Sheet ID: {spreadsheetId.slice(0, 10)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">|</span>
            <a
              href={appsScriptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition flex items-center gap-1"
            >
              <span>Apps Script Exec</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main branding & navigation bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 p-0.5 shadow-lg shadow-emerald-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-tight">
                BME Executive One-Page Dashboard
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ศูนย์รวมข้อมูลเรียลไทม์ 4 ระบบคุณภาพ (ระบบที่ 2, ระบบที่ 5, ระบบที่ 8, ระบบที่ 9)
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
