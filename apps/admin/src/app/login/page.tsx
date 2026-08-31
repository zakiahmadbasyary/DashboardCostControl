"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan login");
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-[#16823B] selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#16823B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#A8D437]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-[#DDE5DF] rounded-3xl p-8 sm:p-10 shadow-lg shadow-black/5 relative z-10">
        {/* Back Button to Portal */}
        <div className="mb-6">
          <a
            href={portalUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5F6B63] hover:text-[#17231B] bg-[#F8FAF9] hover:bg-[#EEF4F0] border border-[#DDE5DF] transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#16823B]" />
            <span>Kembali ke Portal Utama</span>
          </a>
        </div>

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="h-18 sm:h-20 w-auto flex items-center justify-center">
              <img
                src="/logo.png"
                alt="GGF Logo"
                className="h-18 sm:h-20 max-h-20 w-auto object-contain"
                style={{ height: "72px", maxHeight: "80px", width: "auto" }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#17231B] tracking-tight">Admin Pusat</h1>
          <p className="text-xs text-[#5F6B63] mt-1 font-medium">GGF AgroMetric Platform Single Sign-On</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} suppressHydrationWarning className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#2C3830] uppercase tracking-wider mb-2">
              Username Admin
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3.5 text-[#5F6B63]" />
              <input
                type="text"
                required
                suppressHydrationWarning
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl py-3 pl-11 pr-4 text-sm text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] focus:bg-white focus:ring-2 focus:ring-[#16823B]/10 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C3830] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-[#5F6B63]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                suppressHydrationWarning
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8FAF9] border border-[#DDE5DF] rounded-xl py-3 pl-11 pr-11 text-sm text-[#17231B] placeholder-[#89938D] focus:outline-none focus:border-[#16823B] focus:bg-white focus:ring-2 focus:ring-[#16823B]/10 transition-all font-medium"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#5F6B63] hover:text-[#17231B] transition-colors focus:outline-none"
                title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="w-full py-3.5 px-4 rounded-xl bg-[#16823B] hover:bg-[#126B30] text-white font-semibold text-sm transition-all shadow-sm shadow-[#16823B]/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Masuk ke Admin Pusat <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#89938D] mt-8">
          © 2026 GGF AgroMetric Platform. Enterprise Cost Control.
        </p>
      </div>
    </div>
  );
}
