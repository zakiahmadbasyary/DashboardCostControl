"use client";

import { useState, useRef } from "react";
import { uploadService, WeedControlCategory } from "@/services/uploadService";
import { UploadProgress } from "@/types/sourceData";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Trash2,
  Download,
  Tractor,
  Layers,
  Activity,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function AdminUploadPage() {
  const [progressState, setProgressState] = useState<Record<WeedControlCategory, UploadProgress | null>>({
    "Data Lokasi": null,
    "Data Timeline": null,
    "Data Aktivitas": null,
  });

  const [resetModalCategory, setResetModalCategory] = useState<WeedControlCategory | "all" | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);

  const fileInputRefs = {
    "Data Lokasi": useRef<HTMLInputElement | null>(null),
    "Data Timeline": useRef<HTMLInputElement | null>(null),
    "Data Aktivitas": useRef<HTMLInputElement | null>(null),
  };

  const handleFileChange = async (category: WeedControlCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadService.uploadSourceFile(category, file, (progress) => {
      setProgressState((prev) => ({ ...prev, [category]: progress }));
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCardClick = (category: WeedControlCategory) => {
    const currentProgress = progressState[category];
    const isUploading =
      currentProgress?.status === "uploading" || currentProgress?.status === "validating";
    if (isUploading) return;

    fileInputRefs[category].current?.click();
  };

  const handleDownloadTemplate = (category: WeedControlCategory) => {
    let key: "lokasi" | "timeline" | "aktivitas" = "lokasi";
    if (category === "Data Timeline") key = "timeline";
    if (category === "Data Aktivitas") key = "aktivitas";
    uploadService.downloadTemplate(key);
  };

  const handleConfirmReset = async () => {
    if (!resetModalCategory) return;
    const category = resetModalCategory;
    setResetting(true);

    try {
      const res = await uploadService.resetCategoryData(category);

      if (category === "all") {
        setProgressState({
          "Data Lokasi": {
            fileName: "-",
            fileSize: 0,
            status: res.success ? "success" : "error",
            progressPercentage: 100,
            message: res.message,
          },
          "Data Timeline": null,
          "Data Aktivitas": null,
        });
      } else {
        setProgressState((prev) => ({
          ...prev,
          [category]: {
            fileName: "-",
            fileSize: 0,
            status: res.success ? "success" : "error",
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
    title: WeedControlCategory;
    step: number;
    icon: typeof Tractor;
    tables: string;
    desc: string;
    sampleFile: string;
  }[] = [
    {
      title: "Data Lokasi",
      step: 1,
      icon: Tractor,
      tables: "mastersheet & cost_umur",
      desc: "Upload data master petak lokasi dan rincian biaya umur 1-20 per lokasi (wide-to-long).",
      sampleFile: "data_lokasi.xlsx",
    },
    {
      title: "Data Timeline",
      step: 2,
      icon: Layers,
      tables: "data_timeline & data_material",
      desc: "Upload transaksi realisasi timeline kegiatan lapangan dan kuantitas aplikasi material herbisida dinamis.",
      sampleFile: "data_timeline.xlsx",
    },
    {
      title: "Data Aktivitas",
      step: 3,
      icon: Activity,
      tables: "data_aktivitas",
      desc: "Upload data rekap transaksi aktivitas dengan rincian biaya upah, charge, material, bibit, dan hasil.",
      sampleFile: "data_aktivitas.xlsx",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#17231B] flex items-center gap-2">
          <span>Upload Data Sumber Excel Weed Control</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5F6B63] mt-1">
          Unggah 3 berkas Excel <strong>Data Lokasi</strong>, <strong>Data Timeline</strong>, dan <strong>Data Aktivitas</strong> untuk memperbarui database PostgreSQL Weed Control (Mode Replace).
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#17231B]">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1.5 leading-relaxed">
          <p className="font-bold text-[#16823B] text-sm">Ketentuan & Alur Mode Replace Weed Control:</p>
          <ul className="list-disc list-inside space-y-1 text-[#5F6B63]">
            <li>
              <strong>Mandiri per Card:</strong> Anda dapat me-replace salah satu jenis file tanpa harus mengunggah ulang file lainnya.
            </li>
            <li>
              <strong>Integritas Relasi:</strong> Pastikan mengunggah <em>Data Lokasi</em> terlebih dahulu karena data Timeline dan Aktivitas bergantung pada kode Lokasi yang terdaftar di Mastersheet.
            </li>
            <li>
              <strong>Format Fleksibel:</strong> Sistem otomatis mengenali format angka ribuan Indonesia (titik/koma), angka nol (0 tetap disimpan), umur negatif (-6), dan format tanggal Excel.
            </li>
          </ul>
        </div>
      </div>

      {/* Grid of 3 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {uploadCards.map((card) => {
          const currentProgress = progressState[card.title];
          const isUploading =
            currentProgress?.status === "uploading" || currentProgress?.status === "validating";
          const isSuccess = currentProgress?.status === "success";
          const isError = currentProgress?.status === "error";
          const CardIcon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#16823B]/40 transition-all"
            >
              <div className="space-y-4">
                {/* Step & Card Title */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#EAF3EC] text-[#16823B] border border-[#CBE0D1]">
                    Langkah {card.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAF9] border border-[#DDE5DF] flex items-center justify-center text-[#16823B]">
                    <CardIcon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#17231B]">{card.title}</h3>
                  <div className="text-[11px] font-semibold text-[#16823B] mt-0.5">
                    Target: {card.tables}
                  </div>
                  <p className="text-xs text-[#5F6B63] mt-2 leading-relaxed">{card.desc}</p>
                </div>

                {/* Upload Drag/Click Box */}
                <div
                  onClick={() => handleCardClick(card.title)}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isUploading
                      ? "bg-[#F8FAF9] border-[#DDE5DF] cursor-not-allowed opacity-70"
                      : "border-[#DDE5DF] hover:border-[#16823B] bg-[#F8FAF9] hover:bg-[#EEF4F0]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRefs[card.title]}
                    onChange={(e) => handleFileChange(card.title, e)}
                    accept=".xlsx, .xls"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-[#DDE5DF] flex items-center justify-center text-[#16823B]">
                      {isUploading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#17231B]">
                      {isUploading ? "Memproses Data..." : "Klik untuk Pilih File Excel"}
                    </div>
                    <div className="text-[10px] text-[#89938D]">Format berkas .xlsx atau .xls</div>
                  </div>
                </div>

                {/* Status & Progress Bar */}
                {currentProgress && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#17231B] truncate max-w-[180px]">
                        {currentProgress.fileName}
                      </span>
                      <span
                        className={`font-extrabold text-[11px] ${
                          isSuccess
                            ? "text-[#16823B]"
                            : isError
                            ? "text-red-600"
                            : "text-[#16823B]"
                        }`}
                      >
                        {currentProgress.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-[#EAEFEB] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isSuccess
                            ? "bg-[#16823B]"
                            : isError
                            ? "bg-red-500"
                            : "bg-[#16823B] animate-pulse"
                        }`}
                        style={{ width: `${currentProgress.progressPercentage}%` }}
                      />
                    </div>

                    <div
                      className={`text-[11px] flex items-start gap-1.5 p-2 rounded-lg leading-tight ${
                        isSuccess
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isError
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />}
                      {isError && <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />}
                      {!isSuccess && !isError && <RefreshCw className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-spin text-blue-600" />}
                      <span>{currentProgress.message}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Template & Reset */}
              <div className="pt-4 border-t border-[#EAEFEB] mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(card.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs transition-colors cursor-pointer"
                  title="Unduh format template Excel"
                >
                  <Download className="w-3.5 h-3.5 text-[#5F6B63]" />
                  <span>Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResetModalCategory(card.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100/80 text-red-700 font-semibold text-xs transition-colors cursor-pointer"
                  title="Hapus data tabel terkait"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Replace Card Option */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-extrabold text-sm sm:text-base text-[#17231B] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Reset Seluruh Database Weed Control </span>
          </div>
          <p className="text-xs text-[#5F6B63]">
            Kosongkan seluruh data pada <code>mastersheet</code>, <code>cost_umur</code>, <code>data_timeline</code>, <code>data_material</code>, dan <code>data_aktivitas</code> secara serentak.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setResetModalCategory("all")}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0"
        >
          Reset Seluruh Data
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#0c1a10]/50 backdrop-blur-xs"
            onClick={() => !resetting && setResetModalCategory(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DDE5DF] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-200 shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#17231B]">
                  Konfirmasi Reset Data {resetModalCategory === "all" ? "Semua Tabel" : resetModalCategory}
                </h3>
                <p className="text-xs text-red-600 font-semibold">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-[#5F6B63] leading-relaxed">
              {resetModalCategory === "all"
                ? "Apakah Anda yakin ingin mengosongkan SELURUH 5 TABEL data Weed Control di database? Semua data mastersheet, umur, timeline, material, dan aktivitas akan dihapus permanen."
                : `Apakah Anda yakin ingin mengosongkan data tabel terkait kategori ${resetModalCategory}?`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={resetting}
                onClick={() => setResetModalCategory(null)}
                className="px-4 py-2 rounded-xl border border-[#DDE5DF] bg-[#F8FAF9] hover:bg-[#EEF4F0] text-[#2C3830] font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{resetting ? "Mereset..." : "Ya, Hapus Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

