"use client";

import { useState, useEffect } from "react";
import { activityLogService } from "@/services/activityLogService";
import { ActivityLogItem, LogFilter } from "@/types/activityLog";
import { Search, Filter, ShieldCheck } from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [filterState, setFilterState] = useState<LogFilter>({
    admin: "all",
    action: "all",
    dataSource: "all",
    searchQuery: "",
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await activityLogService.getLogs(filterState);
        setLogs(res);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filterState]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Log Aktivitas Admin</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Catatan riwayat operasi penting seperti upload data, penggantian file, dan autentikasi admin.
        </p>
      </div>

      {/* Log Filter & Search */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-[#16823B]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#17231B]">Filter Log Aktivitas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Admin</label>
            <select
              value={filterState.admin}
              onChange={(e) => setFilterState((p) => ({ ...p, admin: e.target.value }))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B]"
            >
              <option value="all">Semua Admin</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Jenis Aktivitas</label>
            <select
              value={filterState.action}
              onChange={(e) => setFilterState((p) => ({ ...p, action: e.target.value }))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B]"
            >
              <option value="all">Semua Aktivitas</option>
              <option value="LOGIN">LOGIN</option>
              <option value="UPLOAD_DATA">UPLOAD_DATA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Sumber Data</label>
            <select
              value={filterState.dataSource}
              onChange={(e) => setFilterState((p) => ({ ...p, dataSource: e.target.value }))}
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl px-3 py-2 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B]"
            >
              <option value="all">Semua Sumber</option>
              <option value="Data Lokasi">Data Lokasi</option>
              <option value="Data SBT">Data SBT</option>
              <option value="Data Aktivitas">Data Aktivitas</option>
              <option value="-">-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5F6B63] mb-1">Pencarian</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterState.searchQuery}
                onChange={(e) => setFilterState((p) => ({ ...p, searchQuery: e.target.value }))}
                placeholder="Cari deskripsi..."
                className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B]"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat log aktivitas...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
            <p className="text-xs text-[#5F6B63]">Tidak ada log aktivitas yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF] mt-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Aktivitas</th>
                  <th className="py-3 px-4">Sumber Data</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Keterangan Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F9F7]">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5F6B63]">{item.timestamp}</td>
                    <td className="py-3 px-4 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16823B]" />
                      {item.adminUsername}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#16823B]/10 text-[#16823B] font-bold text-[10px] border border-[#16823B]/20">
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{item.dataSource}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5F6B63]">{item.fileName || "-"}</td>
                    <td className="py-3 px-4 text-[#17231B]">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
