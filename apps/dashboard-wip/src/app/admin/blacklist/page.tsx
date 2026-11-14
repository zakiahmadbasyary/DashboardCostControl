"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Ban,
  Plus,
  Trash2,
  Save,
  ClipboardList,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Info,
} from "lucide-react";

interface ExcludedItem {
  id: number;
  kodeAktivitas: string;
  deskripsi: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InputRow {
  id: string;
  kodeAktivitas: string;
  deskripsi: string;
}

export default function AdminBlacklistPage() {
  // Existing data from database
  const [excludedList, setExcludedList] = useState<ExcludedItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Input rows state (default 3 empty rows)
  const [inputRows, setInputRows] = useState<InputRow[]>([
    { id: "1", kodeAktivitas: "", deskripsi: "" },
    { id: "2", kodeAktivitas: "", deskripsi: "" },
    { id: "3", kodeAktivitas: "", deskripsi: "" },
  ]);

  // Quick Paste modal state
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pasteText, setPasteText] = useState<string>("");

  // Action states
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Fetch excluded activities
  const fetchExcludedList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/excluded-activities", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setExcludedList(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar blacklist:", err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchExcludedList();
  }, [fetchExcludedList]);

  // Add new rows to input table
  const handleAddRows = (count: number = 1) => {
    setInputRows((prev) => {
      const newRows: InputRow[] = [];
      for (let i = 0; i < count; i++) {
        newRows.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
          kodeAktivitas: "",
          deskripsi: "",
        });
      }
      return [...prev, ...newRows];
    });
  };

  // Remove a row from input table
  const handleRemoveRow = (id: string) => {
    setInputRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length > 0 ? filtered : [{ id: "1", kodeAktivitas: "", deskripsi: "" }];
    });
  };

  // Update a field in input table
  const handleRowChange = (id: string, field: "kodeAktivitas" | "deskripsi", value: string) => {
    setInputRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Clear all input rows
  const handleClearInputs = () => {
    setInputRows([
      { id: "1", kodeAktivitas: "", deskripsi: "" },
      { id: "2", kodeAktivitas: "", deskripsi: "" },
      { id: "3", kodeAktivitas: "", deskripsi: "" },
    ]);
  };

  // Handle Quick Paste parse
  const handleApplyPaste = () => {
    if (!pasteText.trim()) {
      setShowPasteModal(false);
      return;
    }

    const lines = pasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsedRows: InputRow[] = [];

    for (const line of lines) {
      // Split by tab, comma, or semicolon
      let parts: string[] = [];
      if (line.includes("\t")) {
        parts = line.split("\t");
      } else if (line.includes(";")) {
        parts = line.split(";");
      } else if (line.includes(",")) {
        parts = line.split(",");
      } else {
        // Space separated if only 2 words or single code
        const trimmed = line.trim();
        const firstSpace = trimmed.indexOf(" ");
        if (firstSpace > -1) {
          parts = [trimmed.slice(0, firstSpace), trimmed.slice(firstSpace + 1)];
        } else {
          parts = [trimmed];
        }
      }

      const kode = (parts[0] || "").trim();
      const deskripsi = (parts.slice(1).join(" ") || "").trim();

      if (kode) {
        parsedRows.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          kodeAktivitas: kode,
          deskripsi: deskripsi || kode,
        });
      }
    }

    if (parsedRows.length > 0) {
      // Filter out existing blank rows
      const existingNonEmpty = inputRows.filter((r) => r.kodeAktivitas.trim() || r.deskripsi.trim());
      setInputRows([...existingNonEmpty, ...parsedRows]);
      setMessage({
        type: "success",
        text: `Berhasil menempelkan ${parsedRows.length} baris aktivitas ke form.`,
      });
    }

    setPasteText("");
    setShowPasteModal(false);
  };

  // Count valid rows ready to save
  const validRowsToSave = useMemo(() => {
    return inputRows.filter((r) => r.kodeAktivitas.trim().length > 0);
  }, [inputRows]);

  // Save all valid rows to database
  const handleSaveAll = async () => {
    if (validRowsToSave.length === 0) {
      setMessage({ type: "error", text: "Mohon isi setidaknya satu kode aktivitas." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        items: validRowsToSave.map((r) => ({
          kodeAktivitas: r.kodeAktivitas.trim(),
          deskripsi: r.deskripsi.trim() || r.kodeAktivitas.trim(),
        })),
      };

      const res = await fetch("/api/admin/excluded-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: json.message || "Aktivitas berhasil disimpan." });
        handleClearInputs();
        await fetchExcludedList();
      } else {
        setMessage({ type: "error", text: json.message || "Gagal menyimpan aktivitas." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan saat menyimpan data." });
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (item: ExcludedItem) => {
    try {
      const res = await fetch("/api/admin/excluded-activities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setExcludedList((prev) =>
          prev.map((el) => (el.id === item.id ? { ...el, isActive: !el.isActive } : el))
        );
      }
    } catch (err) {
      console.error("Gagal mengubah status:", err);
    }
  };

  // Delete single item
  const handleDeleteSingle = async (item: ExcludedItem) => {
    if (!confirm(`Hapus aktivitas '${item.kodeAktivitas} - ${item.deskripsi}' dari daftar blacklist?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/excluded-activities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [item.id] }),
      });
      const json = await res.json();
      if (json.success) {
        setExcludedList((prev) => prev.filter((el) => el.id !== item.id));
        setSelectedIds((prev) => prev.filter((id) => id !== item.id));
        setMessage({ type: "success", text: `Aktivitas ${item.kodeAktivitas} berhasil dihapus.` });
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  // Bulk delete selected items
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} aktivitas terpilih dari daftar blacklist?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/excluded-activities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (json.success) {
        setExcludedList((prev) => prev.filter((el) => !selectedIds.includes(el.id)));
        setSelectedIds([]);
        setMessage({ type: "success", text: json.message || "Aktivitas terpilih berhasil dihapus." });
      }
    } catch (err) {
      console.error("Gagal menghapus masal:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle select all checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredList.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Filtered blacklist data for table
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return excludedList;
    const q = searchQuery.toLowerCase().trim();
    return excludedList.filter(
      (item) =>
        item.kodeAktivitas.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q)
    );
  }, [excludedList, searchQuery]);

  const activeCount = useMemo(() => excludedList.filter((i) => i.isActive).length, [excludedList]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-100 shrink-0">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
              Manajemen Blacklist Aktivitas
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6B63] mt-0.5">
              Sembunyikan aktivitas tertentu dari dashboard publik (Aktivitas Lapangan &amp; Detail Aktivitas). Kuncian filter murni menggunakan <strong className="text-[#17231B]">Kode Aktivitas</strong>.
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF] text-xs">
            <span className="text-[#5F6B63]">Total Blacklist: </span>
            <span className="font-extrabold text-[#16823B]">{excludedList.length}</span>
            <span className="text-[#89938D] mx-1">&bull;</span>
            <span className="font-bold text-red-600">{activeCount} Aktif Disembunyikan</span>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-semibold transition-all ${
            message.type === "success"
              ? "bg-[#16823B]/10 border-[#16823B]/30 text-[#0B6B32]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16823B]" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Form Input Sekaligus (Multi-Row Table Form) */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17231B] flex items-center gap-2">
              <span>Form Input Aktivitas Blacklist</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                Multi-Input Langsung
              </span>
            </h2>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Ketik langsung kode &amp; deskripsi pada baris di bawah, atau gunakan fitur Tempel Cepat dari clipboard.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F9F7] hover:bg-[#EAEAEA] border border-[#DDE5DF] text-xs font-bold text-[#17231B] transition-colors cursor-pointer"
              title="Copy paste beberapa baris sekaligus dari spreadsheet / catatan"
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#16823B]" />
              <span>Tempel Cepat (Quick Paste)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddRows(1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F7F9F7] hover:bg-[#EAEAEA] border border-[#DDE5DF] text-xs font-bold text-[#17231B] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#16823B]" />
              <span>+1 Baris</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddRows(5)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F7F9F7] hover:bg-[#EAEAEA] border border-[#DDE5DF] text-xs font-bold text-[#17231B] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#16823B]" />
              <span>+5 Baris</span>
            </button>
            {inputRows.length > 3 && (
              <button
                type="button"
                onClick={handleClearInputs}
                className="px-2.5 py-1.5 rounded-xl text-xs text-[#89938D] hover:text-red-600 transition-colors cursor-pointer"
              >
                Reset Form
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Rows Input Table */}
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold text-[10px] border-b border-[#DDE5DF]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center text-[#89938D]">No</th>
                <th className="py-2.5 px-3 w-56">
                  Kode Aktivitas <span className="text-red-500">*</span>
                  <span className="block text-[9px] font-normal normal-case text-[#89938D]">Kuncian Utama Filter</span>
                </th>
                <th className="py-2.5 px-3">
                  Deskripsi Aktivitas
                  <span className="block text-[9px] font-normal normal-case text-[#89938D]">Nama / Keterangan Tampilan</span>
                </th>
                <th className="py-2.5 px-2 w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
              {inputRows.map((row, idx) => {
                const isFilled = row.kodeAktivitas.trim().length > 0;
                return (
                  <tr key={row.id} className={isFilled ? "bg-[#16823B]/5" : ""}>
                    <td className="py-2 px-3 text-center text-[#89938D] font-mono font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.kodeAktivitas}
                        onChange={(e) => handleRowChange(row.id, "kodeAktivitas", e.target.value)}
                        placeholder="Misal: 1113131119"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] font-mono font-bold text-xs text-[#17231B] focus:outline-none focus:ring-1 focus:ring-[#16823B] focus:border-[#16823B] bg-white uppercase"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.deskripsi}
                        onChange={(e) => handleRowChange(row.id, "deskripsi", e.target.value)}
                        placeholder="Misal: Pembajakan penutupan parit"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#DDE5DF] text-xs text-[#17231B] focus:outline-none focus:ring-1 focus:ring-[#16823B] focus:border-[#16823B] bg-white"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1 rounded-md text-[#89938D] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#5F6B63] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#16823B] shrink-0" />
            <span>
              {validRowsToSave.length > 0 ? (
                <>Siap menyimpan <strong className="text-[#16823B]">{validRowsToSave.length} aktivitas</strong> ke daftar blacklist.</>
              ) : (
                <>Isi minimal satu kolom <strong className="text-[#17231B]">Kode Aktivitas</strong> untuk menyimpan.</>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || validRowsToSave.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#16823B] hover:bg-[#11672E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua ({validRowsToSave.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 2: Tabel Daftar Blacklist yang Tersimpan */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE5DF] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#17231B] flex items-center gap-2">
              <span>Daftar Aktivitas yang Sedang Disembunyikan</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F7F9F7] border border-[#DDE5DF] text-[#16823B] font-bold">
                {filteredList.length} Data
              </span>
            </h2>
            <p className="text-xs text-[#5F6B63] mt-0.5">
              Seluruh aktivitas dengan kode aktif di bawah ini otomatis tidak ditampilkan pada dashboard.
            </p>
          </div>

          {/* Search & Bulk Delete */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteBulk}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#89938D] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode / deskripsi..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#DDE5DF] text-xs text-[#17231B] focus:outline-none focus:ring-1 focus:ring-[#16823B] bg-white w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        {loadingList ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 border-[#16823B] animate-spin mx-auto text-[#16823B] mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat data blacklist aktivitas...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F9F7] rounded-xl border border-dashed border-[#DDE5DF]">
            <ShieldAlert className="w-6 h-6 text-[#89938D] mx-auto mb-2" />
            <h4 className="font-bold text-xs text-[#17231B]">
              {searchQuery ? "Tidak ditemukan aktivitas yang cocok" : "Belum Ada Aktivitas yang Disembunyikan"}
            </h4>
            <p className="text-[11px] text-[#5F6B63] mt-0.5 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada data blacklist dengan kata kunci '${searchQuery}'.`
                : "Semua aktivitas saat ini ditampilkan normal pada dashboard publik."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold text-[10px] border-b border-[#DDE5DF]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-[#DDE5DF] text-[#16823B] focus:ring-[#16823B] cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 w-12 text-center text-[#89938D]">No</th>
                  <th className="py-2.5 px-3 w-48">Kode Aktivitas</th>
                  <th className="py-2.5 px-3">Deskripsi Aktivitas</th>
                  <th className="py-2.5 px-3 w-36">Waktu Dibuat</th>
                  <th className="py-2.5 px-3 w-36 text-center">Status Filter</th>
                  <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5DF]/60 bg-white">
                {filteredList.map((item, idx) => {
                  const isChecked = selectedIds.includes(item.id);
                  const dateStr = new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F7F9F7] transition-colors ${
                        !item.isActive ? "opacity-60 bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, item.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                          className="rounded border-[#DDE5DF] text-[#16823B] focus:ring-[#16823B] cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 text-center text-[#89938D] font-mono font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-xs text-[#17231B]">
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                          {item.kodeAktivitas}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-xs text-[#17231B]">
                        {item.deskripsi}
                      </td>
                      <td className="py-2 px-3 text-[#5F6B63] text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            item.isActive
                              ? "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                          }`}
                          title="Klik untuk mengubah status aktif / nonaktif"
                        >
                          {item.isActive ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5 text-red-600" />
                              <span>Disembunyikan</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5 text-gray-500" />
                              <span>Nonaktif (Tampil)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(item)}
                          className="p-1.5 rounded-lg text-[#89938D] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus dari daftar blacklist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Quick Paste from Clipboard */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DDE5DF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDE5DF] pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#16823B]" />
                <h3 className="font-extrabold text-base text-[#17231B]">Tempel Cepat (Quick Paste)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="p-1 text-[#89938D] hover:text-[#17231B] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5F6B63]">
              Salin (*copy*) daftar data Kode &amp; Deskripsi dari Excel, Notepad, atau chat, lalu tempelkan (*paste*) ke kotak di bawah. Sistem akan otomatis memisahkan Kode dan Deskripsinya per baris.
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Contoh format (bisa tab atau koma):\n1113131119\tPembajakan penutupan parit\n1113131120\tPembersihan saluran parit\n1113131121\tPenyemprotan gulma`}
              className="w-full p-3 rounded-xl border border-[#DDE5DF] font-mono text-xs text-[#17231B] focus:outline-none focus:ring-1 focus:ring-[#16823B] focus:border-[#16823B] bg-[#F7F9F7]"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DDE5DF]">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6B63] hover:bg-[#F7F9F7] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyPaste}
                disabled={!pasteText.trim()}
                className="px-4 py-2 rounded-xl bg-[#16823B] hover:bg-[#11672E] disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Terapkan ke Form Input
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

