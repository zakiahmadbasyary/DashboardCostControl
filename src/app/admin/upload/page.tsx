"use client";

import { useState } from "react";
import { uploadService } from "@/services/uploadService";
import { UploadProgress } from "@/types/sourceData";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

type DataSourceCategory = "Data Lokasi" | "Data SBT" | "Data Aktivitas";

export default function AdminUploadPage() {
  const [selectedCategory, setSelectedCategory] = useState<DataSourceCategory>("Data Lokasi");
  const [progressState, setProgressState] = useState<Record<DataSourceCategory, UploadProgress | null>>({
    "Data Lokasi": null,
    "Data SBT": null,
    "Data Aktivitas": null,
  });

  const handleSimulateFileSelect = async (category: DataSourceCategory, customFileName?: string) => {
    const dummyFileName = customFileName || `${category.replace(" ", "_")}_2026.xlsx`;
    const dummyFile = new File(["dummy content"], dummyFileName, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await uploadService.uploadSourceFile(category, dummyFile, (progress) => {
      setProgressState((prev) => ({ ...prev, [category]: progress }));
    });
  };

  const uploadCards: { title: DataSourceCategory; desc: string; sampleFile: string }[] = [
    {
      title: "Data Lokasi",
      desc: "Upload data lokasi, cost per Ha, luas, umur tanaman, dan kelas bibit.",
      sampleFile: "Data_Lokasi_WIP_2026.xlsx",
    },
    {
      title: "Data SBT",
      desc: "Upload acuan Standar Biaya Tanaman (SBT) per kelompok aktivitas.",
      sampleFile: "Standar_Biaya_SBT_2026.xlsx",
    },
    {
      title: "Data Aktivitas",
      desc: "Upload rincian aktivitas lapangan dan biaya operasional per kelas.",
      sampleFile: "Detail_Aktivitas_Lapangan.csv",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Upload Data Sumber</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Pilih dan unggah file Excel/CSV data lokasi, SBT, atau aktivitas untuk memperbarui database analisis.
        </p>
      </div>

      {/* Grid of 3 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {uploadCards.map((card) => {
          const currentProgress = progressState[card.title];
          const isUploading = currentProgress?.status === "uploading" || currentProgress?.status === "validating";

          return (
            <div
              key={card.title}
              className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#17231B]">{card.title}</h3>
                    <span className="text-[10px] text-[#89938D]">Format .xlsx, .xls, .csv</span>
                  </div>
                </div>
                <p className="text-xs text-[#5F6B63] mb-5">{card.desc}</p>

                {/* Dropzone Simulation */}
                <div
                  onClick={() => !isUploading && handleSimulateFileSelect(card.title, card.sampleFile)}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isUploading
                      ? "border-amber-300 bg-amber-50/40 cursor-wait"
                      : currentProgress?.status === "success"
                      ? "border-emerald-300 bg-emerald-50/40"
                      : "border-[#DDE5DF] hover:border-[#16823B] bg-[#F7F9F7] hover:bg-[#16823B]/5"
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-[#16823B] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#17231B]">Klik atau Drag & Drop File</p>
                  <p className="text-[11px] text-[#89938D] mt-0.5">Contoh: {card.sampleFile}</p>
                </div>
              </div>

              {/* Progress & Status Indicator */}
              <div className="mt-5 pt-4 border-t border-[#DDE5DF]">
                {currentProgress ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#17231B] truncate max-w-[180px]">{currentProgress.fileName}</span>
                      <span className="text-[#16823B]">{currentProgress.progressPercentage}%</span>
                    </div>

                    <div className="w-full bg-[#EAEFEF] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#16823B] h-full transition-all duration-300"
                        style={{ width: `${currentProgress.progressPercentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#5F6B63] flex items-center gap-1.5">
                      {currentProgress.status === "success" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-emerald-700 font-medium">{currentProgress.message}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-[#16823B] animate-spin shrink-0" />
                          <span>{currentProgress.message}</span>
                        </>
                      )}
                    </p>

                    {currentProgress.status === "success" && (
                      <button
                        onClick={() => handleSimulateFileSelect(card.title, `Replace_${card.sampleFile}`)}
                        className="mt-2 text-[11px] font-bold text-[#16823B] hover:underline cursor-pointer"
                      >
                        Replace / Re-upload File
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#89938D]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Belum ada file yang diunggah</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
