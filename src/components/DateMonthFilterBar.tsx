import React from 'react';
import { Calendar, Clock, RotateCcw, X, Filter } from 'lucide-react';
import {
  normalizeDate,
  formatThaiDateReadable,
  getMonthFromDate,
  normalizeThaiMonth,
  sortThaiMonths,
  sortDatesChronologically,
} from '../utils/dateUtils';
import { DashboardDataset } from '../types/dashboard';

interface DateMonthFilterBarProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string; // 'all' or '02/03/2026'
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  className?: string;
  compact?: boolean;
}

export const DateMonthFilterBar: React.FC<DateMonthFilterBarProps> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
  className = '',
  compact = false,
}) => {
  // Deduplicate & sort available months chronologically in Thai calendar order (ม.ค. -> ธ.ค.)
  // Also scan dataset to ensure all months present in rows are included
  const allMonthsSet = new Set<string>();
  (data.monthsAvailable || []).forEach((m) => {
    const norm = normalizeThaiMonth(m);
    if (norm) allMonthsSet.add(norm);
  });
  data.system2.forEach((r) => {
    const norm = normalizeThaiMonth(r.month);
    if (norm) allMonthsSet.add(norm);
  });
  data.system5.forEach((r) => {
    const norm = normalizeThaiMonth(r.month);
    if (norm) allMonthsSet.add(norm);
  });
  data.system8.forEach((r) => {
    const norm = normalizeThaiMonth(r.month);
    if (norm) allMonthsSet.add(norm);
  });

  const sortedUniqueMonths = sortThaiMonths(Array.from(allMonthsSet));

  // Collect all distinct normalized dates from dataset
  const dateSet = new Set<string>();
  data.system2.forEach((r) => r.date && dateSet.add(normalizeDate(r.date)));
  data.system5.forEach((r) => r.date && dateSet.add(normalizeDate(r.date)));
  data.system9.forEach((r) => r.date && dateSet.add(normalizeDate(r.date)));

  // Convert to sorted array chronologically
  const allDates = sortDatesChronologically(Array.from(dateSet));

  // Filter dates that match the selected month
  const availableDatesForMonth = allDates.filter((d) => {
    if (selectedMonth === 'all') return true;
    const m = getMonthFromDate(d);
    return normalizeThaiMonth(m || '') === normalizeThaiMonth(selectedMonth);
  });

  const handleMonthSelect = (m: string) => {
    const normM = m === 'all' ? 'all' : normalizeThaiMonth(m);
    onMonthChange(normM);
    // If selectedDate doesn't belong to the new month, reset to 'all'
    if (selectedDate !== 'all' && normM !== 'all') {
      const dateMonth = getMonthFromDate(selectedDate);
      if (normalizeThaiMonth(dateMonth || '') !== normM) {
        onDateChange('all');
      }
    }
  };

  const handleDateSelect = (d: string) => {
    onDateChange(d);
    if (d !== 'all') {
      const monthOfDate = getMonthFromDate(d);
      if (monthOfDate) {
        const normMonthOfDate = normalizeThaiMonth(monthOfDate);
        if (normalizeThaiMonth(selectedMonth) !== normMonthOfDate) {
          onMonthChange(normMonthOfDate);
        }
      }
    }
  };

  const handleReset = () => {
    onMonthChange('all');
    onDateChange('all');
  };

  const hasActiveFilter = selectedMonth !== 'all' || selectedDate !== 'all';

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-2.5 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Month Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">เดือน:</span>
          <select
            value={normalizeThaiMonth(selectedMonth) || 'all'}
            onChange={(e) => handleMonthSelect(e.target.value)}
            aria-label="เลือกเดือน"
            className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">
              ทุกเดือนสะสม (All Months)
            </option>
            {sortedUniqueMonths.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white">
                ประจำเดือน {m}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">วันที่:</span>
          <select
            value={selectedDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            aria-label="เลือกวันที่"
            className="bg-transparent text-blue-300 text-xs font-bold outline-none cursor-pointer max-w-[200px] truncate"
          >
            <option value="all" className="bg-slate-900 text-white">
              {selectedMonth === 'all' ? 'ทุกวันสะสม (All Days)' : `ทุกวันในเดือน${selectedMonth}`}
            </option>
            {availableDatesForMonth.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d} ({formatThaiDateReadable(d)})
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Badge */}
        {hasActiveFilter && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">
              {selectedDate !== 'all'
                ? `วันที่ ${selectedDate} (${formatThaiDateReadable(selectedDate)})`
                : `เดือน ${selectedMonth}`}
            </span>
            <button
              onClick={handleReset}
              title="ล้างตัวกรองกลับสู่ภาพรวม"
              className="text-emerald-400 hover:text-white ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Reset button */}
      {hasActiveFilter && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer border border-slate-700"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>ล้างตัวกรอง</span>
        </button>
      )}
    </div>
  );
};
