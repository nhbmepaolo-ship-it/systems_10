import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, ExternalLink, CheckCircle2, Clock, Zap, ShieldCheck } from 'lucide-react';

interface SyncBannerProps {
  lastSynced: string;
  isSyncing: boolean;
  onManualSync: () => void;
  syncIntervalSec: number;
  onIntervalChange: (sec: number) => void;
  totalRecords: number;
}

export const SyncBanner: React.FC<SyncBannerProps> = ({
  lastSynced,
  isSyncing,
  onManualSync,
  syncIntervalSec,
  onIntervalChange,
  totalRecords,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('เมื่อสักครู่');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSynced) return;
      const diffSec = Math.floor((Date.now() - new Date(lastSynced).getTime()) / 1000);
      if (diffSec < 5) setTimeAgo('เมื่อสักครู่');
      else if (diffSec < 60) setTimeAgo(`${diffSec} วินาทีที่แล้ว`);
      else {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`${mins} นาทีที่แล้ว`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Connection Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>Google Sheet Live Sync</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(ระบบที่ 2, 5, 8, 9)</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 border-l border-slate-800 pl-3">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[11px] text-slate-300">
              {totalRecords.toLocaleString()} แถวข้อมูล
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-300 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ใช้งานฟรีถาวร
            </span>
          </div>
        </div>

        {/* Right: Controls & Timer */}
        <div className="flex items-center gap-2.5">
          {/* Last sync timestamp */}
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>อัปเดต: {timeAgo}</span>
          </div>

          {/* Interval selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded px-2 py-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400 text-[11px]">ซิงค์อัตโนมัติ:</span>
            <select
              value={syncIntervalSec}
              onChange={(e) => onIntervalChange(Number(e.target.value))}
              aria-label="เลือกความถี่การซิงค์อัตโนมัติ"
              className="bg-transparent text-slate-200 text-[11px] font-medium outline-none cursor-pointer"
            >
              <option value={15} className="bg-slate-900 text-white">ทุก 15 วินาที</option>
              <option value={30} className="bg-slate-900 text-white">ทุก 30 วินาที</option>
              <option value={60} className="bg-slate-900 text-white">ทุก 1 นาที</option>
              <option value={300} className="bg-slate-900 text-white">ทุก 5 นาที</option>
              <option value={0} className="bg-slate-900 text-white">ปิดชั่วคราว (Manual)</option>
            </select>
          </div>

          {/* Sync now button */}
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer ${
              isSyncing ? 'animate-pulse' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ทันที'}</span>
          </button>

          {/* External Sheet Link */}
          <a
            href="https://docs.google.com/spreadsheets/d/1ya9jpaJzy_S8--d6fw3IScS2PS-acdE06J5ySBbdpNA/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            title="เปิด Google Spreadsheet ต้นทาง"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white transition text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline">เปิดสเปรดชีท</span>
          </a>
        </div>
      </div>
    </div>
  );
};
