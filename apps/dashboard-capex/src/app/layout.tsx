import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard CAPEX | Capital Expenditure",
  description: "Modul Manajemen & Pengawasan Belanja Modal (Capital Expenditure)",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#F7F9F7] text-[#17231B]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
