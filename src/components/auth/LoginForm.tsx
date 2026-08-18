"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Leaf, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ username, password });

      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/admin/upload");
        }, 500);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat memproses login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#16823B] text-[#A8D437] shadow-lg shadow-[#16823B]/20 mb-3">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#17231B] tracking-tight">GGF AgroMetric Admin</h1>
          <p className="text-xs text-[#5F6B63] mt-1">Masuk untuk mengelola data sumber & melihat log aktivitas</p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wider">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#89938D] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#89938D] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                />
              </div>
            </div>

            {/* Dummy Account Helper */}
            <div className="p-3 rounded-xl bg-[#F7F9F7] border border-[#DDE5DF] text-[11px] text-[#5F6B63] space-y-1">
              <p className="font-semibold text-[#16823B]">💡 Credential Frontend Phase:</p>
              <p>Username: <code className="font-mono font-bold text-[#17231B]">admin</code></p>
              <p>Password: <code className="font-mono font-bold text-[#17231B]">admin123</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#16823B] hover:bg-[#0B6B32] text-white font-bold text-sm transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Login...</span>
                </>
              ) : (
                <span>Masuk ke Admin Panel</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#DDE5DF] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#5F6B63] hover:text-[#16823B] font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Public Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
