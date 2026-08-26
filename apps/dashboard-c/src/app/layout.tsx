import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard C | Audit Finansial & Laporan Eksekutif",
  description: "Modul Audit Finansial & Laporan Eksekutif",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
