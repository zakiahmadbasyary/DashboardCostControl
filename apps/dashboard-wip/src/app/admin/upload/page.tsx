"use client";

import { useState, useRef } from "react";
import { uploadService, DataSourceCategory } from "@/services/uploadService";
import { UploadProgress } from "@/types/sourceData";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, Info, RotateCcw, Trash2, Download } from "lucide-react";

export default function AdminUploadPage() {
  const [progressState, setProgressState] = useState<Record<DataSourceCategory, UploadProgress | null>>({
    MasterSheet: null,
    "Data SBT": null,
    "Data Lokasi": null,
    "Data Aktivitas": null,
  });

  const [resetModalCategory, setResetModalCategory] = useState<DataSourceCategory | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);

  const fileInputRefs = {
    MasterSheet: useRef<HTMLInputElement | null>(null),
    "Data SBT": useRef<HTMLInputElement | null>(null),
    "Data Lokasi": useRef<HTMLInputElement | null>(null),
    "Data Aktivitas": useRef<HTMLInputElement | null>(null),
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
    const isUploading = currentProgress?.status === "uploading" || currentProgress?.status === "validating";
    if (isUploading) return;

    fileInputRefs[category].current?.click();
  };

  const handleDownloadTemplate = (category: DataSourceCategory) => {
    let categoryKey = "mastersheet";
    if (category === "Data SBT") categoryKey = "sbt";
    if (category === "Data Lokasi") categoryKey = "lokasi";
    if (category === "Data Aktivitas") categoryKey = "aktivitas";

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

  const uploadCards: { title: DataSourceCategory; step: number; desc: string; sampleFile: string }[] = [
    {
      title: "MasterSheet",
      step: 1,
      desc: "Upload data master lokasi, wilayah, luas, kode bibit, jenis, dan kelas bibit.",
      sampleFile: "mastersheet.xlsx",
    },
    {
      title: "Data SBT",
      step: 2,
      desc: "Upload acuan Standar Biaya Tanaman (SBT) per kelompok aktivitas.",
      sampleFile: "DataSBT.xlsx",
    },
    {
      title: "Data Lokasi",
      step: 3,
      desc: "Upload detail lokasi, cost per Ha, umur tanaman, pupuk, dan kode SBT.",
      sampleFile: "DataLokasi.xlsx",
    },
    {
      title: "Data Aktivitas",
      step: 4,
      desc: "Upload rincian pekerjaan aktivitas lapangan dan biaya operasional.",
      sampleFile: "DataAktivitas.xlsx",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Sumber Excel</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Unggah file Excel 4 Data Source (MasterSheet, SBT, Lokasi, dan Aktivitas) untuk memperbarui database PostgreSQL.
        </p>
      </div>

      {/* Recommended Order Info Banner */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#17231B]">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#16823B]">Urutan Unggah File yang Direkomendasikan:</p>
          <p className="text-[#5F6B63]">
            1. <strong>MasterSheet</strong> (Master Lokasi) &rarr; 2. <strong>Data SBT</strong> (Acuan SBT) &rarr; 3. <strong>Data Lokasi</strong> &rarr; 4. <strong>Data Aktivitas</strong>.
          </p>
          <p className="text-[11px] text-[#5F6B63]">
            * Anda dapat mengunduh <strong>Template Excel</strong> pada setiap kartu di bawah. Riwayat tersimpan maks 3 file terbaru, dan tersedia tombol <strong>Reset Data Tabel</strong> jika ingin mengosongkan tabel.
          </p>
        </div>
      </div>

      {/* Grid of 4 Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {uploadCards.map((card) => {
          const currentProgress = progressState[card.title];
          const isUploading = currentProgress?.status === "uploading" || currentProgress?.status === "validating";
          const isSuccess = currentProgress?.status === "success";
          const isError = currentProgress?.status === "error";

          return (
            <div
              key={card.title}
              className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
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
                  ref={fileInputRefs[card.title]}
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileChange(card.title, e)}
                  className="hidden"
                />

                {/* Dropzone Container */}
                <div
                  onClick={() => handleCardClick(card.title)}
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
                {currentProgress ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#17231B] truncate max-w-[140px]" title={currentProgress.fileName}>
                        {currentProgress.fileName}
                      </span>
                      <span className="text-[#16823B]">{currentProgress.progressPercentage}%</span>
                    </div>

                    <div className="w-full bg-[#EAEFEF] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isError ? "bg-rose-600" : isSuccess ? "bg-emerald-600" : "bg-[#16823B]"
                        }`}
                        style={{ width: `${currentProgress.progressPercentage}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-[#5F6B63] flex items-start gap-1.5">
                      {isSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-emerald-700 font-medium">{currentProgress.message}</span>
                        </>
                      ) : isError ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="text-rose-700 font-medium">{currentProgress.message}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-[#16823B] animate-spin shrink-0 mt-0.5" />
                          <span>{currentProgress.message}</span>
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
                  onClick={() => handleDownloadTemplate(card.title)}
                  className="w-full py-1.5 px-3 rounded-xl border border-[#16823B]/30 bg-[#16823B]/5 hover:bg-[#16823B]/10 text-[#16823B] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Excel</span>
                </button>

                {/* Card Bottom Actions: Upload & Reset Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DDE5DF]/60">
                  <button
                    onClick={() => handleCardClick(card.title)}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16823B] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Unggah File</span>
                  </button>

                  <button
                    onClick={() => setResetModalCategory(card.title)}
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
          );
        })}
      </div>

      {/* Confirmation Modal for Reset Data */}
      {resetModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#DDE5DF] space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17231B]">Konfirmasi Reset Data</h3>
                <p className="text-xs text-[#5F6B63]">Tabel {resetModalCategory}</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6B63] leading-relaxed">
              Apakah Anda yakin ingin mengosongkan seluruh isi data pada tabel <strong>{resetModalCategory}</strong> di database?
              <br /><br />
              <span className="text-emerald-700 font-semibold">&bull; Struktur kolom dan skema tabel tidak akan dihapus.</span>
              <br />
              <span className="text-rose-600 font-semibold">&bull; Semua baris data lama pada tabel ini akan terhapus bersih.</span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalCategory(null)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl border border-[#DDE5DF] text-xs font-semibold text-[#5F6B63] hover:bg-[#F7F9F7] cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmReset}
                disabled={resetting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengosongkan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Reset Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
