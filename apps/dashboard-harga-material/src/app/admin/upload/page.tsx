"use client";

import { useState, useRef } from "react";
import { uploadService, UploadProgress } from "@/services/uploadService";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  RotateCcw,
  Download,
  Trash2,
} from "lucide-react";

export default function AdminUploadPage() {
  const [progressState, setProgressState] = useState<UploadProgress | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadService.uploadSourceFile(file, (progress) => {
      setProgressState(progress);
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCardClick = () => {
    const isUploading = progressState?.status === "uploading" || progressState?.status === "validating";
    if (isUploading) return;

    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    window.open("/api/admin/template", "_blank");
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      const res = await uploadService.resetData();
      if (res.success) {
        setProgressState({
          fileName: "-",
          fileSize: 0,
          status: "success",
          progressPercentage: 100,
          message: res.message,
        });
      } else {
        setProgressState({
          fileName: "-",
          fileSize: 0,
          status: "error",
          progressPercentage: 100,
          message: res.message,
        });
      }
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setResetting(false);
      setResetModalOpen(false);
    }
  };

  const isUploading = progressState?.status === "uploading" || progressState?.status === "validating";
  const isSuccess = progressState?.status === "success";
  const isError = progressState?.status === "error";

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Harga Material</h1>
          <p className="text-xs text-[#5F6B63] mt-1">
            Unggah 1 file Excel/CSV data master & histori harga material untuk memperbarui database PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => setResetModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors shadow-2xs shrink-0 cursor-pointer"
          suppressHydrationWarning
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Reset Data Tabel</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#17231B]">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#16823B]">Ketentuan Upload File Single Data Harga Material:</p>
          <p className="text-[#5F6B63]">
            Sistem mendukung format <strong>.xlsx, .xls, atau .csv</strong>. File secara otomatis memetakan data ke tabel <strong>MasterSheet</strong> (Material, Deskripsi, Group, UoM) dan <strong>BahanMaterial</strong> (Harga, Currency, Unit, Date/Update).
          </p>
          <p className="text-[11px] text-[#5F6B63]">
            * Anda dapat mengunduh <strong>Template Excel Sample</strong> dengan mengeklik tombol di bawah. Riwayat file tersimpan maks 3 file terbaru.
          </p>
        </div>
      </div>

      {/* Single Upload Card Container */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          
          {/* Card Title & Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#17231B]">Data Harga Material (Single File)</h3>
                <span className="text-xs text-[#89938D]">Format didukung: .xlsx, .xls, .csv</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EAF3EC] border border-[#CBE0D1] text-xs font-extrabold text-[#16823B]">
              Single Upload
            </span>
          </div>

          <p className="text-xs text-[#5F6B63]">
            Pilih file Excel yang berisi kolom Kode Material, Deskripsi, Group, Satuan, Harga, Currency, Plant, serta tanggal Update untuk diperbarui ke database.
          </p>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Single Dropzone Box */}
          <div
            onClick={handleCardClick}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isUploading
                ? "border-amber-400 bg-amber-50/50 cursor-wait"
                : isSuccess
                ? "border-emerald-400 bg-emerald-50/40"
                : isError
                ? "border-rose-400 bg-rose-50/40"
                : "border-[#DDE5DF] hover:border-[#16823B] bg-[#F7F9F7] hover:bg-[#16823B]/5"
            }`}
          >
            <UploadCloud className="w-10 h-10 text-[#16823B] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#17231B]">Klik atau Drag & Drop File Excel Ke Sini</p>
            <p className="text-xs text-[#89938D] mt-1">Contoh: DataHargaMaterial.xlsx</p>
          </div>

          {/* Download Template & Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#16823B] hover:text-[#0B6B32] transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel Sample</span>
            </button>

            {progressState && (
              <button
                onClick={() => setProgressState(null)}
                className="inline-flex items-center gap-1.5 text-xs text-[#5F6B63] hover:text-[#17231B] transition-colors cursor-pointer"
                suppressHydrationWarning
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bersihkan Status</span>
              </button>
            )}
          </div>

          {/* Progress & Message Status */}
          {progressState && (
            <div className="pt-4 border-t border-[#DDE5DF] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#17231B] truncate max-w-[280px]" title={progressState.fileName}>
                  {progressState.fileName}
                </span>
                <span className="text-[#16823B] font-mono">{progressState.progressPercentage}%</span>
              </div>

              <div className="w-full bg-[#EAEFEF] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isError ? "bg-rose-600" : isSuccess ? "bg-emerald-600" : "bg-[#16823B]"
                  }`}
                  style={{ width: `${progressState.progressPercentage}%` }}
                />
              </div>

              <div className="text-xs text-[#5F6B63] flex items-start gap-2">
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-emerald-700 font-semibold">{progressState.message}</span>
                  </>
                ) : isError ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-rose-700 font-semibold">{progressState.message}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#16823B] animate-spin shrink-0 mt-0.5" />
                    <span className="font-medium">{progressState.message}</span>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#17231B]">Konfirmasi Reset Data Tabel</h3>
            </div>

            <p className="text-xs text-[#5F6B63] leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh data pada tabel <strong>MasterSheet</strong> & <strong>BahanMaterial</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl border border-[#DDE5DF] text-[#2C3830] text-xs font-semibold hover:bg-[#F7F9F7] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                {resetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{resetting ? "Memproses..." : "Ya, Kosongkan Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
