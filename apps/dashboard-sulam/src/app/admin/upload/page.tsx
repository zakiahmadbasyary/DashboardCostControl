"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  ArrowRight,
  Database,
  Layers,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";

interface UploadStatus {
  status: "idle" | "reading" | "saving" | "success" | "error";
  message: string;
  progress: number;
  result?: {
    totalRows: number;
    validRows: number;
    summaryCount: number;
    errorCount: number;
    sampleErrors?: { row: number; error: string }[];
  };
}

export default function SulamAdminUploadPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    message: "",
    progress: 0,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    try {
      setUploadStatus({
        status: "reading",
        message: `Membaca file ${file.name}...`,
        progress: 25,
      });

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: false });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("File Excel tidak memiliki lembar kerja (sheet).");
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      if (!rawRows || rawRows.length === 0) {
        throw new Error("Tidak ada data dalam lembar kerja Excel ini.");
      }

      setUploadStatus({
        status: "saving",
        message: `Mengirim ${rawRows.length.toLocaleString("id-ID")} baris data ke database (Mode Replace All)...`,
        progress: 60,
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: rawRows }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || "Gagal menyimpan data ke database.");
      }

      setUploadStatus({
        status: "success",
        message: resJson.message,
        progress: 100,
        result: resJson.data,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus({
        status: "error",
        message: err.message || "Terjadi kesalahan saat memproses file Excel.",
        progress: 100,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#17231B] tracking-tight">Upload Data Sulam</h1>
            <p className="text-sm text-[#5F6B63] mt-1">
              Unggah file transaksi Excel untuk memperbarui database operasional dan rekapitulasi summary Sulam.
            </p>
          </div>
          <Link
            href="/admin/preview"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] transition-colors border border-[#CBE0D1]"
          >
            <span>Lihat Preview Data</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info Banner Mode Replace All */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong className="font-bold">Mode Aktif: Replace Keseluruhan Data (Replace All).</strong>
          <p className="mt-0.5 text-amber-800">
            Setiap file Excel yang diunggah akan menggantikan seluruh data transaksi <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">sulam</code> dan perhitungan <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">summary_sulam</code> sebelumnya. Pastikan berkas yang diunggah berisi rekapitulasi data lengkap.
          </p>
        </div>
      </div>

      {/* Area Upload File */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] p-6 sm:p-8 shadow-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (uploadStatus.status !== "reading" && uploadStatus.status !== "saving") {
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            dragActive
              ? "border-[#16823B] bg-[#EAF3EC]"
              : "border-[#DDE5DF] hover:border-[#16823B] hover:bg-[#F7F9F7]"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3EC] text-[#16823B] flex items-center justify-center border border-[#CBE0D1] shadow-2xs">
            {uploadStatus.status === "reading" || uploadStatus.status === "saving" ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-[#17231B]">
              Tarik & Letakkan file Excel di sini, atau <span className="text-[#16823B] underline underline-offset-2">pilih file</span>
            </h3>
            <p className="text-xs text-[#5F6B63] mt-1">
              Mendukung format file spreadsheet <strong>.xlsx</strong> atau <strong>.xls</strong>
            </p>
          </div>
        </div>

        {/* Progress Bar & Status */}
        {uploadStatus.status !== "idle" && (
          <div className="mt-6 p-4 rounded-xl border border-[#DDE5DF] bg-[#F7F9F7] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                {uploadStatus.status === "reading" || uploadStatus.status === "saving" ? (
                  <RefreshCw className="w-4 h-4 text-[#16823B] animate-spin" />
                ) : uploadStatus.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={uploadStatus.status === "error" ? "text-red-700" : "text-[#17231B]"}>
                  {uploadStatus.message}
                </span>
              </span>
              <span className="text-[#5F6B63]">{uploadStatus.progress}%</span>
            </div>

            <div className="w-full bg-[#E4ECE5] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  uploadStatus.status === "error"
                    ? "bg-red-500"
                    : uploadStatus.status === "success"
                    ? "bg-[#16823B]"
                    : "bg-[#16823B]"
                }`}
                style={{ width: `${uploadStatus.progress}%` }}
              />
            </div>

            {/* Hasil Ringkasan Sukses */}
            {uploadStatus.result && (
              <div className="pt-3 border-t border-[#DDE5DF] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-[#DDE5DF]">
                  <p className="text-[#5F6B63]">Total Baris Excel</p>
                  <p className="text-base font-black text-[#17231B] mt-0.5">
                    {uploadStatus.result.totalRows.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#DDE5DF]">
                  <p className="text-[#5F6B63]">Transaksi Disimpan</p>
                  <p className="text-base font-black text-[#16823B] mt-0.5">
                    {uploadStatus.result.validRows.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#DDE5DF]">
                  <p className="text-[#5F6B63]">Kode Summary Dibuat</p>
                  <p className="text-base font-black text-[#17231B] mt-0.5">
                    {uploadStatus.result.summaryCount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#DDE5DF]">
                  <p className="text-[#5F6B63]">Baris Terlewati / Error</p>
                  <p className={`text-base font-black mt-0.5 ${uploadStatus.result.errorCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {uploadStatus.result.errorCount}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ketentuan Kolom Excel */}
      <div className="bg-white rounded-2xl border border-[#DDE5DF] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-[#17231B] uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#16823B]" />
          Ketentuan Format Header & Kolom
        </h3>
        <p className="text-xs text-[#5F6B63] leading-relaxed">
          Parser akan mengenali kolom-kolom utama berikut secara otomatis (case-insensitive):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF]">
            <p className="font-bold text-[#17231B]">Identitas & Waktu</p>
            <ul className="list-disc list-inside text-[#5F6B63] mt-1.5 space-y-0.5">
              <li>Tanggal Realisasi</li>
              <li>SPK ID & Tanggal SPK</li>
              <li>Wilayah (AW01 - AW23)</li>
              <li>Lokasi & Status Tanaman</li>
            </ul>
          </div>
          <div className="p-3 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF]">
            <p className="font-bold text-[#17231B]">Klasifikasi & Jenis</p>
            <ul className="list-disc list-inside text-[#5F6B63] mt-1.5 space-y-0.5">
              <li>Jenis Data (Upah, Material, Reverse)</li>
              <li>Kode & Deskripsi Aktivitas</li>
              <li>Group Bahan/Alat</li>
              <li>Order & Act Cost Group</li>
            </ul>
          </div>
          <div className="p-3 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF]">
            <p className="font-bold text-[#17231B]">Nilai Numerik</p>
            <ul className="list-disc list-inside text-[#5F6B63] mt-1.5 space-y-0.5">
              <li>Total Realisasi Biaya</li>
              <li>Resource Bahan/Alat</li>
              <li>Hasil Efektif (HA)</li>
              <li>Cost/Working Hour & Index Biaya</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
