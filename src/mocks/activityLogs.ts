import { ActivityLogItem } from "@/types/activityLog";

export const mockActivityLogs: ActivityLogItem[] = [
  {
    id: "LOG-1001",
    timestamp: "17 Aug 2026, 08:15",
    adminUsername: "admin",
    action: "UPLOAD_DATA",
    dataSource: "Data Lokasi",
    fileName: "Data_Lokasi_Q3_2026.xlsx",
    description: "Upload berhasil (8 baris data lokasi diperbarui)",
  },
  {
    id: "LOG-1002",
    timestamp: "17 Aug 2026, 08:10",
    adminUsername: "admin",
    action: "UPLOAD_DATA",
    dataSource: "Data SBT",
    fileName: "Standar_Biaya_SBT_2026.xlsx",
    description: "Upload berhasil (8 standar biaya diperbarui)",
  },
  {
    id: "LOG-1003",
    timestamp: "17 Aug 2026, 08:05",
    adminUsername: "admin",
    action: "UPLOAD_DATA",
    dataSource: "Data Aktivitas",
    fileName: "Detail_Aktivitas_Lapangan.csv",
    description: "Upload berhasil (8 aktivitas terdaftar)",
  },
  {
    id: "LOG-1004",
    timestamp: "17 Aug 2026, 08:00",
    adminUsername: "admin",
    action: "LOGIN",
    dataSource: "-",
    description: "Login berhasil dari IP 192.168.1.45",
  },
  {
    id: "LOG-1005",
    timestamp: "16 Aug 2026, 17:30",
    adminUsername: "admin",
    action: "VALIDATE_DATA",
    dataSource: "Data Lokasi",
    description: "Validasi kolom dan tipe data selesai (0 warning)",
  },
];
