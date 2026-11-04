"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { uploadService, UploadProgress } from "@/services/uploadService";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Download,
  Trash2,
  ArrowRight,
  Database,
  Layers,
} from "lucide-react";

export default function SulamAdminUploadPage() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isUploading =
    progress?.status === "uploading" || progress?.status === "validating";
  const isSuccess = progress?.status === "success";
  const isError = progress?.status === "error";

  const handleFile = async (file: File) => {
    await uploadService.uploadSourceFile(file, (p) => {
      setProgress(p);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    uploadService.downloadTemplate();
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const res = await uploadService.resetDatabase();
      if (res.success) {
        setProgress({
          fileName: "-",
          fileSize: 0,
          status: "success",
          progressPercentage: 100,
          message: res.message,
        });
      } else {
        setProgress({
          fileName: "-",
          fileSize: 0,
          status: "error",
          progressPercentage: 100,
          message: res.message,
        });
      }
    } catch (err: any) {
      console.error("Error resetting sulam:", err);
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#17231B] tracking-tight">
          Upload Data Sumber Excel SULAM
        </h1>
        <p className="text-xs sm:text-sm text-[#5F6B63] mt-1">
          Unggah <strong>1 file Excel Transaksi Sulam</strong> untuk memperbarui database PostgreSQL secara{" "}
          <strong className="text-[#16823B]">Replace All</strong> dan menyinkronkan ringkasan analitik.
        </p>
      </div>

      {/* ── Info Banner (Style OPEX) ── */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#17231B] shadow-xs">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1.5 leading-relaxed">
          <p className="font-bold text-[#16823B] text-sm">
            Petunjuk Pengunggahan File Excel SULAM:
          </p>
          <p className="text-[#5F6B63]">
            Sistem SULAM menggunakan <strong>1 file sumber terpadu</strong> yang memuat data realisasi transaksi upah tenaga kerja dan material bibit sulam per wilayah (AW01 s/d AW23).
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#5F6B63] pt-1 border-t border-[#16823B]/15">
            <span>
              • <strong>Teknis Upload:</strong> Mode <em>Replace All</em> (data lama diganti sepenuhnya dengan data baru).
            </span>
            <span>
              • <strong>Format Wajib:</strong> Tanggal realisasi, wilayah, jenis data, resource, dan luas efektif.
            </span>
          </div>
        </div>
      </div>

      {/* ── Single Upload Card (Langkah 1) ── */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-sm shadow-[#16823B]/5 flex flex-col gap-5">
        {/* Card Header & Step */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE5DF]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B] shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17231B]">Data Transaksi Sulam</h3>
              <p className="text-xs text-[#5F6B63]">
                Format berkas yang didukung: <span className="font-semibold text-[#17231B]">.xlsx, .xls, .csv</span>
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-full bg-[#F7F9F7] border border-[#DDE5DF] text-xs font-black text-[#16823B]">
            Langkah 1: Upload File Tunggal
          </span>
        </div>

        <p className="text-xs text-[#5F6B63] -mt-1 leading-relaxed">
          Unggah file Excel yang berisi rekaman SPK, tanggal realisasi, wilayah AW, lokasi blok, upah tenaga kerja, dan bibit tanaman. File akan diproses otomatis menjadi data transaksi dan matriks summary kode bulanan.
        </p>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Dropzone Container */}
        <div
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isUploading
              ? "border-amber-400 bg-amber-50/50 cursor-wait"
              : isSuccess
              ? "border-emerald-500 bg-emerald-50/40"
              : isError
              ? "border-rose-400 bg-rose-50/40"
              : isDragging
              ? "border-[#16823B] bg-[#16823B]/10 scale-[1.01]"
              : "border-[#DDE5DF] hover:border-[#16823B] bg-[#F7F9F7] hover:bg-[#16823B]/5"
          }`}
        >
          <div className="p-3 rounded-2xl bg-white shadow-xs border border-[#DDE5DF]">
            {isUploading ? (
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : isError ? (
              <AlertCircle className="w-8 h-8 text-rose-600" />
            ) : (
              <UploadCloud className="w-8 h-8 text-[#16823B]" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-[#17231B]">
              {isUploading
                ? "Sedang memproses berkas Excel..."
                : "Klik untuk memilih file atau seret ke sini"}
            </p>
            <p className="text-xs text-[#89938D] mt-0.5">
              Contoh nama file: <span className="font-mono font-semibold">data_sulam.xlsx</span> (Maksimal 50MB)
            </p>
          </div>
        </div>

        {/* Action Buttons: Template & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-white text-xs font-bold text-[#17231B] transition-all cursor-pointer shadow-2xs hover:border-[#16823B]"
          >
            <Download className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Unduh Template Excel Sulam</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset / Kosongkan Database</span>
          </button>
        </div>
      </div>

      {/* ── Progress & Status Result Card ── */}
      {progress && (
        <div
          className={`border rounded-2xl p-5 shadow-xs transition-all ${
            isError
              ? "bg-rose-50/70 border-rose-200 text-rose-900"
              : isSuccess
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : "bg-white border-[#DDE5DF] text-[#17231B]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {isUploading ? (
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <span className="font-bold text-sm">
                {isUploading ? "Status Pengunggahan..." : isSuccess ? "Berhasil Diunggah & Di-replace" : "Gagal Mengunggah"}
              </span>
            </div>
            <span className="font-mono text-xs font-bold">
              {progress.progressPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#DDE5DF]/60 h-2 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isError
                  ? "bg-rose-500"
                  : isSuccess
                  ? "bg-emerald-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${progress.progressPercentage}%` }}
            />
          </div>

          <p className="text-xs text-[#5F6B63] mb-3">{progress.message}</p>

          {/* Result Stats on Success */}
          {isSuccess && progress.result && (
            <div className="pt-3 border-t border-emerald-200/80 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[#5F6B63] text-[10px] block uppercase font-bold">Total Baris File</span>
                  <span className="font-mono font-black text-sm text-[#17231B]">
                    {progress.result.totalRows.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[#5F6B63] text-[10px] block uppercase font-bold">Transaksi Valid</span>
                  <span className="font-mono font-black text-sm text-[#16823B]">
                    {progress.result.validRows.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[#5F6B63] text-[10px] block uppercase font-bold">Summary Kode</span>
                  <span className="font-mono font-black text-sm text-[#29A9D6]">
                    {progress.result.summaryCount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[#5F6B63] text-[10px] block uppercase font-bold">Baris Error</span>
                  <span className={`font-mono font-black text-sm ${progress.result.errorCount > 0 ? "text-amber-600" : "text-[#5F6B63]"}`}>
                    {progress.result.errorCount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Link to Preview */}
              <div className="flex items-center justify-end pt-1">
                <Link
                  href="/admin/preview"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16823B] hover:bg-[#0B6B32] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>Buka Preview Data Hasil Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Konfirmasi Reset Database ── */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
          onClick={() => !isResetting && setIsResetModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DDE5DF] space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-[#DDE5DF]">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#17231B]">Konfirmasi Reset Database</h3>
                <p className="text-xs text-[#5F6B63]">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6B63] leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh data transaksi <strong>Sulam</strong> dan <strong>Summary Sulam</strong> dari database PostgreSQL? Seluruh data yang ada saat ini akan dihapus secara permanen.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DDE5DF] text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F8FAF9] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isResetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isResetting ? "Mereset..." : "Ya, Kosongkan Database"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
