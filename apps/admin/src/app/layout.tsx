import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Pusat | GGF AgroMetric Platform",
  description: "Manajemen Autentikasi Terpusat, Pengguna Administrator, dan Hak Akses Dashboard",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#F7F9F7] text-[#17231B] selection:bg-[#16823B] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
