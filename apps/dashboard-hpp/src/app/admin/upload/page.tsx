"use client";

import { useState, useRef } from "react";
import { hppUploadService, HppDataCategory, UploadProgress } from "@/services/hppUploadService";
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
  Database,
  Layers,
  MapPin,
  Activity,
  Table as TableIcon,
} from "lucide-react";

export default function HppAdminUploadPage() {
  const [progressState, setProgressState] = useState<Record<HppDataCategory, UploadProgress | null>>({
    MasterSheet: null,
    "Data Budget": null,
    "Data Lokasi HPP": null,
    "Data Aktivitas HPP": null,
  });

  const [resetModalCategory, setResetModalCategory] = useState<HppDataCategory | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const fileInputRefs = {
    MasterSheet: useRef<HTMLInputElement | null>(null),
    "Data Budget": useRef<HTMLInputElement | null>(null),
    "Data Lokasi HPP": useRef<HTMLInputElement | null>(null),
    "Data Aktivitas HPP": useRef<HTMLInputElement | null>(null),
  };

  const handleFileChange = async (category: HppDataCategory, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await hppUploadService.uploadSourceFile(category, file, (progress) => {
      setProgressState((prev) => ({ ...prev, [category]: progress }));
    });

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleCardClick = (category: HppDataCategory) => {
    const currentProgress = progressState[category];
    const isUploading = currentProgress?.status === "uploading" || currentProgress?.status === "validating";
    if (isUploading) return;

    fileInputRefs[category].current?.click();
  };

  const handleDownloadTemplate = (category: HppDataCategory) => {
    let categoryKey = "mastersheet";
    if (category === "Data Budget") categoryKey = "budget";
    if (category === "Data Lokasi HPP") categoryKey = "lokasi";
    if (category === "Data Aktivitas HPP") categoryKey = "aktivitas";

    window.open(`/api/admin/template?category=${categoryKey}`, "_blank");
  };

  const handleConfirmReset = async () => {
    if (!resetModalCategory) return;
    const category = resetModalCategory;
    setResetting(true);

    try {
      const res = await hppUploadService.resetCategoryData(category);

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

  const handleTriggerSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/hpp/seed", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") {
        setSeedMessage(data.message);
      } else {
        setSeedMessage(`Error: ${data.message}`);
      }
    } catch (e: any) {
      setSeedMessage(`Gagal seeding: ${e.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const uploadCards: { title: HppDataCategory; step: number; desc: string; icon: any; sampleFile: string }[] = [
    {
      title: "MasterSheet",
      step: 1,
      desc: "Upload data master lokasi, wilayah (W01–W07), kode bibit, jenis bibit, dan kelas bibit.",
      icon: TableIcon,
      sampleFile: "template_mastersheet_hpp.xlsx",
    },
    {
      title: "Data Budget",
      step: 2,
      desc: "Upload anggaran budget per periode 1–12, group (ZN01–ZN04), dan status (NSSC/NFSC).",
      icon: Layers,
      sampleFile: "template_budget_hpp.xlsx",
    },
    {
      title: "Data Lokasi HPP",
      step: 3,
      desc: "Upload data lokasi HPP per periode, qty panen, luas panen, luas aktif, dan total biaya.",
      icon: MapPin,
      sampleFile: "template_lokasi_hpp.xlsx",
    },
    {
      title: "Data Aktivitas HPP",
      step: 4,
      desc: "Upload rincian aktivitas pekerjaan, tanggal tanam/forcing/panen, biaya, hasil, dan UoM.",
      icon: Activity,
      sampleFile: "template_aktivitas_hpp.xlsx",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Excel Dashboard HPP</h1>
          <p className="text-xs text-[#5F6B63] mt-1">
            Unggah file Excel (.xlsx / .csv) untuk memperbarui database Prisma PostgreSQL secara otomatis.
          </p>
        </div>

        {/* Quick Seed Simulation Button */}
        <button
          onClick={handleTriggerSeed}
          disabled={seeding}
          className="px-4 py-2 bg-[#16823B] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0B6B32] disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>{seeding ? "Memproses Simulation Seed..." : "Isi Data Simulasi Komprehensif"}</span>
        </button>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Grid 4 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {uploadCards.map((card) => {
          const progress = progressState[card.title];
          const isUploading = progress?.status === "uploading" || progress?.status === "validating";
          const isSuccess = progress?.status === "success";
          const isError = progress?.status === "error";
          const IconComp = card.icon;

          return (
            <div
              key={card.title}
              className={`bg-white border rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between ${
                isSuccess
                  ? "border-emerald-300 bg-emerald-50/20"
                  : isError
                  ? "border-rose-300 bg-rose-50/20"
                  : "border-[#DDE5DF] hover:border-[#16823B]"
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#EAF3EC] text-[#16823B] text-xs font-black">
                      0{card.step}
                    </span>
                    <h3 className="font-extrabold text-[#17231B] text-sm flex items-center gap-1.5">
                      <IconComp className="w-4 h-4 text-[#16823B]" />
                      <span>{card.title}</span>
                    </h3>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setResetModalCategory(card.title);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title={`Kosongkan data ${card.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#5F6B63] mb-4 leading-relaxed">{card.desc}</p>

                {/* Upload Drag Drop Area */}
                <div
                  onClick={() => handleCardClick(card.title)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
                    isUploading
                      ? "border-amber-400 bg-amber-50/40"
                      : isSuccess
                      ? "border-emerald-400 bg-emerald-50/40"
                      : isError
                      ? "border-rose-400 bg-rose-50/40"
                      : "border-[#DDE5DF] hover:border-[#16823B] bg-[#F8FAF9] hover:bg-[#F2F6F3]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRefs[card.title]}
                    onChange={(e) => handleFileChange(card.title, e)}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />

                  {isUploading ? (
                    <div className="space-y-2 w-full max-w-xs">
                      <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-amber-900">{progress?.message}</p>
                      <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full transition-all duration-300"
                          style={{ width: `${progress?.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : isSuccess ? (
                    <div className="space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-xs font-extrabold text-emerald-900">Upload Berhasil!</p>
                      <p className="text-[11px] text-emerald-700 font-medium">{progress?.message}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold text-[#16823B] underline">
                        Klik untuk upload ulang
                      </span>
                    </div>
                  ) : isError ? (
                    <div className="space-y-1">
                      <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                      <p className="text-xs font-extrabold text-rose-900">Upload Gagal</p>
                      <p className="text-[11px] text-rose-700 font-medium">{progress?.message}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold text-rose-800 underline">
                        Coba upload berkas lagi
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-white rounded-xl text-[#16823B] border border-[#DDE5DF] shadow-2xs inline-block">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-[#17231B]">Pilih File Excel (.xlsx / .csv)</p>
                      <p className="text-[10px] text-[#8C9890]">Klik di sini atau seret berkas ke area ini</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Download Template */}
              <div className="mt-4 pt-3 border-t border-[#EAEFEB] flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-[#5F6B63] flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  Format: .xlsx / .csv
                </span>

                <button
                  onClick={() => handleDownloadTemplate(card.title)}
                  className="text-[11px] font-bold text-[#16823B] hover:text-[#0B6B32] inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template Excel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Reset Modal */}
      {resetModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DDE5DF] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#17231B]">
                Kosongkan Data {resetModalCategory}?
              </h3>
            </div>

            <p className="text-xs text-[#5F6B63] leading-relaxed">
              Tindakan ini akan menghapus seluruh data pada kategori <strong>{resetModalCategory}</strong> dari database Prisma PostgreSQL. Anda dapat mengunggah ulang data kapan saja.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAEFEB]">
              <button
                onClick={() => setResetModalCategory(null)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl border border-[#DDE5DF] bg-white text-xs font-bold text-[#5F6B63] hover:bg-[#F7F9F7] cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmReset}
                disabled={resetting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {resetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{resetting ? "Mengosongkan..." : "Ya, Hapus Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
