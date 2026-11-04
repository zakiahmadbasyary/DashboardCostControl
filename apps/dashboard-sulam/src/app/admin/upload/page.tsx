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
  Trash2,
  Download,
} from "lucide-react";

export default function AdminUploadPage() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadService.uploadSourceFile(file, (p) => {
      setProgress(p);
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCardClick = () => {
    const isUploading =
      progress?.status === "uploading" || progress?.status === "validating";
    if (isUploading) return;

    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    window.open("/api/admin/template", "_blank");
  };

  const handleConfirmReset = async () => {
    setResetting(true);

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
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setResetting(false);
      setResetModalOpen(false);
    }
  };

  const isUploading =
    progress?.status === "uploading" || progress?.status === "validating";
  const isSuccess = progress?.status === "success";
  const isError = progress?.status === "error";

  const card = {
    title: "Data Transaksi Sulam",
    step: 1,
    desc: "Upload data realisasi biaya operasional sulam, upah tenaga kerja, dan bibit material per wilayah.",
    sampleFile: "data_sulam.xlsx",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Sumber Excel SULAM</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Unggah file Excel <strong>Data Transaksi Sulam</strong> untuk memperbarui database PostgreSQL dan menyinkronkan ringkasan SULAM.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#17231B]">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#16823B]">Petunjuk Pengunggahan File Excel SULAM:</p>
          <p className="text-[#5F6B63]">
            Sistem mendukung 1 file sumber terpadu: <strong>Data Transaksi Sulam</strong> (realisasi biaya upah tenaga kerja dan bibit tanaman).
          </p>
          <p className="text-[11px] text-[#5F6B63]">
            * Anda dapat mengunduh <strong>Template Excel</strong> pada kartu di bawah. Data Excel langsung diproses dan dimasukkan ke database PostgreSQL tanpa menyimpan file fisik di server dengan metode <strong>Replace All</strong>. Tersedia tombol <strong>Reset Data</strong> jika ingin mengosongkan tabel.
          </p>
        </div>
      </div>

      {/* Grid of Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-5">
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Card Title & Step */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#17231B]">{card.title}</h3>
                  <span className="text-[10px] text-[#89938D]">Format .xlsx, .xls, .csv</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#F7F9F7] border border-[#DDE5DF] text-[10px] font-extrabold text-[#16823B]">
                Langkah {card.step}
              </span>
            </div>

            <p className="text-[11px] text-[#5F6B63] mb-4 min-h-[32px]">{card.desc}</p>

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
              onClick={handleCardClick}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile && !isUploading) {
                  uploadService.uploadSourceFile(droppedFile, (p) => {
                    setProgress(p);
                  });
                }
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isUploading
                  ? "border-amber-400 bg-amber-50/50 cursor-wait"
                  : isSuccess
                  ? "border-emerald-400 bg-emerald-50/40"
                  : isError
                  ? "border-rose-400 bg-rose-50/40"
                  : "border-[#DDE5DF] hover:border-[#16823B] bg-[#F7F9F7] hover:bg-[#16823B]/5"
              }`}
            >
              <UploadCloud className="w-7 h-7 text-[#16823B] mx-auto mb-1.5" />
              <p className="text-xs font-bold text-[#17231B]">Pilih File Excel</p>
              <p className="text-[10px] text-[#89938D] mt-0.5">Contoh: {card.sampleFile}</p>
            </div>
          </div>

          {/* Progress, Actions & Reset Button */}
          <div className="mt-4 pt-3 border-t border-[#DDE5DF] space-y-3">
            {progress ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#17231B] truncate max-w-[140px]" title={progress.fileName}>
                    {progress.fileName}
                  </span>
                  <span className="text-[#16823B]">{progress.progressPercentage}%</span>
                </div>

                <div className="w-full bg-[#EAEFEF] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isError ? "bg-rose-600" : isSuccess ? "bg-emerald-600" : "bg-[#16823B]"
                    }`}
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#5F6B63] flex items-start gap-1.5">
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-emerald-700 font-medium">{progress.message}</span>
                    </>
                  ) : isError ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span className="text-rose-700 font-medium">{progress.message}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#16823B] animate-spin shrink-0 mt-0.5" />
                      <span>{progress.message}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-[#89938D]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Belum ada file yang diunggah</span>
              </div>
            )}

            {/* Download Template Button */}
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="w-full py-1.5 px-3 rounded-xl border border-[#16823B]/30 bg-[#16823B]/5 hover:bg-[#16823B]/10 text-[#16823B] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template Excel</span>
            </button>

            {/* Card Bottom Actions: Upload & Reset Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DDE5DF]/60">
              <button
                type="button"
                onClick={handleCardClick}
                disabled={isUploading}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16823B] hover:underline disabled:opacity-50 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Unggah File</span>
              </button>

              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                disabled={isUploading}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Kosongkan isi tabel di database"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Data */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#DDE5DF] space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17231B]">Konfirmasi Reset Data</h3>
                <p className="text-xs text-[#5F6B63]">Tabel Data Transaksi Sulam</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6B63] leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh data tabel <strong>Data Transaksi Sulam</strong>? Tindakan ini akan menghapus semua rekaman di database dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                disabled={resetting}
                className="px-4 py-2 text-xs font-semibold text-[#5F6B63] hover:text-[#17231B] rounded-xl hover:bg-[#F7F9F7] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {resetting ? "Mereset..." : "Ya, Kosongkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
