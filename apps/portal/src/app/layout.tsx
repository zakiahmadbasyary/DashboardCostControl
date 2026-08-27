import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GGF AgroMetric Platform | Enterprise Portal",
  description: "Portal Utama Akses Seluruh Dashboard Analytics & Management",
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
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
