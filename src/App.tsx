import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { SyncBanner } from './components/SyncBanner';
import { OnePageExecutiveView } from './components/OnePageExecutiveView';
import { InteractiveAnalyticsView } from './components/InteractiveAnalyticsView';
import { SystemComparisonView } from './components/SystemComparisonView';
import { PredictiveAnalyticsView } from './components/PredictiveAnalyticsView';
import { DataExplorerView } from './components/DataExplorerView';
import { DashboardDataset } from './types/dashboard';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<DashboardDataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('onepage');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [syncIntervalSec, setSyncIntervalSec] = useState<number>(30); // default 30s auto-sync
  const [systemFilterForData, setSystemFilterForData] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch data from API
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsSyncing(true);
    }

    try {
      const url = `/api/sheets/summary${isManual ? '?force=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json: DashboardDataset = await res.json();
      setData(json);
      setError(null);
      if (isManual) {
        showToast('ซิงค์ข้อมูลสดจาก Google Sheet สำเร็จเรียบร้อย!');
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.1, x: 0.8 },
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'ไม่สามารถเชื่อมต่อ Google Sheet ได้');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Automated synchronization timer
  useEffect(() => {
    if (syncIntervalSec <= 0) return;

    const timer = setInterval(() => {
      fetchData(false);
    }, syncIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [syncIntervalSec, fetchData]);

  const [onePageSystemView, setOnePageSystemView] = useState<'all' | 'sys2' | 'sys5' | 'sys8' | 'sys9'>('all');

  const handleNavigateTab = (tabId: string, systemFilter?: string) => {
    setActiveTab(tabId);
    if (tabId === 'onepage') {
      if (systemFilter === 'sys2' || systemFilter === 'sys5' || systemFilter === 'sys8' || systemFilter === 'sys9' || systemFilter === 'all') {
        setOnePageSystemView(systemFilter);
      }
    } else if (systemFilter) {
      setSystemFilterForData(systemFilter);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sheets/sync', { method: 'POST' });
      await fetchData(true);
    } catch {
      await fetchData(true);
    }
  };

  // Loading Screen
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-pulse mb-6">
          <RefreshCw className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          กำลังเชื่อมต่อ Google Sheet และประมวลผลข้อมูล...
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          ดึงข้อมูลระบบที่ 2, 5, 8, 9 (สเปรดชีท ID: 1ya9jpaJzy_S8--d6fw3IScS2PS-acdE06J5ySBbdpNA)
        </p>
      </div>
    );
  }

  // Error State with Retry
  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">เกิดข้อผิดพลาดในการเชื่อมต่อ</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition cursor-pointer"
          >
            ลองเชื่อมต่อใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalRecords =
    data.system2.length + data.system5.length + data.system8.length + data.system9.length;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        spreadsheetId={data.spreadsheetId}
        appsScriptUrl={data.appsScriptUrl}
      />

      {/* Real-time Sync Status Bar */}
      <SyncBanner
        lastSynced={data.lastSynced}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        syncIntervalSec={syncIntervalSec}
        onIntervalChange={setSyncIntervalSec}
        totalRecords={totalRecords}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col items-center">
        {activeTab === 'onepage' && (
          <OnePageExecutiveView
            data={data}
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
            onMonthChange={setSelectedMonth}
            onDateChange={setSelectedDate}
            onNavigateTab={handleNavigateTab}
            initialSystemView={onePageSystemView}
          />
        )}

        {activeTab === 'analytics' && (
          <InteractiveAnalyticsView
            data={data}
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
            onMonthChange={setSelectedMonth}
            onDateChange={setSelectedDate}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'comparison' && (
          <SystemComparisonView data={data} onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'predictive' && (
          <PredictiveAnalyticsView data={data} onNavigateTab={handleNavigateTab} />
        )}

        {activeTab === 'data' && (
          <DataExplorerView
            data={data}
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
            onMonthChange={setSelectedMonth}
            onDateChange={setSelectedDate}
            initialSystemFilter={systemFilterForData}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Cluster Department / BME Healthcare Unit • ระบบกำกับติดตามคุณภาพมาตรฐานโรงพยาบาล
          </span>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>ระบบที่ 2, 5, 8, 9</span>
            <span>•</span>
            <span className="text-emerald-400">ซิงค์สด Google Sheet ฟรีไม่มีค่าใช้จ่าย</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
