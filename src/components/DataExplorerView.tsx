import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { DashboardDataset } from '../types/dashboard';
import { DateMonthFilterBar } from './DateMonthFilterBar';
import { normalizeDate, getMonthFromDate } from '../utils/dateUtils';

interface DataExplorerViewProps {
  data: DashboardDataset;
  selectedMonth: string;
  selectedDate: string;
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  initialSystemFilter?: string;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  data,
  selectedMonth,
  selectedDate,
  onMonthChange,
  onDateChange,
  initialSystemFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'sys2' | 'sys5' | 'sys8' | 'sys9'>(
    initialSystemFilter === 'ระบบที่ 5'
      ? 'sys5'
      : initialSystemFilter === 'ระบบที่ 8'
      ? 'sys8'
      : initialSystemFilter === 'ระบบที่ 9'
      ? 'sys9'
      : 'sys2'
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Selected row for full detail modal
  const [detailModal, setDetailModal] = useState<any | null>(null);

  // Filter current dataset
  let currentRows: any[] = [];
  if (activeTab === 'sys2') {
    currentRows = data.system2.filter((r) => {
      const matchDate = selectedDate === 'all' || normalizeDate(r.date) === normalizeDate(selectedDate);
      const matchMonth = selectedMonth === 'all' || r.month === selectedMonth;
      const matchSearch =
        !search ||
        r.content.toLowerCase().includes(search.toLowerCase()) ||
        r.speaker.toLowerCase().includes(search.toLowerCase()) ||
        r.commType.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchMonth && matchSearch;
    });
  } else if (activeTab === 'sys5') {
    currentRows = data.system5.filter((r) => {
      const matchDate = selectedDate === 'all' || normalizeDate(r.date) === normalizeDate(selectedDate);
      const matchMonth = selectedMonth === 'all' || r.month === selectedMonth;
      const matchSearch =
        !search ||
        r.issue.toLowerCase().includes(search.toLowerCase()) ||
        r.targetDept.toLowerCase().includes(search.toLowerCase()) ||
        r.leadSupervisor.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchMonth && matchSearch;
    });
  } else if (activeTab === 'sys8') {
    currentRows = data.system8.filter((r) => {
      const normTarget = normalizeDate(selectedDate);
      const matchDate =
        selectedDate === 'all' ||
        normalizeDate(r.devDate) === normTarget ||
        normalizeDate(r.cultureDate) === normTarget ||
        (getMonthFromDate(selectedDate) === r.month);
      const matchMonth = selectedMonth === 'all' || r.month === selectedMonth;
      const matchSearch =
        !search ||
        r.engActivity.toLowerCase().includes(search.toLowerCase()) ||
        r.devActivity.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchMonth && matchSearch;
    });
  } else if (activeTab === 'sys9') {
    currentRows = data.system9.filter((r) => {
      const matchDate = selectedDate === 'all' || normalizeDate(r.date) === normalizeDate(selectedDate);
      const matchMonth = selectedMonth === 'all' || getMonthFromDate(r.date) === selectedMonth;
      const matchSearch =
        !search ||
        r.projectName.toLowerCase().includes(search.toLowerCase()) ||
        r.activity.toLowerCase().includes(search.toLowerCase());
      return matchDate && matchMonth && matchSearch;
    });
  }

  const totalPages = Math.max(1, Math.ceil(currentRows.length / pageSize));
  const paginatedRows = currentRows.slice((page - 1) * pageSize, page * pageSize);

  // Export current table to CSV
  const handleExportCSV = () => {
    if (currentRows.length === 0) return;
    const headers = Object.keys(currentRows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        headers.join(','),
        ...currentRows.map((row) =>
          headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bme_${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl space-y-4">
      {/* Date & Month Global Filter Bar */}
      <DateMonthFilterBar
        data={data}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        onMonthChange={(m) => {
          onMonthChange(m);
          setPage(1);
        }}
        onDateChange={(d) => {
          onDateChange(d);
          setPage(1);
        }}
      />

      {/* Table Navigation Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTab('sys2');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'sys2'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ระบบที่ 2 ({data.system2.length.toLocaleString()})
          </button>
          <button
            onClick={() => {
              setActiveTab('sys5');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'sys5'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ระบบที่ 5 ({data.system5.length.toLocaleString()})
          </button>
          <button
            onClick={() => {
              setActiveTab('sys8');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'sys8'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ระบบที่ 8 ({data.system8.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('sys9');
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'sys9'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ระบบที่ 9 ({data.system9.length})
          </button>
        </div>

        {/* Controls: Search & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาในตารางนี้..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-white text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-emerald-500 outline-none w-48 sm:w-60"
            />
          </div>

          <button
            onClick={handleExportCSV}
            title="ดาวน์โหลดไฟล์ CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {activeTab === 'sys2' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">เดือน/วันที่</th>
                  <th className="py-2.5 px-3">เวลา</th>
                  <th className="py-2.5 px-3">ความสำคัญ</th>
                  <th className="py-2.5 px-3">เนื้อหาการสื่อสาร</th>
                  <th className="py-2.5 px-3">ผู้ถ่ายทอด</th>
                  <th className="py-2.5 px-3">ช่องทาง</th>
                  <th className="py-2.5 px-3 text-right">รับทราบ (%)</th>
                  <th className="py-2.5 px-3">ผู้กำกับติดตาม</th>
                  <th className="py-2.5 px-3 text-center">ดู</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {paginatedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-white font-medium">{r.month}</div>
                      <div className="text-[10px] text-slate-500">{r.date}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{r.time}</td>
                    <td className="py-2.5 px-3">
                      {r.isUrgent ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          เร่งด่วน
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-slate-400">แจ้งเพื่อทราบ</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-200" title={r.content}>
                      {r.content}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">{r.speaker}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                      {r.channelMorning && 'Morning, '}
                      {r.channelLine && 'Line, '}
                      {r.channelMSTeams && 'Teams'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                      {r.ackRatePercent}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[120px]">
                      {r.supervisor}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setDetailModal(r)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sys5' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">เดือน/วันที่</th>
                  <th className="py-2.5 px-3">สถานที่/หน่วยงาน</th>
                  <th className="py-2.5 px-3">ประเด็น/ข้อร้องเรียน</th>
                  <th className="py-2.5 px-3">ระดับความรุนแรง</th>
                  <th className="py-2.5 px-3">กรอบเวลา</th>
                  <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                  <th className="py-2.5 px-3 text-center">ดู</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {paginatedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono">
                      <div className="text-white font-medium">{r.month}</div>
                      <div className="text-[10px] text-slate-500">{r.date}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{r.targetDept || r.department}</td>
                    <td className="py-2.5 px-3 max-w-sm truncate text-slate-200" title={r.issue}>
                      {r.issue}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.severityLevel === 'G-I'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : r.severityLevel === 'D-F'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {r.severityLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{r.resolutionTimeframe}</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.leadSupervisor}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setDetailModal(r)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sys8' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">เดือน</th>
                  <th className="py-2.5 px-3">กิจกรรมความผูกพัน</th>
                  <th className="py-2.5 px-3">เข้าร่วม/ไม่ร่วม</th>
                  <th className="py-2.5 px-3">ความพึงพอใจ</th>
                  <th className="py-2.5 px-3">กิจกรรมพัฒนาคน</th>
                  <th className="py-2.5 px-3">วัฒนธรรม</th>
                  <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {paginatedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-white font-medium">{r.month}</td>
                    <td className="py-2.5 px-3 font-semibold text-purple-300">{r.engActivity}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {r.engJoined} / {r.engJoined + r.engNotJoined}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{r.engTotalPct}%</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.devActivity}</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.cultureActivity}</td>
                    <td className="py-2.5 px-3 text-slate-400">{r.engResponsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sys9' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ว/ด/ป</th>
                  <th className="py-2.5 px-3">ชื่อโครงการ Best Practice</th>
                  <th className="py-2.5 px-3">เป้าหมาย (Target)</th>
                  <th className="py-2.5 px-3">ผลลัพธ์เดือนที่ 1</th>
                  <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                  <th className="py-2.5 px-3 text-center">ดูขั้นตอน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {paginatedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-white">{r.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-300">{r.projectName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{r.target}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{r.resultM1 || '100%'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{r.responsible}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setDetailModal(r)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            แสดง {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, currentRows.length)} จากทั้งหมด{' '}
            {currentRows.length.toLocaleString()} แถว
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-200">
              หน้า {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">รายละเอียดข้อมูลในระบบ</h3>
              <button
                onClick={() => setDetailModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              {Object.entries(detailModal).map(([key, val]) => {
                if (typeof val === 'boolean') {
                  val = val ? 'ใช่ / TRUE' : 'ไม่ / FALSE';
                }
                return (
                  <div key={key} className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">{key}</span>
                    <span className="text-xs text-white mt-0.5 block whitespace-pre-wrap">{String(val || '-')}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
