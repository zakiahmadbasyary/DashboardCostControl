"use client";

import { useState, useRef } from "react";
import { capexUploadService } from "@/services/capexUploadService";
import { CapexUploadCategory, UploadProgress, UploadCardMeta } from "@/types/admin";
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
  Calendar,
  Layers,
  Database,
} from "lucide-react";

export default function CapexAdminUploadPage() {
  const [progressState, setProgressState] = useState<Record<CapexUploadCategory, UploadProgress | null>>({
    "Data Created": null,
    "Data PO": null,
    "Data Budget": null,
    "Data Purchasing": null,
    "Data Kategori": null,
    "User Approver": null,
    "Master Cost Center": null,
  });

  const [resetModalCategory, setResetModalCategory] = useState<CapexUploadCategory | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "harian" | "tahunan" | "on_demand">("all");

  const fileInputRefs = {
    "Data Created": useRef<HTMLInputElement | null>(null),
    "Data PO": useRef<HTMLInputElement | null>(null),
    "Data Budget": useRef<HTMLInputElement | null>(null),
    "Data Purchasing": useRef<HTMLInputElement | null>(null),
    "Data Kategori": useRef<HTMLInputElement | null>(null),
    "User Approver": useRef<HTMLInputElement | null>(null),
    "Master Cost Center": useRef<HTMLInputElement | null>(null),
  };

  const handleFileChange = async (category: CapexUploadCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await capexUploadService.uploadSourceFile(category, file, (progress) => {
      setProgressState((prev) => ({ ...prev, [category]: progress }));
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCardClick = (category: CapexUploadCategory) => {
    const currentProgress = progressState[category];
    const isUploading = currentProgress?.status === "uploading" || currentProgress?.status === "validating";
    if (isUploading) return;

    fileInputRefs[category].current?.click();
  };

  const handleDownloadTemplate = (category: CapexUploadCategory) => {
    const categoryKey = capexUploadService.getCategoryKey(category);
    window.open(`/api/admin/template?category=${categoryKey}`, "_blank");
  };

  const handleConfirmReset = async () => {
    if (!resetModalCategory) return;
    const category = resetModalCategory;
    setResetting(true);

    try {
      const res = await capexUploadService.resetCategoryData(category);

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
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setResetting(false);
      setResetModalCategory(null);
    }
  };

  const uploadCards: UploadCardMeta[] = [
    // 1. Harian
    {
      title: "Data Created",
      categoryKey: "created",
      frequency: "harian",
      frequencyLabel: "Upload Harian",
      frequencyBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      step: 1,
      desc: "Data pengajuan & approval CAPEX harian (replace & trigger rekonsiliasi Total).",
      sampleFile: "Data_Created.xlsx",
    },
    {
      title: "Data PO",
      categoryKey: "po",
      frequency: "harian",
      frequencyLabel: "Upload Harian",
      frequencyBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      step: 2,
      desc: "Data Purchase Requisition & Purchase Order dari SAP (replace & relasi nomor_pr).",
      sampleFile: "Data_PO.xlsx",
    },
    // 2. Tahunan
    {
      title: "Data Budget",
      categoryKey: "budget",
      frequency: "tahunan",
      frequencyLabel: "Update Tahunan",
      frequencyBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      step: 3,
      desc: "Pagu anggaran tahunan proyek CAPEX, IO, MO, dan WBS (replace tahunan).",
      sampleFile: "Data_Budget.xlsx",
    },
    {
      title: "Data Purchasing",
      categoryKey: "purchasing",
      frequency: "tahunan",
      frequencyLabel: "Update Tahunan",
      frequencyBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      step: 4,
      desc: "Master grup purchasing (PGR), kontak, dan deskripsi divisi pengadaan.",
      sampleFile: "Data_Purchasing.xlsx",
    },
    // 3. On-Demand / Saat Ada Data Baru
    {
      title: "Data Kategori",
      categoryKey: "kategori",
      frequency: "on_demand",
      frequencyLabel: "Saat Ada Data Baru",
      frequencyBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      step: 5,
      desc: "Master capex_no, klasifikasi kategori proyek, komoditi, dan cost center (upsert).",
      sampleFile: "Data_Kategori.xlsx",
    },
    {
      title: "User Approver",
      categoryKey: "approver",
      frequency: "on_demand",
      frequencyLabel: "Saat Ada Data Baru",
      frequencyBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      step: 6,
      desc: "Master kode approver dan nama pejabat/manajemen yang berwenang (upsert).",
      sampleFile: "Data_Approver.xlsx",
    },
    {
      title: "Master Cost Center",
      categoryKey: "cost_center",
      frequency: "on_demand",
      frequencyLabel: "Saat Ada Data Baru",
      frequencyBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      step: 7,
      desc: "Master kode cost center dan nama keterangan bagian/divisi (upsert).",
      sampleFile: "Data_Cost_Center.xlsx",
    },
  ];

  const filteredCards = uploadCards.filter((card) => {
    if (selectedFilter === "all") return true;
    return card.frequency === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Sumber Excel CAPEX</h1>
          <p className="text-xs text-[#5F6B63] mt-1">
            Unggah data Excel untuk memperbarui database PostgreSQL secara langsung tanpa menyimpan file fisik ke server.
          </p>
        </div>

        {/* Filter Tabs by Frequency */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#DDE5DF] shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-[#16823B] text-white shadow-xs"
                : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7]"
            }`}
          >
            Semua (7)
          </button>
          <button
            onClick={() => setSelectedFilter("harian")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "harian"
                ? "bg-[#16823B] text-white shadow-xs"
                : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7]"
            }`}
          >
            Harian (2)
          </button>
          <button
            onClick={() => setSelectedFilter("tahunan")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "tahunan"
                ? "bg-[#16823B] text-white shadow-xs"
                : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7]"
            }`}
          >
            Tahunan (2)
          </button>
          <button
            onClick={() => setSelectedFilter("on_demand")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "on_demand"
                ? "bg-[#16823B] text-white shadow-xs"
                : "text-[#5F6B63] hover:text-[#17231B] hover:bg-[#F7F9F7]"
            }`}
          >
            Data Baru (3)
          </button>
        </div>
      </div>

      {/* Recommended Order & Technical Info Banner */}
      <div className="bg-[#16823B]/10 border border-[#16823B]/20 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-[#17231B]">
        <Info className="w-5 h-5 text-[#16823B] shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="font-bold text-[#16823B] text-sm">
            Aturan Teknis Unggah & Rekonsiliasi CAPEX:
          </p>
          <ul className="text-[#5F6B63] space-y-1 text-xs list-disc pl-4">
            <li>
              <strong>Memory-Only:</strong> File Excel diproses langsung dari memori ke PostgreSQL tanpa disimpan ke penyimpanan disk/server.
            </li>
            <li>
              <strong>Metode Replace:</strong> Data <span className="font-semibold text-[#17231B]">Created, PO, Budget, dan Purchasing</span> menggunakan metode <em>replace</em> (mengosongkan data lama lalu memasukkan batch baru).
            </li>
            <li>
              <strong>Metode Upsert:</strong> Data <span className="font-semibold text-[#17231B]">Kategori & User Approver</span> menggunakan metode <em>upsert</em> (hanya memperbarui / menambah data baru tanpa menghapus data yang sudah ada).
            </li>
            <li>
              <strong>Auto-Reconciliation:</strong> Tabel <span className="font-semibold text-[#17231B]">Total</span> akan otomatis direkonsiliasi setelah upload Created/PO/Budget selesai. Status manual <span className="font-semibold text-emerald-700">Sudah Close</span> tetap dipertahankan.
            </li>
            <li>
              <strong>Auto-Sync Master:</strong> Jika pada file <span className="font-semibold text-[#17231B]">Created</span> terdapat <em>kode approver</em> atau <em>capex_no</em> yang belum terdaftar, sistem akan otomatis mendaftarkannya ke tabel <span className="font-semibold text-[#17231B]">User Approver</span> dan <span className="font-semibold text-[#17231B]">Kategori</span>.
            </li>
          </ul>
        </div>
      </div>

      {/* Grid of 6 Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.map((card) => {
          const currentProgress = progressState[card.title];
          const isUploading = currentProgress?.status === "uploading" || currentProgress?.status === "validating";
          const isSuccess = currentProgress?.status === "success";
          const isError = currentProgress?.status === "error";

          return (
            <div
              key={card.title}
              className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Card Title & Frequency Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#17231B]">{card.title}</h3>
                      <span className="text-[10px] text-[#89938D]">Format .xlsx, .xls, .csv</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${card.frequencyBadgeColor}`}
                  >
                    {card.frequencyLabel}
                  </span>
                </div>

                <p className="text-[11px] text-[#5F6B63] mb-4 min-h-[32px] leading-relaxed">
                  {card.desc}
                </p>

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
                      <span className="text-[#17231B] truncate max-w-[170px]" title={currentProgress.fileName}>
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
                          <span className="text-emerald-700 font-medium leading-tight">
                            {currentProgress.message}
                          </span>
                        </>
                      ) : isError ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="text-rose-700 font-medium leading-tight">
                            {currentProgress.message}
                          </span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-[#16823B] animate-spin shrink-0 mt-0.5" />
                          <span className="leading-tight">{currentProgress.message}</span>
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
