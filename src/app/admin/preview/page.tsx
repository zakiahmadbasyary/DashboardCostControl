"use client";

import { useState, useEffect } from "react";
import { previewService } from "@/services/previewService";
import { LocationSourceItem, SbtSourceItem, ActivitySourceItem } from "@/types/sourceData";
import { Search, Layers, ListChecks, MapPin } from "lucide-react";

type TabType = "location" | "sbt" | "activity";

export default function AdminPreviewPage() {
  const [activeTab, setActiveTab] = useState<TabType>("location");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [locationData, setLocationData] = useState<LocationSourceItem[]>([]);
  const [sbtData, setSbtData] = useState<SbtSourceItem[]>([]);
  const [activityData, setActivityData] = useState<ActivitySourceItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "location") {
          const res = await previewService.getLocationData(searchQuery);
          setLocationData(res);
        } else if (activeTab === "sbt") {
          const res = await previewService.getSbtData(searchQuery);
          setSbtData(res);
        } else if (activeTab === "activity") {
          const res = await previewService.getActivityData(searchQuery);
          setActivityData(res);
        }
      } catch (err) {
        console.error("Error fetching preview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Preview Data Sumber</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Inspeksi tabel mentah hasil unggahan data lokasi, acuan SBT, dan aktivitas operasional.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDE5DF] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("location")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "location"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Data Lokasi ({locationData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sbt")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sbt"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Data SBT ({sbtData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-[#16823B] text-white shadow-xs"
                  : "bg-[#F7F9F7] text-[#5F6B63] hover:text-[#17231B]"
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Data Aktivitas ({activityData.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#89938D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci..."
              className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#17231B] focus:outline-none focus:border-[#16823B]"
            />
          </div>
        </div>

        {/* Data Table Content */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#5F6B63]">Memuat preview data...</p>
          </div>
        ) : (
          <div>
            {activeTab === "location" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Luas</th>
                      <th className="py-2.5 px-3">Umur</th>
                      <th className="py-2.5 px-3">Jenis Bibit</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                      <th className="py-2.5 px-3">Group Cost</th>
                      <th className="py-2.5 px-3 text-right">Cost / Ha</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3">Pupuk</th>
                      <th className="py-2.5 px-3">Code SBT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {locationData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.id}</td>
                        <td className="py-2.5 px-3 font-bold">{item.lokasi}</td>
                        <td className="py-2.5 px-3">{item.wilayah}</td>
                        <td className="py-2.5 px-3">{item.status}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{item.luas} Ha</td>
                        <td className="py-2.5 px-3">{item.umur} Bln</td>
                        <td className="py-2.5 px-3 font-medium">{item.jenisBibit}</td>
                        <td className="py-2.5 px-3">{item.kelasBibit}</td>
                        <td className="py-2.5 px-3 font-medium">{item.groupCost}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          Rp {item.costHa.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {item.cost.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-[#5F6B63]">{item.pupuk}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#16823B] font-medium">{item.codeSbt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "sbt" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Kode SBT</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Pupuk</th>
                      <th className="py-2.5 px-3">Jenis Bibit</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                      <th className="py-2.5 px-3">Group Cost</th>
                      <th className="py-2.5 px-3">Umur</th>
                      <th className="py-2.5 px-3 text-right">Nilai SBT (Rp / Ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {sbtData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.id}</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-[#16823B]">{item.codeSbt}</td>
                        <td className="py-2.5 px-3">{item.status}</td>
                        <td className="py-2.5 px-3">{item.pupuk}</td>
                        <td className="py-2.5 px-3">{item.jenis}</td>
                        <td className="py-2.5 px-3">{item.kelas}</td>
                        <td className="py-2.5 px-3 font-medium">{item.groupCost}</td>
                        <td className="py-2.5 px-3">{item.umur} Bln</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {item.nilaiSbt.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Lokasi</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Wilayah</th>
                      <th className="py-2.5 px-3 text-right">Luas (Ha)</th>
                      <th className="py-2.5 px-3">Kelas Bibit</th>
                      <th className="py-2.5 px-3">Aktivitas</th>
                      <th className="py-2.5 px-3 text-right">Total Biaya (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Cost / Ha (Rp)</th>
                      <th className="py-2.5 px-3">Group Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
                    {activityData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F7F9F7]">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6B63]">{item.id}</td>
                        <td className="py-2.5 px-3 font-bold">{item.lokasi}</td>
                        <td className="py-2.5 px-3">{item.status}</td>
                        <td className="py-2.5 px-3">{item.wilayah}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#5F6B63]">{item.luas} Ha</td>
                        <td className="py-2.5 px-3">{item.kelasBibit}</td>
                        <td className="py-2.5 px-3 font-bold">{item.aktivitas}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16823B]">
                          Rp {(item.biaya || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold">
                          Rp {item.costHa.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 font-medium">{item.groupCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
