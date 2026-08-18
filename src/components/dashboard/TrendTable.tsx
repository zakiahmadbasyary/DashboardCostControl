"use client";

import { TrendDataPoint } from "@/types/dashboard";
import { Table } from "lucide-react";

interface TrendTableProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

const REGIONS = ["AW01", "AW02", "AW03", "AW04", "AW05", "AW06", "AW07"];

export default function TrendTable({ data, loading }: TrendTableProps) {
  // Transpose data to region -> ages 1..20
  const regionRows = REGIONS.map((region) => {
    const ageValues = data.map((point) => point[region] ?? 0);
    return {
      region,
      values: ageValues,
    };
  });

  return (
    <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 shadow-xs mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Table className="w-4 h-4 text-[#16823B]" />
        <h3 className="font-bold text-sm text-[#17231B] uppercase tracking-wider">Tabel Data Trend Cost per Wilayah (Juta Rp / Ha)</h3>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#16823B] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#5F6B63]">Memperbarui data tabel trend cost...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DDE5DF]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#F7F9F7] text-[#17231B] uppercase font-bold border-b border-[#DDE5DF]">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-[#F7F9F7] z-10 border-r border-[#DDE5DF]">Wilayah</th>
                {Array.from({ length: 22 }, (_, i) => (
                  <th key={i} className="py-2.5 px-3 text-center border-r border-[#DDE5DF]/60 min-w-[50px]">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5DF]/60 text-[#17231B]">
              {regionRows.map((row) => (
                <tr key={row.region} className="hover:bg-[#F7F9F7]/80 transition-colors">
                  <td className="py-2 px-3 font-bold sticky left-0 bg-white shadow-xs border-r border-[#DDE5DF]">
                    {row.region}
                  </td>
                  {row.values.map((val, idx) => (
                    <td key={idx} className="py-2 px-2 text-center border-r border-[#DDE5DF]/40 font-mono text-[11px]">
                      {val.toFixed(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
