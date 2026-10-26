"use client";

import { useState, useRef } from "react";
import { uploadService, DataSourceCategory } from "@/services/uploadService";
import { UploadProgress } from "@/types/sourceData";
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
  const [progressState, setProgressState] = useState<Record<DataSourceCategory, UploadProgress | null>>({
    "Data Actual": null,
    "Data Budget": null,
  });

  const [resetModalCategory, setResetModalCategory] = useState<DataSourceCategory | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);

  const fileInputRefs = {
    "Data Actual": useRef<HTMLInputElement | null>(null),
    "Data Budget": useRef<HTMLInputElement | null>(null),
  };

  const handleFileChange = async (category: DataSourceCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadService.uploadSourceFile(category, file, (progress) => {
      setProgressState((prev) => ({ ...prev, [category]: progress }));
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCardClick = (category: DataSourceCategory) => {
    const currentProgress = progressState[category];
    const isUploading =
      currentProgress?.status === "uploading" || currentProgress?.status === "validating";
    if (isUploading) return;

    fileInputRefs[category].current?.click();
  };

  const handleDownloadTemplate = (category: DataSourceCategory) => {
    const categoryKey = category === "Data Budget" ? "budget" : "actual";
    window.open(`/api/admin/template?category=${categoryKey}`, "_blank");
  };

  const handleConfirmReset = async () => {
    if (!resetModalCategory) return;
    const category = resetModalCategory;
    setResetting(true);

    try {
      const res = await uploadService.resetCategoryData(category);

      if (res.success) {
        setProgressState((prev) => ({
          ...prev,
          [category]: {
            fileName: "-",
            fileSize: 0,
            status: "success",
            progressPercentage: 100,
            message: res.message,
          },
        }));
      } else {
        setProgressState((prev) => ({
          ...prev,
          [category]: {
            fileName: "-",
            fileSize: 0,
            status: "error",
            progressPercentage: 100,
            message: res.message,
          },
        }));
      }
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setResetting(false);
      setResetModalCategory(null);
    }
  };

  const uploadCards: {
    title: DataSourceCategory;
    step: number;
    desc: string;
    sampleFile: string;
  }[] = [
    {
      title: "Data Actual",
      step: 1,
      desc: "Upload data realisasi biaya operasional, dokumen transaksi, dan aktivitas lapangan per PG.",
      sampleFile: "data_actual.xlsx",
    },
    {
      title: "Data Budget",
      step: 2,
      desc: "Upload target anggaran biaya OPEX tahunan per Cost Center & akun Cost Element (CE2).",
      sampleFile: "data_budget.xlsx",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Sumber Excel OPEX</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Unggah file Excel <strong>Data Actual</strong> dan <strong>Data Budget</strong> untuk memperbarui database PostgreSQL dan menyinkronkan ringkasan OPEX.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#17231B]">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#16823B]">Petunjuk Pengunggahan File Excel OPEX:</p>
          <p className="text-[#5F6B63]">
            Sistem mendukung 2 jenis file sumber: <strong>Data Actual</strong> (realisasi biaya & transaksi lapangan) dan <strong>Data Budget</strong> (alokasi anggaran).
          </p>
          <p className="text-[11px] text-[#5F6B63]">
            * Anda dapat mengunduh <strong>Template Excel</strong> pada setiap kartu di bawah. Data Excel langsung diproses dan dimasukkan ke database PostgreSQL tanpa menyimpan file fisik di server. Tersedia tombol <strong>Reset Data Tabel</strong> jika ingin mengosongkan tabel.
          </p>
        </div>
      </div>

      {/* Grid of 2 Upload Cards (2 Kolom Berdampingan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploadCards.map((card) => {
          const currentProgress = progressState[card.title];
          const isUploading =
            currentProgress?.status === "uploading" || currentProgress?.status === "validating";

          return (
            <div
              key={card.title}
              className="bg-white border border-[#DDE5DF] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between relative hover:border-[#16823B]/50 transition-all group"
            >
              {/* Top Details & Step */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#16823B] text-white flex items-center justify-center text-xs font-bold">
                      {card.step}
                    </span>
                    <h3 className="font-bold text-base text-[#17231B]">{card.title}</h3>
                  </div>

                  {/* Template & Reset buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadTemplate(card.title);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16823B] bg-[#EAF3EC] hover:bg-[#D5E7DA] px-2.5 py-1 rounded-lg border border-[#CBE0D1] transition-colors cursor-pointer"
                      title={`Unduh format contoh template ${card.sampleFile}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResetModalCategory(card.title);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      title={`Reset / Kosongkan data tabel ${card.title}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#5F6B63] leading-relaxed">{card.desc}</p>

                {/* Hidden input */}
                <input
                  ref={fileInputRefs[card.title]}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => handleFileChange(card.title, e)}
                />

                {/* Dropzone Area */}
                <div
                  onClick={() => handleCardClick(card.title)}
                  className={`mt-4 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isUploading
                      ? "border-[#16823B] bg-[#F7F9F7] cursor-wait"
                      : "border-[#DDE5DF] bg-[#F8FAF9]/50 hover:bg-[#EAF3EC]/40 hover:border-[#16823B]"
                  }`}
                >
                  <div className="p-3 bg-white rounded-2xl border border-[#DDE5DF] text-[#16823B] mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                    {isUploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-[#16823B]" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-[#16823B]" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#17231B]">
                    {isUploading ? "Memproses Data..." : "Klik untuk Pilih File Excel"}
                  </span>
                  <span className="text-[11px] text-[#89938D] mt-0.5">
                    Format .xlsx, .xls, .csv (Maks 25 MB)
                  </span>
                </div>
              </div>

              {/* Upload Status / Progress Result */}
              {currentProgress && (
                <div className="mt-4 pt-3 border-t border-[#DDE5DF] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <FileSpreadsheet className="w-4 h-4 text-[#5F6B63] shrink-0" />
                      <span className="font-semibold text-[#17231B] truncate" title={currentProgress.fileName}>
                        {currentProgress.fileName}
                      </span>
                    </div>

                    {currentProgress.status === "success" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16823B] bg-[#EAF3EC] px-2 py-0.5 rounded-full border border-[#CBE0D1]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    )}

                    {currentProgress.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Gagal
                      </span>
                    )}

                    {isUploading && (
                      <span className="text-[11px] font-bold text-[#16823B]">
                        {currentProgress.progressPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#EAEFEF] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentProgress.status === "error"
                          ? "bg-rose-500"
                          : currentProgress.status === "success"
                          ? "bg-[#16823B]"
                          : "bg-[#8CD16B]"
                      }`}
                      style={{ width: `${currentProgress.progressPercentage}%` }}
                    />
                  </div>

                  {/* Message */}
                  {currentProgress.message && (
                    <p
                      className={`text-[11px] ${
                        currentProgress.status === "error"
                          ? "text-rose-600 font-medium"
                          : currentProgress.status === "success"
                          ? "text-[#16823B] font-medium"
                          : "text-[#5F6B63]"
                      }`}
                    >
                      {currentProgress.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Reset */}
      {resetModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#17231B]">Konfirmasi Reset Data</h3>
            </div>
            <p className="text-xs text-[#5F6B63] leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh data tabel <strong>{resetModalCategory}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalCategory(null)}
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
